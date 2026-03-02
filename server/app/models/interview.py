from pydantic import BaseModel, Field
from typing import List, Optional, Union, Dict, Any
from datetime import datetime
from models.external_links import ShareableLinkResponse

class InterviewExchange(BaseModel):
    role: str
    content: Union[str, dict]
    timestamp: datetime
    stage: str


class Feedback(BaseModel):
    conclusion: str
    feedback: str
    strengths: List[str]
    areas_for_improvement: List[str]
    confidence: float
    communication: float
    problem_solving: float
    team_player: float
    cultural_fit: float
    technical_skills: float
    leadership: float
    team_player: float
    jd_alignment_summary: Dict[str, str]
    performance_rating: float


class Interview(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    user_id: str
    history: List[InterviewExchange]
    ideal_answers: List[str]
    session_id: str
    input_tokens: int
    output_tokens: int
    performance_rating: Optional[float] = Field(None, ge=0, le=5)
    feedback: Optional[Feedback] = None  
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class InterviewDetailsResponse(BaseModel):
    interview: Dict[str, Any]
    resume: Dict[str, Any]

class AllInterviewsObject(BaseModel):
    interview: Dict[str, Any]
    resume: Optional[Dict[str, Any]] = None
    external_links: List[Dict[str,Any]] = []

class AllInterviewsResponse(BaseModel):
    all_interviews: List[AllInterviewsObject]
