from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class ActionType(str, Enum):
    CREATE = "post"
    UPDATE = "patch"
    DELETE = "delete"
    VIEW = "read"
    DOWNLOAD = "download"


class ActivityCreate(BaseModel):
    user_id: str
    action_type: ActionType
    feature_name: str
    metadata: Optional[dict] = None

    @classmethod
    def from_method(
        cls, user_id: str, method: str, feature_name: str, metadata: Optional[dict] = None
    ) -> "ActivityCreate":
        """
        Map an HTTP method string to ActionType enum and create an ActivityCreate instance
        """
        http_to_action = {
            "post": ActionType.CREATE,
            "patch": ActionType.UPDATE,
            "delete": ActionType.DELETE,
            "get": ActionType.VIEW
        }

        action_type = http_to_action.get(method, ActionType.VIEW)  # default to VIEW

        return cls(
            user_id=user_id,
            action_type=action_type,
            feature_name=feature_name,
            metadata=metadata
        )

class ActivitiesAdminModel(BaseModel):
    feature_name:str
    action_type: ActionType
    count:int
    
class ActivityTotalCount(BaseModel):
    feature_name: str
    action_type: str
    total_count: int 

class ActivityInDB(ActivityCreate):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)