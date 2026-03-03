from fastapi import HTTPException, APIRouter, Request, Depends
from fastapi.responses import JSONResponse
from utils.json.serialize_json import serialize_mongo_document
from typing import Dict,Any
import json
from db.config import get_database

from models.user import UserResponse
from crud.user import UserCRUD,get_user_details_from_header
from crud.profile import get_profile_details,store_or_update_profile

from utils.redis.redis_keys import RedisKeys
from utils.logger import logger

router = APIRouter()

async def get_user_crud():
    db = await get_database()
    return UserCRUD(db)

async def invalidate_user_data_cache(redis_client, user_id: str):
    """
    Helper function to invalidate resumes cache for a user.
    Call this whenever resumes are created, updated, or deleted.
    """
    cache_key = RedisKeys.get_user_data(user_id)
    await redis_client.delete_key(cache_key)
    print(f"Invalidated user_data cache for user: {user_id}")

@router.get("/user/me")
async def fetch_user_details(request: Request, user_details: Dict[str, Any] = Depends(get_user_details_from_header)):
    """
    Return the current authenticated user's details.
    """
    try:
        cache_key = RedisKeys.get_user_data(user_details.id)        
        cached_data = await request.app.redis.get_value(cache_key)
        
        if cached_data:
            logger.info("Fetched user_data from cache")
            user_details = json.loads(cached_data)
            response = JSONResponse(content=user_details)
            return response
        
        response = UserResponse(
            **user_details.model_dump(exclude={"hashed_password"}),
            status="existing"
        )
        serialized_user = serialize_mongo_document(response.dict())
        
        await request.app.redis.set_value(
            key=cache_key,
            value=json.dumps(serialized_user),
            expire_seconds=1800  
        )
        
        return JSONResponse(status_code=200, content=serialized_user)
    except Exception as e:
        logger.error(f"Error occured while fetching user details: {e}")
        return JSONResponse(
            status_code=500,
            content={"message": f"An error occurred while fetching user details: {str(e)}"}
        )    

@router.get("/profile-details")
async def fetch_profile_details(request: Request):
    """
    Retrieve user profile details based on the email stored in request.state.
    """
    try:
        # Retrieve the email from the request state
        user_email = request.state.user_email

        if not user_email:
            raise HTTPException(status_code=400, detail="Email not found in request")

        # Access the database and find the user by email
        db = await get_database()
        user_crud = UserCRUD(db)
        user_details = await user_crud.find_user_by_email(user_email)

        if user_details is None:
            return JSONResponse(status_code=404, content={"message": "User not found"})
            
        # Get the profile details of the user
        profile_details = await get_profile_details(user_details.id)

        return JSONResponse(status_code=200, content={"profile_details": profile_details})
    except Exception as e:
        return JSONResponse(
            status_code=500, 
            content={"message": f"An error occurred while fetching profile details: {str(e)}"}
        )

@router.patch("/update-profile")
async def update_profile_details(request: Request, profile_data: dict):
    """
    Update user profile details based on the email stored in request.state.
    """
    try:
        user_email = request.state.user_email
        
        if not user_email:
            raise HTTPException(status_code=400, detail="Email not found in request")
        
        db = await get_database()
        user_crud = UserCRUD(db)
        user_details = await user_crud.find_user_by_email(user_email)
        
        if user_details is None:
            return JSONResponse(status_code=404, content={"message": "User not found"})
        await store_or_update_profile(profile_data, user_details.id, user_email)
        
        # Get the updated profile details
        updated_profile = await get_profile_details(user_details.id)
        
        return JSONResponse(
            status_code=200, 
            content={
                "message": "Profile updated successfully",
                "profile_details": updated_profile
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500, 
            content={"message": f"An error occurred while updating profile details: {str(e)}"}
        )
    
@router.patch("/update-user")
async def update_profile_details(request: Request, update_data: dict):
    try:
        user_id = request.state.user_id
        user_crud = await get_user_crud()
        result = await user_crud.update_user_details(user_id, update_data)
        await invalidate_user_data_cache(request.app.redis,user_id)
        return JSONResponse(
            status_code=200, 
            content={
                "message": "User details updated successfully",
                "user_details": result
            }
        )
    except Exception as e:
        logger.error(f"An error occured while updating user details {e}")
        return JSONResponse(
                    status_code=500, 
                    content={"message": f"An error occurred while updating user details: {str(e)}"}
                )

