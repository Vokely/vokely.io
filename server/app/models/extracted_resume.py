from typing import List, Optional
from pydantic import BaseModel, Field

class PersonalInfo(BaseModel):
    firstName: str = Field(default="", description="First name of the candidate")
    lastName: str = Field(default="", description="Last name of the candidate")
    email: str = Field(default="", description="Email address of the candidate")
    phone: str = Field(default="", description="Phone number of the candidate")
    location: str = Field(default="", description="Location of the candidate")
    title: str = Field(default="", description="Professional title of the candidate")
    summary: str = Field(default="", description="Professional summary or objective of the candidate")


class SkillSet(BaseModel):
    technical_skills: List[str] = Field(default_factory=list, description="List of missing technical skills")
    soft_skills: List[str] = Field(default_factory=list, description="List of missing soft skills")


class SocialLink(BaseModel):
    platform: str = Field(default="", description="Label or description for the link")
    url: str = Field(default="", description="URL of the profile")
    icon: Optional[str] = Field(default=None, description="URL of the platform's icon")
    label: str = Field(default="", description="Text label for the link (e.g., 'Visit my portfolio')")


class ExperienceEntry(BaseModel):
    title: str = Field(default="", description="Job title")
    company: str = Field(default="", description="Company name")
    location: str = Field(default="", description="Location of the job")
    startDate: str = Field(default="", description="Start date of the job (format: YYYY-MM)")
    endDate: str = Field(default="", description="End date of the job (format: YYYY-MM or 'Present')")
    description: str = Field(default="", description="Brief description of the role and achievements")


class EducationEntry(BaseModel):
    degree: str = Field(default="", description="Degree obtained")
    school: str = Field(default="", description="Name of the educational institution")
    location: str = Field(default="", description="Location of the institution")
    startDate: str = Field(default="", description="Start date of the program (format: YYYY)")
    endDate: str = Field(default="", description="End date of the program (format: YYYY)")
    gpa: Optional[str] = Field(default=None, description="GPA or academic performance (if mentioned)")


class ProjectEntry(BaseModel):
    name: str = Field(default="", description="Name of the project")
    description: str = Field(default="", description="Description of the project")
    link: Optional[str] = Field(default=None, description="URL or reference link for the project")


class ResumeData(BaseModel):
    personalInfo: PersonalInfo = Field(default_factory=PersonalInfo, description="Personal information of the candidate")
    skills_missing: SkillSet = Field(default_factory=SkillSet, description="Skills that are missing")
    socialLinks: List[SocialLink] = Field(default_factory=list, description="List of social links")
    experience: List[ExperienceEntry] = Field(default_factory=list, description="List of work experiences")
    education: List[EducationEntry] = Field(default_factory=list, description="List of educational qualifications")
    projects: List[ProjectEntry] = Field(default_factory=list, description="List of projects")
    achievements: List[str] = Field(default_factory=list, description="List of achievements, awards, or recognitions")
    hobbies: List[str] = Field(default_factory=list, description="List of hobbies or interests")
    languages: List[str] = Field(default_factory=list, description="List of languages spoken")


# Example usage:
# data = {
#     "personalInfo": {
#         "firstName": "John",
#         "lastName": "Doe",
#         "email": "john.doe@example.com",
#         "phone": "+1234567890",
#         "location": "New York, USA",
#         "title": "Software Engineer",
#         "summary": "Passionate about building scalable web applications."
#     },
#     "skills_missing": {
#         "technical_skills": ["JavaScript", "Python"],
#         "soft_skills": ["Leadership"]
#     },
#     "socialLinks": [
#         {
#             "platform": "LinkedIn",
#             "url": "https://linkedin.com/in/johndoe",
#             "icon": "https://example.com/linkedin-icon.png",
#             "label": "Visit my LinkedIn profile"
#         }
#     ],
#     "experience": [
#         {
#             "title": "Software Developer",
#             "company": "Tech Corp",
#             "location": "San Francisco, CA",
#             "startDate": "2020-06",
#             "endDate": "2023-05",
#             "description": "Developed scalable backend systems using Python and JavaScript."
#         }
#     ],
#     "education": [
#         {
#             "degree": "Bachelor of Science in Computer Science",
#             "school": "University of California",
#             "location": "Los Angeles, CA",
#             "startDate": "2016",
#             "endDate": "2020",
#             "gpa": "3.8/4.0"
#         }
#     ],
#     "projects": [
#         {
#             "name": "E-commerce Platform",
#             "description": "Built a full-stack e-commerce platform with React and Node.js.",
#             "link": "https://github.com/johndoe/ecommerce-platform"
#         }
#     ],
#     "achievements": ["Won first place in a hackathon"],
#     "hobbies": ["Reading", "Cycling"],
#     "languages": ["English", "Spanish"]
# }