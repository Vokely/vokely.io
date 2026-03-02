from typing import List, Dict, Optional, Any, Union, Literal
from pydantic import BaseModel, Field, RootModel
from datetime import datetime
from enum import Enum

class SubHeading(RootModel[str]):
    pass

class LearningStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class HeadingItem(BaseModel):
    heading: str = Field(..., description="The main heading of a roadmap section")
    sub_headings: List[SubHeading] = Field(..., min_items=1, description="List of sub-headings under the main heading")
    comprehensive_task: str

class RoadmapResponseJSON(BaseModel):
    roadmap: List[HeadingItem] = Field(..., min_items=1, max_items=10, description="A list of roadmap sections, including a final 'Real-World Application Project' section")

# ---------------------------------------------------------SUMMARY---------------------------------------------------
class SummaryParagraph(BaseModel):
    type: Literal["para"]
    content: str


class SummaryHeading(BaseModel):
    type: Literal["heading"]
    content: str


class SummaryList(BaseModel):
    type: Literal["list"]
    content: List[str]


class SummaryCodeBlock(BaseModel):
    type: Literal["codeblock"]
    language: str  
    content: str

SummaryContentBlock = Union[SummaryParagraph, SummaryHeading, SummaryList, SummaryCodeBlock]

class GroqSummaryItem(BaseModel):
    summary: List[SummaryContentBlock] = []

class GroqSummaryResponseJSON(BaseModel):
    heading: str
    summaries: List[GroqSummaryItem]

# ------------------------------------------------------------------------------------------------------------------------------------

class Links(BaseModel):
    blogs: List[str] = []
    documentations: List[str] = []
    courses: List[str] = []
    youtube_videos: List[str] = []
    projects: List[str] = []

class GeneratedContentItem(BaseModel):
    heading: str
    links: Links

class PerplexityResponseJSON(BaseModel):
    generated_content: List[GeneratedContentItem]

class ContentItem(BaseModel):
    heading: str
    sub_heading_task_status : LearningStatus
    sub_heading_status : LearningStatus
    summary : List[SummaryContentBlock]
    your_task: str
    links: Links

class RoadMapItem(BaseModel):
    heading: str
    heading_task_status : LearningStatus
    sub_headings: List[ContentItem]
    comprehensive_task: str

class RoadmapDB(BaseModel):
    user_id : str
    skill: str
    roadmap: List[RoadMapItem]
    report_id : Optional[str] = None
    created_at: datetime = datetime.utcnow()
    modified_at: datetime = datetime.utcnow()
    streak: int =0
    last_logged_at: datetime = datetime.utcnow()
    status: int = 0
    feedback_received: bool = False