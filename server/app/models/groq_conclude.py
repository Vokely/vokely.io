from pydantic import BaseModel
from typing import List, Dict

class ConcludeFormat(BaseModel):
    conclusion: str
    feedback: str
    strengths: List[str]
    areas_for_improvement: List[str]
    confidence_level: float
    communication_level: float
    cultural_fit: float
    jd_alignment_summary: Dict[str, str] 