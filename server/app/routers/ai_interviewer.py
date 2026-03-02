from fastapi import APIRouter, UploadFile, File, HTTPException, Request, Depends, Path
from fastapi.responses import JSONResponse

# other packages
from datetime import datetime
from typing import Dict, Any
import os
from dotenv import load_dotenv
import random
import string 
import json

# utils
from utils.resume_scraper import construct_resume_details,sanitation
from utils.speech import speech_to_text, text_to_speech
from utils.interactive_interviewer import InteractiveInterviewer
from utils.redis.redis_keys import RedisKeys
from utils.json.json_encoder import EnhancedJSONEncoder

# Utility imports
from dependencies.enforce_limits import feature_limit
from dependencies.feature_usage_processor import track_feature_usage, track_tokens

# models
from models.interview import InterviewDetailsResponse, AllInterviewsResponse
from models.resume import ModuleName
# constants
from constants.credit_constants import INTERVIEW_DEDUCTION_AMOUNT

# crud
from crud.user import get_user_details_from_header,UserCRUD
from crud.resumes import create_resume,get_resume_details
from crud.interview import InterviewCRUD
# db
from db.config import get_database

load_dotenv()
DEFAULT_MODEL = os.getenv("DEFAULT_AI_MODEL","gpt") 
router = APIRouter()

ALLOWED_EXTENSIONS = {"txt", "pdf", "doc", "docx"}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

interviewers: Dict[str, InteractiveInterviewer] = {}

async def get_interview_crud():
    db = await get_database()
    return InterviewCRUD(db)

def allowed_file(filename: str) -> bool:
    """_summary_

    Args:
        filename (str): _description_
        
    Working:
        - Check if the filename has . and checks it with the allowed_extensions

    Returns:
        bool: _description_
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

async def invalidate_interviews_cache(redis_client, user_id: str):
    """
    Helper function to invalidate interviews cache for a user.
    Call this whenever interviews are created, updated, or deleted.
    """
    cache_key = RedisKeys.user_interviews(user_id)
    await redis_client.delete_key(cache_key)
    print(f"Invalidated interviews cache for user: {user_id}")

@router.get("/{session_id}", response_model=InterviewDetailsResponse)
async def get_interview_details(
    session_id: str = Path(..., description="The ID of the interview to retrieve"),
    interview_crud: InterviewCRUD = Depends(get_interview_crud)
):
    """
    Get detailed interview information along with associated resume data.
    
    Parameters:
    - id: The ID of the interview to retrieve
    - resume_id: The ID of the associated resume
    
    Returns:
    - Complete interview details including the conversation history and feedback
    - Associated resume information including job description and resume details
    """
    try:
        interview_data = await interview_crud.get_interview_details_with_resume(session_id)
        return interview_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve interview details: {str(e)}")

@router.get("/all-interviews/history", response_model=AllInterviewsResponse)
async def get_all_interviews(
    request: Request,
    interview_crud: InterviewCRUD = Depends(get_interview_crud),
    user_details = Depends(get_user_details_from_header)
):
    """
    Get all interviews with associated resumes and external links.
    """
    try:
        if user_details.id is None:
            raise HTTPException(status_code=403, detail="Unauthorized Access")
            
        cache_key = RedisKeys.user_interviews(user_details.id)        
        cached_data = await request.app.redis.get_value(cache_key)
        
        if cached_data:
            print("Fetched interviews from cache")
            cached_interviews = json.loads(cached_data)
            response = JSONResponse(content=cached_interviews)
            return response
        
        interviews = await interview_crud.get_all_interviews_of_user(user_details.id)
        interviews_response = {"all_interviews": interviews}
        json_response = json.dumps(interviews_response, cls=EnhancedJSONEncoder)

        await request.app.redis.set_value(
            key=cache_key,
            value=json_response,
            expire_seconds=3600  
        )

        return interviews_response
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve interviews: {str(e)}")


@router.post("/upload_resume")
@feature_limit(["upload_resume"])
@track_feature_usage(["upload_resume"])
@track_tokens("upload_resume")
async def upload_resume(request: Request,file: UploadFile = File(...)):
    """validates uploaded file type, generate session id, creates a new object and adds the resume data to it.

    Args:
        file (UploadFile, optional): _description_. Defaults to File(...).

    Raises:
        HTTPException: Invalid file type
        HTTPException: Extracting resume details

    Returns:
        dict: session_id
    """
    if not allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    try:
        header_details = await get_user_details_from_header(request)
        # Instantiate both CRUDs with the DB session
        db = await get_database()
        user_crud = UserCRUD(db)

        user_details = await user_crud.find_user_by_email(header_details.email)
        
        resume_data = await construct_resume_details(request,file,DEFAULT_MODEL)
        formatted_resume: Dict[str, Any] = {
            "name": "Interview Resume",
            "data": resume_data
        }
        # print(formatted_resume)
        new_resume = await create_resume(user_details.id, formatted_resume, ModuleName.MOCK_INTERVIEW, True)
        resume_id = new_resume["_id"]
        
        session_id = datetime.now().strftime('%Y%m%d%H%M%S')
        session_id = session_id+''.join(random.choices(string.digits, k=10))

        interviewers[session_id] = InteractiveInterviewer(session_id,new_resume["resume_data"],resume_id,user_details.id,db)
        return {"success": True, "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting resume details: {str(e)}")

@router.post("/get_session_id")
@feature_limit(["ai_interviewer"])
async def get_session_id(request: Request,json_body:Dict[str,Any]):
    try:
        header_details = await get_user_details_from_header(request)
        # Instantiate both CRUDs with the DB session
        db = await get_database()
        user_crud = UserCRUD(db)
        user_details = await user_crud.find_user_by_email(header_details.email)

        resume_id = json_body.get("resume_id")
        resume_db_data = await get_resume_details(user_details.id,resume_id)
        resume_data = resume_db_data["resume_data"]
        job_description = resume_db_data.get("job_description")

        session_id = datetime.now().strftime('%Y%m%d%H%M%S')
        session_id = session_id + "".join(random.choices(string.digits, k=10))

        interviewers[session_id] = InteractiveInterviewer(session_id,resume_data,resume_id,user_details.id,db)
        return {"success": True, "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting resume details: {str(e)}")

@router.delete("/delete/{interview_id}")
async def delete_interview(interview_id: str, interview_crud: InterviewCRUD = Depends(get_interview_crud)):
    try:
        await interview_crud.delete_interview(interview_id)
        return {"success": True, "message": "Interview deleted successfully."}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting interview: {str(e)}")

@router.post("/start_interview")
@feature_limit(["ai_interviewer"])
@track_feature_usage(["ai_interviewer"])
async def start_interview(request:Request,jd_details:Dict[str,Any]):
    """Validates session ID, Starts interview with a question
    Args:
        session_id (str, optional): _description_. Defaults to Form(...).
        job_description (str, optional): _description_. Defaults to Form(...).

    Raises:
        HTTPException: Invalid session ID
        HTTPException: Error starting interview

    Returns:
        dict: success, introduction, first_question
    """
    session_id = jd_details.get("session_id")
    job_description = sanitation(jd_details.get("job_description"))
    if session_id not in interviewers:
        raise HTTPException(status_code=400, detail="Invalid session ID")
    try:
        header_details = await get_user_details_from_header(request)        
        # Instantiate both CRUDs with the DB session
        db = await get_database()
        user_crud = UserCRUD(db)
        user_details = await user_crud.find_user_by_email(header_details.email)

        interviewer = interviewers[session_id]
        intro = await interviewer.start_interview(job_description)
        # get user details
        user_details = await get_user_details_from_header(request)

        await invalidate_interviews_cache(request.app.redis, user_details.id)
        return {"success": True, "introduction": intro}
    except Exception as e:
        print(f"Error starting interview: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error starting interview: {str(e)}")


@router.post("/next_question")
async def next_question(jd_details:Dict[str,Any]):
    """Validates session id, gets answer for that object and asks next qn

    Args:
        session_id (str, optional): _description_. Defaults to Form(...).
        answer (str, optional): _description_. Defaults to Form(...).

    Raises:
        HTTPException: Invalid session ID
        HTTPException: Error generating next question

    Returns:
        dict: success, next_question, history
    """
    session_id = jd_details.get("session_id")
    answer = sanitation(jd_details.get("answer"))
    if session_id not in interviewers:
        raise HTTPException(status_code=400, detail="Invalid session ID")
    
    try:
        interviewer = interviewers[session_id]
        next_question,ideal_answer = await interviewer.generate_next_question(answer)
        stage = interviewer.get_interview_stage()
        return {"success": True, "question": next_question,"ideal_answer":ideal_answer,"stage": stage ,"history": interviewer.get_conversation_history()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating next question: {str(e)}")


@router.post("/end_interview")
@track_tokens("ai_interviewer")
async def end_interview(request:Request,json:Dict[str,Any]):
    """Validates the session ID and pops it from the local dictionary, returns chat history with performance rating,feedback and conclusion.

    Args:
        session_id (str, optional): _description_. Defaults to Form(...).

    Raises:
        HTTPException: Invalid Session ID
        HTTPException: Error ending interview

    Returns:
        dict: success, conclusion, history
    """
    session_id = json.get("session_id")
    if session_id not in interviewers:
        raise HTTPException(status_code=400, detail="Invalid session ID")
    try:
        interviewer = interviewers.pop(session_id)
        conclusion = await interviewer.wrap_up_interview(request)
        return {"success": True, "conclusion": conclusion, "history": interviewer.get_conversation_history()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ending interview: {str(e)}")


@router.post("/stt")
async def stt(file: UploadFile = File(...))->str:
    """converts speech to text usin groq api

    Args:
        file (UploadFile, optional): _description_. Defaults to File(...).

    Raises:
        HTTPException: 500

    Returns:
        str: transcript text
    """
    try:
        transcription_text = await speech_to_text(file)
        return JSONResponse(content={"message": transcription_text})  
    # call next_question
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error converting speech to text: {str(e)}")

@router.post("/tts")
async def tts(text:Dict[str,Any]):
    """Converts text to speech using google speech api

    Args:
        ai_text (str, optional): _description_. Defaults to Form(...).

    Raises:
        HTTPException: _description_

    Returns:
        blob: audio file
    """
    ai_text = text.get("text")
    try:
        audio = await text_to_speech(ai_text)
        return audio
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error converting text to speech: {str(e)}")
