from typing import Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorCollection
from bson import ObjectId
from pymongo import ASCENDING, DESCENDING
from datetime import datetime, timedelta
from fastapi import HTTPException, status, Request, Response
from fastapi.responses import JSONResponse
from passlib.context import CryptContext
import random

from db.config import get_database
from constants.password_constants import PASSWORD_OTP_EXPIRE_MINUTES

from utils.auth.jwt import create_access_token, set_auth_cookies
from utils.json.serialize_json import serialize_mongo_document
from utils.logger import logger

from models.user import UserBase, UserInDB, UserResponse, UserResponse, OnBoardingDetails,OnBoardingRequest, OnBoardingResponse, GeoLocationDetails

from crud.profile import get_profile_details

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCRUD:
    def __init__(self, db:AsyncIOMotorCollection):
        self.db = db
        self.collection = self.db["users"]

    def _ensure_onboarding_details(self, user_data: dict, is_new_user: bool = False) -> dict:
        """
        Ensure onboarding_details exists and is properly formatted.
        For existing users without onboarding_details, create default values.
        For new users, initialize with default values.
        """
        if "onboarding_details" not in user_data or user_data["onboarding_details"] is None:
            # For existing users, set as completed to avoid forcing them through onboarding
            # For new users, set as not_started to require onboarding
            default_status = "not_started" 
            default_step = 1 
            resume_uploaded = False if is_new_user else True

            onboarding_details = {
                "status": default_status,
                "step": default_step,
                "completed_at": None,
                "career_stage": None,
                "roles": None,
                "usage_for": None,
                "referral": None,
                "resume_uploaded": resume_uploaded
            }
        return onboarding_details
    
    async def find_user_by_id(self,id) -> UserInDB:
        user = await self.collection.find_one({"_id": ObjectId(id)})
        return serialize_mongo_document(user)

    async def find_user_by_email(self, email: str) -> Optional[UserInDB]:
        user = await self.collection.find_one({"email": email})

        if user:
            user["id"] = str(user.pop("_id"))  
            
            return UserInDB(**user)

        return None

    async def find_users_by_query(self, query:Dict[str,Any],offset:int=0,limit:int=20,sort_by: str = "created_at", sort_order: str = "desc",):
        order = DESCENDING if sort_order.lower() == "desc" else ASCENDING
        users_cursor = self.collection.find(query).sort(sort_by,order).skip(offset).limit(limit)
        users = []
        async for doc in users_cursor:
            doc = serialize_mongo_document(doc)
            users.append(doc)

        return users

    async def count_users(self) -> int:
        """
        Returns the total number of users in the database.
        """
        return await self.collection.count_documents({})

    async def create_user(self, user: UserBase) -> UserInDB:
        # Convert Pydantic model to dictionary before making changes
        user_dict = user.model_dump(exclude={"password"})

        if user.provider == "email" and user.password:
            user_dict["hashed_password"] = pwd_context.hash(user.password)

        user_dict["created_at"] = datetime.utcnow()
        
        # Initialize onboarding_details for new users
        onboarding_details = self._ensure_onboarding_details(user_dict, is_new_user=True)
        user_dict["onboarding_details"] = onboarding_details
        result = await self.collection.insert_one(user_dict)

        created_user = await self.collection.find_one({"_id": result.inserted_id})

        if created_user:
            created_user["id"] = str(created_user["_id"])
            del created_user["_id"]
            return UserInDB(**created_user)

        return None
    
    async def update_user_details(self,user_id:str,update_obj:Dict[str,Any]):
        try:
            user_id = ObjectId(user_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID format")  

        result = await self.collection.update_one(
            {"_id": user_id},
            {"$set": update_obj},
        )

        if not result:
            raise HTTPException(status_code=404, detail="User not found")

        if result.modified_count > 0:
            updated_user = await self.collection.find_one({"_id": user_id})
            return serialize_mongo_document(updated_user)
        else:
            raise HTTPException(status_code=400, detail="Failed to update onboarding details")

    async def update_onboarding_details(self, user_id: str, onboarding_details: OnBoardingRequest) -> bool:
        """
        Update onboarding details for a user.
        """
        onboarding_dict = onboarding_details.model_dump()
        onboarding_dict["status"] = "not_started"
        onboarding_dict["completed_at"] = None

        result = await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"onboarding_details": onboarding_dict}}
        )
        
        if result.modified_count > 0:
            updated_user = await self.collection.find_one({"_id": ObjectId(user_id)}, {"onboarding_details": 1, "_id": 0})
            return updated_user.get("onboarding_details")
        else:
            raise HTTPException(status_code=400, detail="Failed to update onboarding details")
        
    async def mark_onboarding_completed(self, user_id: str) -> dict:
        """
        Mark onboarding as completed, step = 3, resume_uploaded = True.
        """
        update_fields = {
            "onboarding_details.step": 3,
            "onboarding_details.status": "completed",
            "onboarding_details.resume_uploaded": True,
            "onboarding_details.completed_at": datetime.utcnow()
        }

        result = await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_fields}
        )

        if result.modified_count > 0:
            updated_user = await self.collection.find_one(
                {"_id": ObjectId(user_id)},
                {"onboarding_details": 1, "_id": 0}
            )
            return updated_user.get("onboarding_details")
        else:
            raise HTTPException(status_code=400, detail="Failed to mark onboarding as completed")
    
    async def get_onboarding_details(self, user_id: str) -> OnBoardingResponse:
        result = await self.collection.find_one({"_id": ObjectId(user_id)})
        if not result or "onboarding_details" not in result:
            return OnBoardingResponse(
                status="not_completed",
                step=1,
                resume_uploaded=True
            )

        onboarding = result["onboarding_details"]
        return OnBoardingResponse(
            status=onboarding.get("status"),
            step=onboarding.get("step"),
            resume_uploaded=onboarding.get("resume_uploaded")
        )

    async def generate_otp(self, email: str) -> str:
        """
        Generate a 6-digit OTP, store it with timestamp, and return it.
        """        
        # Generate a 6-digit OTP
        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        current_time = datetime.utcnow()
        
        # Update the user record with the new OTP and timestamp
        result = await self.collection.update_one(
            {"email": email},
            {
                "$set": {
                    "otp": otp,
                    "otp_sent_at": current_time,
                    "is_verified": False,
                    "verified_at": None
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return otp

    async def verify_otp(self, email: str, otp: str) -> bool:
        """
        Verify OTP for password reset.
        OTP is valid only if it's correct and was created within the last 120 seconds.
        """
        user = await self.collection.find_one({"email": email})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        stored_otp = user.get("otp")
        otp_sent_at = user.get("otp_sent_at")
        
        # Check if OTP exists and matches
        if not stored_otp or stored_otp != otp:
            return False
        
        # Check if OTP is still valid (within 120 seconds)
        current_time = datetime.utcnow()
        if not otp_sent_at or current_time - otp_sent_at > timedelta(seconds=PASSWORD_OTP_EXPIRE_MINUTES*60):
            return False
        
        # Update user's verification status
        await self.collection.update_one(
            {"email": email},
            {
                "$set": {
                    "is_verified": True,
                    "verified_at": current_time
                }
            }
        )
        
        return True

    async def get_user_verification_status(self, email: str) -> bool:
        """
        Check if user has verified OTP and that the verification time is after the OTP was sent.
        """
        user = await self.collection.find_one({"email": email})

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        is_verified = user.get("is_verified", False)
        verified_at = user.get("verified_at")
        otp_sent_at = user.get("otp_sent_at")

        if not is_verified:
            return False

        if not verified_at or not otp_sent_at:
            return False

        # Ensure verified_at is after otp_sent_at
        if verified_at <= otp_sent_at:
            return False

        return True

    async def reset_password(self, email: str, new_password: str) -> bool:
        """
        Reset user password after OTP verification.
        Args:
            email: User email address
            new_password: New password to set
        Returns:
            bool: True if password was reset successfully
        Raises:
            HTTPException: If user not found or not verified
        """    
        hashed_password = pwd_context.hash(new_password)
        
        result = await self.collection.update_one(
            {"email": email},
            {
                "$set": {
                    "hashed_password": hashed_password,
                    "is_verified": False  
                }
            }
        )
        
        return result.modified_count > 0

async def find_or_create_user(request: Request,response: Response, user: UserBase) -> UserResponse:
    db = await get_database()
    user_crud = UserCRUD(db)
    user_details = await user_crud.find_user_by_email(user.email)
    user_status = "new"
    
    if user_details:
        user_status = "existing"
        if user_details.provider != user.provider:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already exists with a different provider.",
            )
    else:  
        user_details = await user_crud.create_user(user)
        
    user_id = user_details.id
    # Create session
    session_service = request.app.session_service
    session_id = await session_service.create_session(request,user_id=str(user_id))

    # Generate access token
    access_token = create_access_token(
        data={
            "sub": user_details.email,
            "user_id": user_id,
            "session_id" : session_id
        }
    )
    # Set cookies
    set_auth_cookies(response, access_token)

    profile_details = await get_profile_details(user_id)
    profile_status = "existing" if profile_details else "new"

    # Get onboarding status
    onboarding_response = None
    if user_details.onboarding_details:
        onboarding_response = OnBoardingResponse(
            status=user_details.onboarding_details.status,
            step=user_details.onboarding_details.step,
            resume_uploaded=user_details.onboarding_details.resume_uploaded
        )
    else:
        onboarding_details = user_crud._ensure_onboarding_details(user_details,False)
        onboarding_response = OnBoardingResponse(
            status=onboarding_details.get("status"),
            step=onboarding_details.get("step"),
            resume_uploaded=onboarding_details.get("resume_uploaded")
        )

    return UserResponse(
        id=user_id,
        email=user_details.email,
        provider=user_details.provider,
        name=user_details.name,
        created_at=user_details.created_at,
        status=profile_status,
        token=access_token,
        onboarding_details=onboarding_response,
    )

# Sign Up Function
async def signUpUser(request: Request,response: Response, user: UserBase) -> UserResponse:
    db = await get_database()
    user_crud = UserCRUD(db)

    # Handle OAuth-based authentication
    if user.provider in ["google", "linkedin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid provider found.",
        )

    # Check if the user already exists
    existing_user = await user_crud.find_user_by_email(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists.",
        )
    
    # Validate password for email-based authentication
    if user.provider == "email" and user.password is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required for email-based authentication.",
        )

    # Create the user
    created_user = await user_crud.create_user(user)
    user_id = created_user.id

    session_service = request.app.session_service
    # Create session
    session_id = await session_service.create_session(request,user_id=str(user_id))

    # Generate access token
    access_token = create_access_token(
        data={
            "sub": created_user.email,
            "user_id": user_id,
            "session_id" : session_id
        }
    )
    
    # Set cookies
    set_auth_cookies(response, access_token)
    
    onboarding_response = None
    if created_user.onboarding_details:
        onboarding_response = OnBoardingResponse(
            status=created_user.onboarding_details.status,
            step=created_user.onboarding_details.step,
            resume_uploaded=created_user.onboarding_details.resume_uploaded
        )
    else:
        onboarding_details = user_crud._ensure_onboarding_details(created_user,True)
        onboarding_response = OnBoardingResponse(
            status=onboarding_details.get("status"),
            step=onboarding_details.get("step"),
            resume_uploaded=onboarding_details.get("resume_uploaded")
        )
    
    # Return the new user details
    return UserResponse(
        id=user_id,
        email=created_user.email,
        provider=created_user.provider,
        name=created_user.name,
        created_at=created_user.created_at,
        status="new",
        onboarding_details=onboarding_response,
    )

# Sign In Function
async def signIn(request: Request,response: Response, email: str, password: Optional[str] = None, provider: str = "email") -> UserResponse:
    db = await get_database()
    user_crud = UserCRUD(db)

    # Handle OAuth-based authentication
    if provider in ["google", "linkedin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid provider found.",
        )
    
    # Check if the user exists
    existing_user = await user_crud.find_user_by_email(email)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    
    if provider != existing_user.provider:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"User already exists.Try signing in with your {existing_user.provider} account",
        )

    # Handle email/password authentication
    if provider == "email":
        if not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is required for email-based authentication.",
            )
        if not pwd_context.verify(password, existing_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password.",
            )
        
    session_service = request.app.session_service
    # Create session
    session_id = await session_service.create_session(request,user_id=str(existing_user.id))

    # Generate access token
    access_token = create_access_token(
        data={
            "sub": existing_user.email,
            "user_id": existing_user.id,
            "session_id" : session_id
        }
    )
    
    # Set cookies
    set_auth_cookies(response, access_token)

    profile_details = await get_profile_details(existing_user.id)
    profile_status = "existing" if profile_details else "new"

    # Get onboarding status
    onboarding_response = None
    if existing_user.onboarding_details:
        onboarding_response = OnBoardingResponse(
            status=existing_user.onboarding_details.status,
            step=existing_user.onboarding_details.step,
            resume_uploaded=existing_user.onboarding_details.resume_uploaded
        )
    else:
        onboarding_details = user_crud._ensure_onboarding_details(existing_user,True)
        onboarding_response = OnBoardingResponse(
            status=onboarding_details.get("status"),
            step=onboarding_details.get("step"),
            resume_uploaded=onboarding_details.get("resume_uploaded")
        )
        

    return UserResponse(
        id=existing_user.id,
        email=existing_user.email,
        provider=existing_user.provider,
        name=existing_user.name,
        created_at=existing_user.created_at,
        status=profile_status,
        onboarding_details=onboarding_response,
    )

async def get_user_details_from_header(request: Request):
    # Retrieve the email from the request state
    user_email = request.state.user_email

    if not user_email:
        raise HTTPException(status_code=400, detail="Email not found in request")

    # Access the database and find the user by email
    db = await get_database()
    user_crud = UserCRUD(db)
    user_details = await user_crud.find_user_by_email(user_email)
    return user_details

async def check_user_exists(email: str) -> bool:
    db = await get_database()
    user_crud = UserCRUD(db)
    user = await user_crud.find_user_by_email(email)
    if user is not None:
        return user
    return False