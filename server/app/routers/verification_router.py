from fastapi import APIRouter, Depends, Request, status, HTTPException
from fastapi.responses import JSONResponse 
from pydantic import BaseModel, EmailStr

from crud.user_mail_verify import VerificationCRUD
from crud.user import check_user_exists

from db.config import get_database

from utils.email_service import send_verification_email
from utils.rate_limiter import limiter


# API Router
router = APIRouter()

async def get_crud():
    db = await get_database()
    return VerificationCRUD(db)

class RegisterRequest(BaseModel):
    email: EmailStr

class VerifyRequest(BaseModel):
    email: EmailStr
    code: str

@router.post("/register")
# @route_limiter.limit("5/minute")      
# @limiter.limit("2/minute")  
async def register_user(request: Request,registerRequest: RegisterRequest, verification_crud: VerificationCRUD = Depends(get_crud)):
    user = await check_user_exists(registerRequest.email)
    if user:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail":"User already exists"}
        )
    code = await verification_crud.create_verification_entry(registerRequest)
    await send_verification_email(registerRequest.email, code)
    return {"message": "Verification email sent!"}

@router.post("/verify")
# @route_limiter.limit("10/minute")       # Global for this route only
@limiter.limit("5/minute")  # Limit verification code attempts to 5 per minute per IP
async def verify_user(request: Request,verifyRequest: VerifyRequest, verification_crud: VerificationCRUD = Depends(get_crud)):
    return await verification_crud.verify_code(verifyRequest.email, verifyRequest.code)