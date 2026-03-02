from typing import List, Optional, Dict
from pydantic import BaseModel


class ProjectDetails(BaseModel):
    project_name: str
    description: Optional[str] = None


class ExperienceDetails(BaseModel):
    name: str
    duration: str
    description: str


class Achievements(BaseModel):
    modified: List[str]
    newly_added: List[str]
    removed: List[str]


class Projects(BaseModel):
    modified: List[ProjectDetails]
    newly_added: List[ProjectDetails]
    removed: List[ProjectDetails]


class Experience(BaseModel):
    modified: List[ExperienceDetails]
    newly_added: List[ExperienceDetails]


class ResumeData(BaseModel):
    keywords: List[str]
    skills_missing: List[str]
    description: str
    projects: Projects
    experience: Experience
    achievements: Achievements
    old_score: str
    new_score: str
