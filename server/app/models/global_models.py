from typing import List, Optional, Any, Dict
from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class ModuleName(str, Enum):
    ATS_CHECKER = "ats_checker"
    RESUME_BUILDER = "resume_builder"
    MOCK_INTERVIEW = "mock_interview"
    ROADMAP = "roadmap"