from datetime import datetime, timedelta, timezone
from fastapi import Request, Response
from jose import JWTError, jwt
import uuid
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

from constants.jwt_constants import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS, REFRESH_SECRET_KEY, OAUTH_TOKEN_EXPIRE_MINUTES

load_dotenv()
DEV_MODE = os.getenv("DEV_MODE")

def create_oauth_callback_token(data: dict) -> str:
    """
    Create a short-lived token used for OAuth client-side callback flow.
    """
    try:
        expire_datetime = datetime.utcnow() + timedelta(minutes=OAUTH_TOKEN_EXPIRE_MINUTES) 
        to_encode = data.copy()
        to_encode.update({"exp": expire_datetime, "type": "oauth_callback"})

        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    except Exception as e:
        raise ValueError(f"Error creating oauth_callback token: {str(e)}")

def create_access_token(data: dict) -> str:
    """
    Create an access token with the given data and expiration time.
    If no expiration time is provided, it defaults to ACCESS_TOKEN_EXPIRE_MINUTES.
    """
    try:
        expire_datetime = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode = data.copy()
        to_encode.update({"exp": expire_datetime, "type": "access"})

        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    except Exception as e:
        raise ValueError(f"Error creating access token: {str(e)}")

def create_refresh_token(session_id: str) -> str:
    """
    Create a refresh token containing the session_id.
    """
    try:
        expire_datetime = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode = {
            "session_id": session_id,
            "exp": expire_datetime,
            "type": "refresh"
        }

        encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    except Exception as e:
        raise ValueError(f"Error creating refresh token: {str(e)}")

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify an access token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload
    except JWTError:
        return None

def decode_oauth_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify an access token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "oauth_callback":
            return None
        return payload
    except JWTError:
        return None

def decode_refresh_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify a refresh token"""
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        return payload
    except JWTError:
        return None

def generate_session_id() -> str:
    """Generate a unique session ID"""
    return str(uuid.uuid4())

def convert_expires_to_datetime(expires: str) -> datetime:
    # Normalize to aware UTC
    dt = datetime.fromisoformat(expires.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
    return dt

#Cookie Handling functions
def set_auth_cookies(response: Response, access_token: str):
    """Set HTTP-only cookies for access and refresh tokens"""
    if DEV_MODE == "staging":
        domain = "app.staging.vokely.io"
    elif DEV_MODE == "live":
        domain = "app.vokely.io"
    else:
        domain = None  

    # Set access token cookie (short-lived)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,  
        secure=DEV_MODE != "local",   
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
        domain=domain  
    )

def clear_auth_cookies(response: Response):
    """Clear authentication cookies"""
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="csrf-token", path="/")