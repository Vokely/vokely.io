from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class SkillsObject(BaseModel):
    technical_skills: List[str]
    soft_skills: List[str]

class ImproveSkills(BaseModel):
    skill: str
    reason: str 

class SkillGapAIResponse(BaseModel):
    required_skills: SkillsObject
    matched_skills: SkillsObject
    missed_skills: SkillsObject
    skills_to_be_improved: List[ImproveSkills]

class SkillGapBase(SkillGapAIResponse):
    user_id: str
    resume_id: str
    roadmap_id: Optional[str] = None
    status: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = datetime.utcnow()
    picked_skills : Optional[List[str]] = []
    additional_skills : Optional[List[str]] = []

class SkillGapCreate():
    resume_id : str

class SkillGapResponse(SkillGapBase):
    id: str