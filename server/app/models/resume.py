from typing import List, Optional, Any, Dict
from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class ModuleName(str, Enum):
    ATS_CHECKER = "ats_checker"
    RESUME_BUILDER = "resume_builder"
    MOCK_INTERVIEW = "mock_interview"

class Resume(BaseModel):
    user_id: str
    data: Dict[str, Any]
    name: str
    job_description: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    modified_at: datetime = datetime.utcnow()

class UpdateResume(BaseModel):
    data: Optional[Dict[str, Any]] = None
    generated_data: Optional[Dict[str, Any]] = None
    old_resume : Optional[Dict[str,Any]] = None
    old_score: Optional[str] = None
    new_score: Optional[str] = None
    name: Optional[str] = None
    job_description: Optional[str] = None
    is_interview_specific: bool = False  
    module_name: Optional[ModuleName] = None
