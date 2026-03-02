from typing import List, Optional
from pydantic import BaseModel, EmailStr, HttpUrl

class Education(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None

class Experience(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None

class Project(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[List[str]] = None
    url: Optional[HttpUrl] = None

class Link(BaseModel):
    name: Optional[str] = None
    url: Optional[HttpUrl] = None

class Language(BaseModel):
    name: Optional[str] = None
    proficiency: Optional[str] = None

class Achievement(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None

class Certificate(BaseModel):
    name: Optional[str] = None
    issuing_organization: Optional[str] = None
    issue_date: Optional[str] = None
    credential_url: Optional[HttpUrl] = None

class Other(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class ResumeDetails(BaseModel):
    userid: str  # Required field
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    profile_image: Optional[HttpUrl] = None
    summary: Optional[str] = None
    skills: Optional[List[str]] = None
    links: Optional[List[Link]] = None
    education: Optional[List[Education]] = None
    experience: Optional[List[Experience]] = None
    languages: Optional[List[Language]] = None
    achievements: Optional[List[Achievement]] = None
    certificates: Optional[List[Certificate]] = None
    others: Optional[List[Other]] = None
    projects: Optional[List[Project]] = None