from fastapi import APIRouter, Depends, Response, Request, HTTPException, Header
from fastapi.responses import JSONResponse
from typing import Dict, Any, List

from models.user import UserBase, UserResponse, OnBoardingResponse
from models.auth import UserEmailRequest, SignInRequest, OAuthTokenRequest

from crud.user import UserCRUD, signUpUser, signIn, find_or_create_user

from db.config import get_database
from dependencies.auth import get_current_user_from_access_token
from services.session_service import SessionService

from utils.auth.jwt import create_access_token, set_auth_cookies,create_oauth_callback_token
from utils.auth.jwt import create_access_token, decode_oauth_token, clear_auth_cookies
from utils.auth.csrf import set_csrf_cookie
from utils.logger import logger

router = APIRouter()

async def check_existing_user(email: str) -> bool:
    db = await get_database()
    user_crud = UserCRUD(db)
    user = await user_crud.find_user_by_email(email)
    return user if user is not None else None

@router.post("/signup", response_model=UserResponse)
async def signUp(request: Request, response:Response, user: UserBase) -> JSONResponse:
    existing_user = await check_existing_user(user.email)
    if existing_user:
        return JSONResponse(
            status_code=400,
            content={"detail": "User already exists"}
        )

    created_user = await signUpUser(request, response, user)
    # Get onboarding status for response
    onboarding_response = None
    if created_user.onboarding_details:
        onboarding_response = OnBoardingResponse(
            status=created_user.onboarding_details.status,
            step=created_user.onboarding_details.step,
            resume_uploaded=created_user.onboarding_details.resume_uploaded
        )

    return UserResponse(
        id=created_user.id,
        email=created_user.email,
        provider=created_user.provider,
        name=created_user.name,
        created_at=created_user.created_at,
        status="new",
        onboarding_details=onboarding_response,
    )


@router.post("/signin", response_model=UserResponse)
async def signin(request: Request, response:Response, signin_request: SignInRequest):
    try:
        existing_user = await check_existing_user(signin_request.email)
        if not existing_user:
            return JSONResponse(
                status_code=400,
                content={"detail": "User not found. Please try creating an account first"}
            )

        email = signin_request.email
        password = signin_request.password
        provider = signin_request.provider

        user_response = await signIn(request, response, email, password, provider)
        set_csrf_cookie(request, response)
        return user_response
    except HTTPException as http_error:
        print(f"[ERROR] {http_error.detail}")
        raise http_error
    except Exception as e:
        print(f"Error occured while signing in user: {e}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"An unexpected error occurred: {str(e)}"}
        )

@router.post("/create-oauth-token")
async def create_oauth_token(request_data: OAuthTokenRequest):
    try:
        token = create_oauth_callback_token({
            "name": request_data.name,
            "email": request_data.email,
            "provider": request_data.provider
        })
        return { "token": token }
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create OAuth token: {str(e)}")

@router.post("/authenticate-user", response_model=UserResponse)
async def verify_oauth(request: Request, response:Response, userDetails: OAuthTokenRequest, x_oauth_token: str = Header(None)):
    try:
        if not x_oauth_token or not x_oauth_token.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid OAuth token")

        token = x_oauth_token.split("Bearer ")[1]
        payload = decode_oauth_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid or expired OAuth token")

        if payload.get("email") != userDetails.email:
            raise HTTPException(status_code=401, detail="Email mismatch in token")

        db = await get_database()

        user_details = await find_or_create_user(request, response, userDetails)
        set_csrf_cookie(request, response)
        return user_details
    except HTTPException as http_exc:
        print(f"HTTP Exception: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        print(f"Unhandled Exception: {e}")
        print(f"Error occured while authenticating user: {e}")

@router.post("/find", response_model=UserResponse)
async def find_user(request: UserEmailRequest):
    try:
        db = await get_database()
        user_crud = UserCRUD(db)
        user_details = await user_crud.find_user_by_email(request.email)

        if user_details is None:
            return JSONResponse(
                status_code=404,
                content={"detail": "User not found"}
            )

        # Get onboarding status for response
        onboarding_response = None
        if user_details.onboarding_details:
            onboarding_response = OnBoardingResponse(
                status=user_details.onboarding_details.status,
                step=user_details.onboarding_details.step,
                resume_uploaded=user_details.onboarding_details.resume_uploaded
            )

        return UserResponse(
            id=user_details.id,
            name=user_details.name,
            email=user_details.email,
            provider=user_details.provider,
            created_at=user_details.created_at,
            status="existing",
            onboarding_details=onboarding_response,
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": f"An error occurred while finding the user: {str(e)}"}
        )

@router.post("/refresh")
async def refresh_token_endpoint(request: Request,response: Response,current_user: dict = Depends(get_current_user_from_access_token)):
    """
    Refresh access token using session_id from current_user.
    Validates session and issues a new access token.
    """
    try:
        session_service = request.app.session_service

        # Raises exception if session is not valid
        session_data = await session_service.get_session(current_user["session_id"])

        # Generate new access token
        access_token = create_access_token(data={
            "sub": current_user["email"],
            "user_id": current_user["user_id"],
            "session_id": current_user["session_id"]
        })

        set_auth_cookies(response, access_token)

        return {"message": "Token refreshed successfully"}

    except HTTPException as e:
        raise e 
    except Exception as e:
        # Fallback for unexpected errors
        print(f"[Refresh Error]: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during token refresh")

@router.post("/logout")
async def logout_endpoint(
    request: Request,
    response: Response,
    current_user: dict = Depends(get_current_user_from_access_token)
):
    """
    Logout and invalidate session
    """
    try:
        session_id = current_user["session_id"]
        session_service: SessionService = request.app.session_service

        # Invalidate session
        success = await session_service.invalidate_session(session_id)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to logout. Session may already be invalidated.")

        # Clear cookies
        clear_auth_cookies(response)

        return {"message": "Logged out successfully"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Logout Error]: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during logout")


@router.post("/logout-all")
async def logout_all_sessions_endpoint(
    request: Request,
    response: Response,
    current_user: dict = Depends(get_current_user_from_access_token)
):
    """
    Logout from all sessions
    """
    try:
        user_id = current_user["user_id"]
        session_service = request.app.session_service

        # Invalidate all user sessions
        success = await session_service.invalidate_all_user_sessions(user_id)
        if not success:
            raise HTTPException(status_code=400, detail="No active sessions found for user")

        # Clear cookies
        clear_auth_cookies(response)

        return {"message": "Logged out from all sessions"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Logout-All Error]: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during logout from all sessions")
