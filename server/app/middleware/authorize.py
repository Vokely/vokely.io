from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer
from fastapi import Response
from datetime import datetime
from utils.auth.jwt import decode_access_token, create_access_token, set_auth_cookies, decode_refresh_token
from utils.logger import logger
from services.session_service import SessionService
from dependencies.user_plan import get_active_user_plan

# HTTPBearer security scheme with auto_error=False for manual handling
security = HTTPBearer(auto_error=False)

async def verify_token(request: Request) -> dict:
    """
    Verifies JWT from cookies or headers, checks session validity using SessionService.
    Stores user data in request.state if valid.
    """
    token = None

    # Try to get token from cookies first
    if hasattr(request, 'cookies'):
        token = request.cookies.get("access_token")

    # Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    # If no token found
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing in cookies or header."
        )

    # Decode token
    try:
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid access token")

        # Check expiration
        exp = payload.get("exp")
        email = payload.get("sub")
        session_id = payload.get("session_id")
        user_id = payload.get("user_id")

        if exp is None or datetime.utcfromtimestamp(exp) < datetime.utcnow():
            # Try to renew access token using refresh token
            session_service = request.app.session_service
            session_data = await session_service.get_session(session_id)
            refresh_token = session_data.get("refresh_token")
            if not refresh_token:
                raise HTTPException(status_code=401, detail="Invalid session. Please login again.")

            # Validate refresh token
            refresh_payload = decode_refresh_token(refresh_token)
            if not refresh_payload:
                raise HTTPException(status_code=401, detail="Session expired. Please login again.")

            # Optionally check expiration in refresh_payload
            refresh_exp = refresh_payload.get("exp")
            if refresh_exp is None or datetime.utcfromtimestamp(refresh_exp) < datetime.utcnow():
                raise HTTPException(status_code=401, detail="Session expired. Please login again.")

            new_access_token = create_access_token(
                data={
                    "sub": email,
                    "session_id": session_id,
                    "user_id": user_id
                }
            )
            # Set the new token in cookies
            logger.debug("Access token expired, generated new access token")
            request.state.new_access_token = new_access_token

        session_id = payload.get("session_id")
        user_id = payload.get("user_id")
        if not session_id or not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        # Access SessionService from app
        session_service = request.app.session_service
        client_ip = request.client.host
        session_valid,error_data = await session_service.is_session_valid(session_id, user_id, ip=client_ip)
        if not session_valid:
            print(error_data)
            raise HTTPException(status_code=401, detail="Invalid or expired session")

        # Attach user to request.state for later use
        request.state.user_email = email
        request.state.user_id = user_id
        request.state.session_id = session_id
        request.state.token_payload = payload

        #Set active user plan details
        await get_active_user_plan(request)
        
        return payload

    except HTTPException:
        raise
    except Exception as e:
        print(f"[verify_token] Error: {e}")
        raise HTTPException(status_code=401, detail="Token verification failed")

async def verify_admin_access(request: Request) -> dict:
    """
    Middleware to verify the user is an admin after session-based token check.
    """
    payload = await verify_token(request)
    email = payload.get("sub")

    admin_users = {
        'ak05032k2@gmail.com',
        'arungenresume@gmail.com', 
        'hariraghav505@gmail.com',
        'rishikeshnextnext@gmail.com',
        'genresume.ai@gmail.com'
    }

    if email not in admin_users:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to access this resource"
        )

    return payload