from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from models.global_models import ModuleName
from bson import ObjectId

class RatingRequest(BaseModel):
    """Base model for user ratings."""
    module_name: ModuleName = Field(..., description="Name of the module being rated")
    rating: float = Field(..., ge=0, le=5, description="Rating score between 0 and 5")
    comment: Optional[str] = Field(None, description="Optional comment about the module")
    module_id: str = Field(..., description="Unique identifier of the specific module instance being rated")
    
class RatingInDB(RatingRequest):
    user_id: str = Field(..., description="ID of the user submitting the rating")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)