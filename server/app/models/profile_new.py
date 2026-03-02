from pydantic import BaseModel, Field, EmailStr
from typing import Dict, Any, Optional
from datetime import datetime

class ProfileBase(BaseModel):
    """Base Profile model with common fields"""
    email: EmailStr
    resume_data: Dict[str, Any]
    user_id: str

class ProfileCreate(ProfileBase):
    """Profile model for creation requests"""
    pass

class ProfileUpdate(BaseModel):
    """Profile model for update requests with optional fields"""
    email: Optional[EmailStr] = None
    resume_data: Optional[Dict[str, Any]] = None

class ProfileInDB(ProfileBase):
    """Profile model as stored in the database"""
    created_at: datetime
    modified_at: datetime

class ProfileResponse(ProfileInDB):
    """Profile model for responses"""
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat() + 'Z' if dt.tzinfo is None else dt.isoformat()
        }