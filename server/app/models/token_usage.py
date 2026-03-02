from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TokenUsageCreate(BaseModel):
    user_id: Optional[str] = None  
    module_id: Optional[str] = None  
    input_tokens: int
    output_tokens: int
    model: str 

class TokenUsageInDb(TokenUsageCreate):
    id: str = Field(alias="_id")     
    created_at: datetime = Field(default_factory=datetime.utcnow)
