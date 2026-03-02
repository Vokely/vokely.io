from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from models.user import UserBase, UserResponse, BaseModel
from pydantic import EmailStr

from db.config import get_database
from typing import Optional, Dict, Any
from fastapi.responses import JSONResponse

from crud.user import UserCRUD, get_user_details_from_header, check_user_exists

from utils.email_service import send_password_reset_email
from utils.rate_limiter import limiter, route_limiter

router = APIRouter()

class RequestResetRequest(BaseModel):
    email: EmailStr

class OtpVerifyRequest(BaseModel):
    email: str
    otp: str

class ResetPasswordRequest(BaseModel):
    email:str
    new_password: str

async def check_user_status_from_request(request_details: Request):
    """Check if user exists and return user details"""
    try:
        # Get user details from header
        user_email = request_details.email
        print(f"Checking user status for email: {user_email}")
        
        user = await check_user_exists(user_email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        elif user.provider!="email":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid provider found for resetting password"
            )
        
        return user, user_email
        
    except HTTPException as http_error:
        print(f"[ERROR] {http_error.detail}")
        raise http_error
    except Exception as e:
        print(f"[ERROR] Unexpected error in check_user_status_from_request: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while checking user status"
        )

@router.post("/request-reset", response_model=Dict[str, str])
@limiter.limit("2/minute") 
async def request_password_reset(request: Request, request_details: RequestResetRequest):
    try:
        # Check user status
        user, user_email = await check_user_status_from_request(request_details)
        
        # Get database connection
        db = await get_database()
        user_crud = UserCRUD(db)
        
        # Generate OTP
        otp = await user_crud.generate_otp(user_email)
        
        # Send password reset email
        await send_password_reset_email(user.email, user.name, otp)    
        
        return {"message": "OTP sent successfully to your email"}
        
    except HTTPException as http_error:
        print(f"[ERROR] {http_error.detail}")
        raise http_error
    except Exception as e:
        print(f"[ERROR] Unexpected error in request_password_reset: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process password reset request"
        )

@router.post("/verify-otp", response_model=Dict[str, bool])
@limiter.limit("5/minute") 
async def verify_forget_password_otp(request: Request, otp_data: OtpVerifyRequest):
    try:
        # Check user status
        user, user_email = await check_user_status_from_request(otp_data)
        
        # Initialize UserCRUD
        db = await get_database()
        user_crud = UserCRUD(db)
        
        # Verify OTP
        is_verified = await user_crud.verify_otp(user_email, otp_data.otp)
        
        if not is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP"
            )
        
        return {"success": True}
        
    except HTTPException as http_error:
        print(f"[ERROR] {http_error.detail}")
        raise http_error
    except Exception as e:
        print(f"[ERROR] Unexpected error in verify_forget_password_otp: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify OTP"
        )

@router.post("/reset-password", response_model=Dict[str, bool])
@limiter.limit("2/minute")  
async def reset_password(request: Request, password_data: ResetPasswordRequest):
    try:
        # Check user status
        user, user_email = await check_user_status_from_request(password_data)
        
        # Initialize UserCRUD
        db = await get_database()
        user_crud = UserCRUD(db)
        
        # Check if user has verified OTP
        user_verification_status = await user_crud.get_user_verification_status(user_email)
        
        if not user_verification_status:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please verify your OTP"
            )
        
        # Reset password
        success = await user_crud.reset_password(user_email, password_data.new_password)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to reset password"
            )
        
        return {"success": success}
        
    except HTTPException as http_error:
        print(f"[ERROR] {http_error.detail}")
        raise http_error
    except Exception as e:
        print(f"[ERROR] Unexpected error in reset_password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset password"
        )