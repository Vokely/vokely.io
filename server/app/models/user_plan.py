#modles/user_plan.py
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from models.pricing_plans import PlanInDB
from models.user import GeoLocationDetails
from models.pricing_plans import PlanDuration

class FeatureUsage(BaseModel):
    name: str
    daily_usage: int = 0
    total_usage: int = 0

class UserPlanBase(BaseModel):
    user_id: str
    geo_location_details: Optional[GeoLocationDetails] = None
    plan_id: str
    plan_details: PlanInDB

    # When the user started and when their plan expires
    start_date: datetime = Field(default_factory=datetime.utcnow)
    expiry_date: Optional[datetime] = None

    # Features usage tracking
    usage_details: List[FeatureUsage]

    # Daily/Monthly usage reset tracking
    last_reset_at: datetime = Field(default_factory=datetime.utcnow)

class UserPlanCreate(UserPlanBase):
    pass

class UserPlanInDB(UserPlanBase):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserPlanResponse(BaseModel):  
    name:str
    features: List[str]  
    duration: PlanDuration
    start_date: datetime = Field(default_factory=datetime.utcnow)
    expiry_date: Optional[datetime] = None

    @field_validator("features", mode="before")
    @classmethod
    def extract_feature_names(cls, v):
        """
        Normalize input so features always end up as a list of strings.
        - If dicts with 'name' are passed -> extract names
        - If already strings -> leave as is
        """
        if isinstance(v, list):
            names = []
            for item in v:
                if isinstance(item, dict) and "name" in item:
                    names.append(item["name"])
                elif isinstance(item, str):
                    names.append(item)
            return names
        return v
