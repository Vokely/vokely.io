from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal, Dict, Any, Union
from datetime import datetime, timezone

class ShareableLink(BaseModel):
    name: str
    candidate_name: str
    expires: Optional[Union[Literal["never"], datetime]] = "never"
    requires_password: bool = False
    password: Optional[str] = None
    type: Literal["feedbacks", "resumes"]
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: Optional[str] = None
    relation_id: str
    data: Dict[str, Any]

    @field_validator("password", mode="before")
    @classmethod
    def validate_password(cls, v, info):
        requires = info.data.get("requires_password")
        if requires and not v:
            raise ValueError("Password must be provided if requires_password is True.")
        return None if not requires else v
    
    @field_validator("expires", mode="before")
    @classmethod
    def validate_expiry(cls, v):
        # Handle string values like "never"
        if v == "never" or v is None:
            return "never"
        
        # If it's already a datetime, ensure it has timezone info
        if isinstance(v, datetime):
            if v.tzinfo is None:
                return v.replace(tzinfo=timezone.utc)
            return v
            
        # If it's a string representing a datetime, parse it with timezone awareness
        if isinstance(v, str) and v != "never":
            try:
                # Parse ISO format string to datetime
                dt = datetime.fromisoformat(v.replace('Z', '+00:00'))
                # Ensure it has timezone info
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt
            except ValueError:
                # If parsing fails, try with the standard ISO format
                dt = datetime.strptime(v, "%Y-%m-%dT%H:%M:%S.%fZ")
                return dt.replace(tzinfo=timezone.utc)
        
        return v


class ShareableLinkResponse(BaseModel):
    id: str
    name: str
    candidate_name: str
    expires: Optional[Union[Literal["never"], datetime]] = "never"
    requires_password: bool = False
    type: Literal["feedbacks", "resumes"]
    created_at: datetime
    created_by: str
    relation_id: str
    data: Dict[str, Any]

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "exclude": ["password"]
        }
    }