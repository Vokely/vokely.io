# schemas/ats.py
from pydantic import BaseModel, Field
from typing import List, Optional, Union, Dict, Any
from datetime import datetime
from bson import ObjectId

# ------------------------------
# Public Analysis Sections
# ------------------------------

class ATSSection(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    issue: str
    recommendation: str
    solution: Union[str, List[str]]  


class ATSBasicAnalysis(BaseModel):
    active_voice: List[ATSSection]
    bullet_points_style: List[ATSSection]
    repetitive_words: List[ATSSection]
    sentence_clarity: List[ATSSection]
    formatting_uniformity: List[ATSSection]
    first_person_pronouns: List[ATSSection]


# ------------------------------
# JD-Based Analysis Sections
# ------------------------------


class ATSJDAnalysis(BaseModel):
    hard_skills_match: Dict[str,Any]
    soft_skills_match: Dict[str,Any]
    keyword_density: List[Dict[str,Any]]
    achievement_statements:List[Dict[str,Any]]
    job_requirements_match: Dict[str,Any]
    experience_analysis: Dict[str,Any]

# ------------------------------
# Resume Essentials
# ------------------------------

class ProfileContact(BaseModel):
    has_name: bool
    has_email: bool
    has_phone: bool
    notes: Optional[str] = None

class CheckMandatorySection(BaseModel):
    has_section: bool
    notes: Optional[str] = None 

class MandatorySections(BaseModel):
    summary: CheckMandatorySection
    education: CheckMandatorySection
    skills: CheckMandatorySection
    experience: CheckMandatorySection
    projects: CheckMandatorySection
    achievements: CheckMandatorySection


class Hyperlink(BaseModel):
    name : str
    is_valid: str
    is_clickable: Optional[bool] = False


class ResumeEssentials(BaseModel):
    profile_contact: ProfileContact
    mandatory_sections: MandatorySections
    hyperlinks: List[Hyperlink]


# ------------------------------
# Scoring Models
# ------------------------------

class SectionScore(BaseModel):
    """
    Score and weight of a section.
    """
    score: float  # Between 0 and 100
    weight: float  # Out of 100

class ATSScoreBreakdown(BaseModel):
    """
    Breaks down how the total score was calculated.
    """
    resume_essentials: SectionScore
    basic_analysis: SectionScore
    jd_analysis: Optional[SectionScore] = None

class ATSScoring(BaseModel):
    total_score: float  
    breakdown: ATSScoreBreakdown


# ------------------------------
# Final Response
# ------------------------------
class ATSAnalysisResponse(BaseModel):
    id:str
    resume_essentials: ResumeEssentials
    basic_analysis: ATSBasicAnalysis
    jd_analysis: Optional[Dict[str,Any]] = None
    scoring: ATSScoring

class ATSAnalysisInDB(ATSAnalysisResponse):
    resume_id:str
    user_id:str
    converted_at: Optional[datetime] = None
    jd_tailored: bool
    created_at: datetime