from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, Literal, Dict, Any, List
from datetime import datetime

class GeoLocationDetails(BaseModel):
    country_code: str
    country_name: str
    currency_code : Optional[str] = None
    currency_symbol: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None

class OnBoardingRequest(BaseModel):
    career_stage: Optional[str]= None
    roles: Optional[str] = None
    usage_for: Optional[str] = None
    referral: Optional[str] = None
    country: Optional[str] = None
    
    step: Optional[int] = 1
    resume_uploaded: Optional[bool] = False

class OnBoardingDetails(OnBoardingRequest):
    status: str = "not_started"
    completed_at: Optional[datetime] = None

class OnBoardingResponse(BaseModel):
    status : str
    step: int 
    resume_uploaded: bool

class UserBase(BaseModel):
    name: str
    email: EmailStr
    provider: str
    password: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, exclude={"password"})

class UserInDB(UserBase):
    id: str
    hashed_password: Optional[str] = None
    created_at: datetime
    otp: Optional[str] = None
    otp_sent_at: Optional[datetime] = None
    is_verified: Optional[bool] = False
    verified_at: Optional[datetime] = None
    onboarding_details : Optional[OnBoardingDetails] = None
    completed_tours: Optional[List[str]] = []
    geo_location_details: Optional[GeoLocationDetails] = None

    model_config = ConfigDict(from_attributes=True, exclude={"hashed_password"})

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    provider: str
    created_at: datetime
    is_verified: Optional[bool] = False
    verified_at: Optional[datetime] = None
    onboarding_details: OnBoardingResponse
    completed_tours: Optional[List[str]] = []
    status: Literal["existing", "new"]

    model_config = ConfigDict(from_attributes=True)