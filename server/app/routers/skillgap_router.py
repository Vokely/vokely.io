from fastapi import APIRouter, HTTPException, Request, Depends, status, Query, Body, Path
from typing import Dict, Any, Optional, List
from pydantic import BaseModel

# crud
from crud.user import get_user_details_from_header
from crud.resumes import get_resume_details
from crud.skillgap import SkillGapCRUD

# models
from models.skillgap import SkillGapBase, SkillGapResponse

#crud
from crud.roadmap import RoadmapCRUD

# utils
from utils.gpt import generate_skill_gap_report
from utils.gpt import generate_roadmap_topics_from_skillgap
from db.config import get_database  

from dependencies.enforce_limits import feature_limit
from dependencies.feature_usage_processor import track_feature_usage, track_tokens

router = APIRouter()

class CreateRequest(BaseModel):
    resume_id: str

class RoadmapCreate(BaseModel):
    resume_id: str
    skills: List[str]

class SkillGapUpdateRequest(BaseModel):
    picked_skills: Optional[list[str]] = None
    additional_skills: Optional[list[str]] = None
    roadmap_id: Optional[str] = None

async def get_skillgap_crud():
    db = await get_database()
    return SkillGapCRUD(db)

async def get_roadmap_crud():
    db = await get_database()  
    return RoadmapCRUD(db)

@router.post("/", response_model=dict)
@feature_limit(["skill_gap_analysis"])
@track_feature_usage(["skill_gap_analysis"])
@track_tokens("skill_gap_analysis")
async def create_skill_gap_report(
    request:Request,
    request_details: CreateRequest, 
    user_details: Dict[str, Any] = Depends(get_user_details_from_header),
    skillgap_crud: SkillGapCRUD = Depends(get_skillgap_crud)
):
    """Create a new skill gap report"""
    try:
        resume_details = await get_resume_details(user_details.id, request_details.resume_id)
        if resume_details is None:
            raise HTTPException(status_code=404, detail="Resume not found")

        ai_report = await generate_skill_gap_report(
            request,
            resume_details.get("resume_data"), 
            resume_details.get("job_description")
        )
        
        skill_gap_data = SkillGapBase(
            user_id=user_details.id,
            resume_id=request_details.resume_id,
            status=1,
            **ai_report
        )
        result = await skillgap_crud.create_skill_gap_report(skill_gap_data)
        
        return {
            "message": "Skill gap report created successfully",
            "data": result
        }
        
    except HTTPException as http_error:
        print(f"[ERROR] {http_error.detail}")
        raise http_error
    except Exception as e:
        print(f"[ERROR]: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred."
        )

@router.post("/generate-roadmap")
@feature_limit(["ai_roadmaps"])
@track_feature_usage(["ai_roadmaps"])
@track_tokens("ai_roadmaps")
async def get_roadmap(request:Request,details: RoadmapCreate,roadmap_crud: RoadmapCRUD = Depends(get_roadmap_crud)):
    try:
        if len(details.skills) > 5:
            raise HTTPException(
                status_code=400,
                detail="You can select a maximum of 5 skills to generate a roadmap."
            )
        user_details = await get_user_details_from_header(request)
        resume_details = await get_resume_details(user_details.id, details.resume_id)
        input_json = {
            "job_description" : resume_details.get("job_description"),
            "skills": details.skills
        }
        roadmap_response = await generate_roadmap_topics_from_skillgap(request,input_json)
        created_roadmap =  await roadmap_crud.create(user_details.id, resume_details.get("name"), roadmap_response["roadmap"],resume_details.get("_id"))

        return created_roadmap
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error generating links: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating roadmap"+str(e))

@router.get("/resume/{resume_id}", response_model=dict)
async def get_skill_report_by_resume_id(
    resume_id: str,
    user_details: Dict[str, Any] = Depends(get_user_details_from_header),
    skillgap_crud: SkillGapCRUD = Depends(get_skillgap_crud)
):
    """Get skill gap report by resume ID"""
    try:
        report = await skillgap_crud.get_skill_reports_by_resume_id(
            resume_id, 
            user_details.id
        )
        
        return {
            "message": "Skill gap report retrieved successfully",
            "data": report
        }
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error fetching skill gap report: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Error fetching skill gap report"
        )

@router.get("/{report_id}", response_model=dict)
async def get_skill_report_by_id(report_id: str,user_details: Dict[str, Any] = Depends(get_user_details_from_header),skillgap_crud: SkillGapCRUD = Depends(get_skillgap_crud)):
    """Get skill gap report by report ID"""
    try:
        report = await skillgap_crud.get_skill_report_by_id(
            report_id, 
            user_details.id
        )
        
        return {
            "message": "Skill gap report retrieved successfully",
            "data": report
        }
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error fetching skill gap report: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Error fetching skill gap report"
        )

@router.get("/", response_model=dict)
async def get_all_skill_reports(
    user_details: Dict[str, Any] = Depends(get_user_details_from_header),
    skillgap_crud: SkillGapCRUD = Depends(get_skillgap_crud),
    limit: int = Query(50, ge=1, le=100)
):
    """Get all skill gap reports for the current user"""
    try:
        reports = await skillgap_crud.get_all_skill_reports_by_user(
            user_details.id,
            limit
        )
        
        return {
            "message": "Skill gap reports retrieved successfully",
            "count": len(reports),
            "data": reports,
        }
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error fetching skill gap reports: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error fetching skill gap reports"
        )

@router.patch("/{report_id}", response_model=SkillGapResponse)
async def update_skill_gap_report_by_id(
    report_id: str = Path(..., description="MongoDB ObjectId of the report"),
    update_data: SkillGapUpdateRequest = Body(...),
    user_details: Dict[str, Any] = Depends(get_user_details_from_header),
    skillgap_crud: SkillGapCRUD = Depends(get_skillgap_crud)
):
    """
    Update an active skill gap report by its report ID.
    """
    updated_report = await skillgap_crud.update_skill_gap_report(
        report_id=report_id,
        update_data=update_data.dict(exclude_unset=True)
    )
    return updated_report


@router.delete("/{report_id}", response_model=dict)
async def delete_skill_gap_report(
    report_id: str,
    user_details: Dict[str, Any] = Depends(get_user_details_from_header),
    skillgap_crud: SkillGapCRUD = Depends(get_skillgap_crud)
):
    """Delete skill gap report"""
    try:
        result = await skillgap_crud.delete_skill_gap_report(
            report_id,
            user_details.id
        )
        
        return result
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error deleting skill gap report: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error deleting skill gap report"
        )