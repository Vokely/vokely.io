from pydantic import BaseModel, EmailStr
from typing import Optional,Dict,Any
from models.user import UserBase, UserResponse, BaseModel

class UserEmailRequest(BaseModel):
    email: EmailStr

class SignUpRequest(BaseModel):
    email: str
    password: Optional[str] = None
    name : str
    provider: str = "email"

class SignInRequest(BaseModel):
    email :str
    password: str
    provider:str

class OAuthTokenRequest(BaseModel):
    name: str
    email: EmailStr
    provider: str