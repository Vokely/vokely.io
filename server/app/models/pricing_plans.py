# models/pricing_plans.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Union
from datetime import datetime
from enum import Enum

class PlanType(str, Enum):
    GOLD = "gold"
    SILVER = "silver"
    FREE = "free"

class PlanDuration(str, Enum):
    MONTHLY = "monthly"
    QUATERLY = "quaterly"

class Feature(BaseModel):
    name: str
    total_capacity: int  
    daily_limit: int     
    
    @validator('total_capacity', 'daily_limit')
    def validate_limits(cls, v):
        if v < -1:
            raise ValueError('Limits must be positive integers or -1 for unlimited')
        return v
    
    @property
    def is_total_capacity_unlimited(self) -> bool:
        """Check if total capacity is unlimited"""
        return self.total_capacity == -1
    
    @property
    def is_daily_limit_unlimited(self) -> bool:
        """Check if daily limit is unlimited"""
        return self.daily_limit == -1
    
    def get_effective_total_capacity(self) -> Union[int, str]:
        """Get total capacity as int or 'unlimited' string"""
        return "unlimited" if self.is_total_capacity_unlimited else self.total_capacity
    
    def get_effective_daily_limit(self) -> Union[int, str]:
        """Get daily limit as int or 'unlimited' string"""
        return "unlimited" if self.is_daily_limit_unlimited else self.daily_limit

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    duration: Optional[PlanDuration] = None
    country_code: Optional[str] = None
    price: Optional[float] = None
    inr_price: Optional[int] = None
    currency: Optional[str] = None
    current_tier: Optional[str] = None
    plan_type: Optional[PlanType] = None
    features: Optional[List[Feature]] = None

class PlanCreate(BaseModel):
    name: str
    duration: PlanDuration
    country_code: str
    inr_price: Optional[int] = None
    price: float
    currency: str
    description: str
    current_tier: str
    plan_type: PlanType
    features: List[Feature]
    dodo_product_id: Optional[str] = None
    image_url: Optional[str] = None

class PlanInDB(PlanCreate):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class PlanPublic(BaseModel):
    name: str
    duration: str
    country_code: str
    price: float
    currency: str
    description: str
    current_tier: str
    plan_type: PlanType
    
    features: List[Feature]
    
    dodo_product_id: Optional[str] = None
    id: Optional[str] = None  
    symbol: Optional[str] = None

class PlanResponse(BaseModel):
    name: str
    duration: PlanDuration
    plan_type: PlanType