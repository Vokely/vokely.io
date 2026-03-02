from pydantic import BaseModel, EmailStr
from typing import Optional

class UserVerification(BaseModel):
    email: EmailStr
    verified: bool = False
    generated_code: Optional[str] = None
