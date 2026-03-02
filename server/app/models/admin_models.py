from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from models.activity import ActivitiesAdminModel, ActivityTotalCount

class TransactionOut(BaseModel):
    id: str = Field(..., alias="_id")  # Mongo uses _id
    user_id: str
    amount: int
    type: str
    added_by: Optional[str]
    previous_balance: Optional[int]
    new_balance: Optional[int]
    timestamp: datetime

class UserOut(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    email: str
    provider: Optional[str]
    created_at: Optional[datetime]
    activities: List[ActivitiesAdminModel] = []

class TotalOut(BaseModel):
    users_count: int
    activities_count: List[ActivityTotalCount] = []

class UsersWithTotalOut(BaseModel):
    users: List[UserOut]
    total: TotalOut