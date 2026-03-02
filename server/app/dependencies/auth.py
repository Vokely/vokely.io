from fastapi import HTTPException, status, Request
from fastapi.security import HTTPBearer
from typing import Optional
from utils.auth.jwt import decode_access_token, decode_refresh_token

security = HTTPBearer()

def get_token_from_cookie(request: Request, token_name: str) -> Optional[str]:
    """Extract token from HTTP-only cookies"""
    return request.cookies.get(token_name)

def get_token_from_header(request: Request) -> Optional[str]:
    """Extract Bearer token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

async def get_current_user_from_access_token(request: Request) -> dict:    
    access_token = get_token_from_cookie(request, "access_token")
    if not access_token:
        access_token = get_token_from_header(request)
    
    if not access_token:
        print("Access token not found in cookies or header")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token not found",
        )

    payload = decode_access_token(access_token)
    if not payload:
        print("Invalid access token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
        )

    user_email = payload.get("sub")
    if not user_email:
        print("Invalid token payload")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    return {
        "email": user_email,
        "user_id": payload.get("user_id"),
        "session_id": payload.get("session_id"),
        "payload": payload,
    }

async def get_current_user(token: str = None, request: Request = None) -> dict:
    """
    Get current user from Bearer token or cookies
    This function supports both Bearer token authentication and cookie-based auth
    """
    if token:
        # Direct token provided (from Depends(security))
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        user_email = payload.get("sub")
        user_id = payload.get("user_id")
        if not user_email or not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        return {
            "email": user_email,
            "user_id": user_id,
            "session_id": payload.get("session_id"),
            "payload": payload,
        }
    
    elif request:
        # Fallback to request-based token extraction
        return await get_current_user_from_access_token(request)
    
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authentication method provided"
        )
