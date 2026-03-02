# Standard library imports
import os
from typing import Dict, Any

# Third-party imports
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, UploadFile, File, Header, Request, Form, status, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Database imports
from db.config import get_database
from crud.user import UserCRUD, get_user_details_from_header
from crud.profile import store_or_update_profile,update_profile_image
from crud.resumes import update_generated_data,update_resume_image

# Utility imports
from dependencies.enforce_limits import feature_limit
from dependencies.feature_usage_processor import track_feature_usage, track_tokens

from utils.gpt import gpt_resume_generator
from utils.resume_scraper import (
    construct_resume_details, 
    sanitation
)
from utils.gcp import upload_to_gcs

BUCKET_NAME = "genresume_bucket"
TEMP_UPLOAD_DIR = "temp_uploads"

os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)

load_dotenv()
DEFAULT_MODEL = os.getenv("DEFAULT_AI_MODEL") 

router = APIRouter()

class JobDetailsInput(BaseModel):
    job_details: Dict[str,any]
    resume_details: Dict[str, Any]
    prompt: str

async def get_user_id(email:str):
    db = await get_database()
    user_crud = UserCRUD(db)
    user_details = await user_crud.find_user_by_email(email)
    return user_details.id

@router.post("/generate_resume")
@feature_limit(["ai_resume_generator"])
@track_feature_usage(["ai_resume_generator"])
@track_tokens("ai_resume_generator")
async def generate_resume(request: Request,resume_job_details: Dict[str, Any], model: str = DEFAULT_MODEL):
    """Generates a resume using the specified model (Gemini or DeepSeek)."""
    try:
        #get user details
        user_details = await get_user_details_from_header(request)

        # Instantiate both CRUDs with the DB session
        db = await get_database()
        
        job_details = sanitation(resume_job_details.get("job_details", {}))
        job_details = job_details["job_description"]
        resume_details = resume_job_details.get("resume_details", {})
        resume_id = resume_job_details.get("resumeId", {})

        result = await gpt_resume_generator(request,resume_details,job_details)   
        await update_generated_data(resume_id,user_details.id,result)

        # Continue with resume generation
        return {"generated_resume": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating resume: {str(e)}")

# @router.post("/generate/custom_prompt")
# async def generate_resume_with_prompt(resume_job_details: Dict[str, Any], model: str = DEFAULT_MODEL):
#     """Tests a prompt using the specified model (Gemini or DeepSeek)."""
#     try:
#         job_details = sanitation(resume_job_details.get("job_details", {}))
#         resume_details = resume_job_details.get("resume_details", {})
#         prompt = sanitation(resume_job_details.get("prompt", ""))

#         if model == "gemini":
#             result = resume_generator_with_prompt(prompt, resume_details, job_details)
#         elif model == "deepseek":
#             result = await deepseek_prompt_test(resume_details, job_details, prompt)
#         else:
#             raise HTTPException(status_code=400, detail="Invalid model specified")
#         return {"generated_resume": result}

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error testing prompt: {str(e)}")


@router.post("/extract_resume")
@feature_limit(["upload_resume"])
@track_feature_usage(["upload_resume"])
@track_tokens("upload_resume")
async def extract_resume_details(request:Request,file: UploadFile = File(...), model: str = DEFAULT_MODEL,email: str = Header(None)):
    """Extracts details from an uploaded resume file."""
    try:
        user_details = await get_user_details_from_header(request)
        extracted_details = await construct_resume_details(request,file,"gpt")
        #Store in DB
        await store_or_update_profile(extracted_details,user_details.id,user_details.email)
        return {"extracted_details": extracted_details}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting resume details: {str(e)}")

@router.post("/upload-profile")
async def upload_profile(
    file: UploadFile = File(...),
    user_details: Dict[str, Any] = Depends(get_user_details_from_header),
    resumeId: str = Form(None),
    isProfileUpload: str = Form(None)
):
    try:
        id = user_details.id
        
        file_content = await file.read()
        
        file_name = f"{id}.png"
        if resumeId:
            file_name = f"{id}_{resumeId}.png"
  
        upload_path = "resumes/" if resumeId else "profiles/"
        public_url = upload_to_gcs(file_content, file_name, file.content_type, upload_path)
        
        if resumeId:
            await update_resume_image(resumeId, file_name, public_url)
        else:
            await update_profile_image(id, file_name, public_url)
            
        return {"message": "Success", "filename": file_name, "imageUrl": public_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading profile: {str(e)}")