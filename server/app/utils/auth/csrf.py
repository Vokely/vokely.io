import secrets
import os
from dotenv import load_dotenv

from fastapi import Request, Response

load_dotenv()
DEV_MODE = os.getenv("DEV_MODE")  # "local", "staging", "production"

def generate_csrf_token() -> str:
    return secrets.token_urlsafe(32)

def get_cookie_domain() -> str | None:
    """Returns appropriate domain based on DEV_MODE."""
    if DEV_MODE == "local":
        return None  
    elif DEV_MODE == "staging":
        return "app.staging.vokely.io"
    elif DEV_MODE == "production":
        return "app.vokely.io"
    return None

def set_csrf_cookie(request: Request, response: Response):
    # if request.cookies.get("csrf-token"):
    #     return
    csrf_token = generate_csrf_token()
    domain = get_cookie_domain()
    is_secure = DEV_MODE != "local"

    print("Setting csrf cookie:",csrf_token)
    response.set_cookie(
        key="csrf-token",
        value=csrf_token,
        secure=is_secure,
        httponly=False, 
        samesite="lax",
        domain=domain,   
        path="/",
        max_age=3600
    )