from fastapi import APIRouter, HTTPException, Request, Response, HTTPException, status
from fastapi.responses import JSONResponse

from typing import Dict, Any
import json

from models.resume import UpdateResume, ModuleName

from crud.user import get_user_details_from_header
from crud.resumes import create_resume, update_resume_details, get_resume_details, delete_resume, find_all_resumes_of_user
from crud.resumes import update_generated_data

from utils.auth.csrf import set_csrf_cookie
from utils.redis.redis_keys import RedisKeys
from utils.auth.exceptions import CustomHTTPException
from utils.logger import logger

router = APIRouter()

async def invalidate_resumes_cache(redis_client, user_id: str):
    """
    Helper function to invalidate resumes cache for a user.
    Call this whenever resumes are created, updated, or deleted.
    """
    cache_key = RedisKeys.user_resumes(user_id)
    await redis_client.delete_key(cache_key)
    logger.info(f"Invalidated resumes cache for user: {user_id}")

@router.get("/all-resumes", status_code=status.HTTP_200_OK)
async def fetch_resumes(request: Request, response: Response):
    try:
        user_details = await get_user_details_from_header(request)
        
        cache_key = RedisKeys.user_resumes(user_details.id)        
        cached_data = await request.app.redis.get_value(cache_key)
        
        if cached_data:
            print("Fetched resumes from cache")
            cached_resumes = json.loads(cached_data)
            response_details = {
                "status": "Success",
                "message": "Resumes fetched successfully (from cache)",
                "data": cached_resumes
            }
            if "csrf_token" not in request.cookies:
                logger.debug("Setting CSRF cookie")
                set_csrf_cookie(request, response)
            response = JSONResponse(content=response_details)
            return response

        resumes = await find_all_resumes_of_user(user_details.id)
        await request.app.redis.set_value(
            key=cache_key,
            value=json.dumps(resumes),
            expire_seconds=1800  
        )

        response_details = {
            "status": "Success",
            "message": "Resumes fetched successfully",
            "data": resumes
        }
        response = JSONResponse(content=response_details)
        set_csrf_cookie(request, response)
        return response
        
    except HTTPException as http_error:
        print(f"[ERROR] {http_error.detail}")
        raise http_error
    except Exception as e:
        print(f"[ERROR]: {e}")  
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred."
        )

@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_new_resume(request: Request, resume_details: Dict[str, Any]):
    """
    API endpoint to create a new resume.
    """
    try:
        user_details = await get_user_details_from_header(request)
        # Ensure user_details exist
        if not user_details or not user_details.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user authentication. User ID missing."
            )

        new_resume = await create_resume(user_details.id, resume_details, ModuleName.RESUME_BUILDER, False)
        logger.debug(new_resume)
        await invalidate_resumes_cache(request.app.redis, user_details.id)
        logger.debug("Resume created successfully")
        return {
            "status": "Success",
            "message": "Resume created successfully",
            "resume_id": str(new_resume.get("id")),
            "resume": new_resume
        }
    except HTTPException as e:
        logger.error(f"[create_new_resume] Error: {e}")
        raise e  # Preserve custom error messages
    except Exception as e:
        logger.error(f"[create_new_resume] Error: {e}")
        raise CustomHTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="An error occurred while creating the resume."
        )

@router.patch("/save/{resume_id}", status_code=status.HTTP_200_OK)
async def update_resume(resume: UpdateResume, resume_id: str, request: Request):
    """
    API endpoint to update an existing resume.
    Only updates provided fields.
    """
    try:
        # Get user details from the request
        user_details = await get_user_details_from_header(request)
        # Ensure user_details exist
        if not user_details or not user_details.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user authentication. User ID missing."
            )
        updated_resume = await update_resume_details(resume, resume_id, user_details.id)
        await invalidate_resumes_cache(request.app.redis, user_details.id)
        return {
            "status": "Success",
            "message": "Resume data updated successfully",
            "updated_resume": updated_resume
        }

    except HTTPException as e:
        raise e  # Propagate known errors
    except Exception as e:
        print(f"[ERROR]: {e}")  # Log unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred."
        )

@router.get("/{resume_id}", status_code=status.HTTP_200_OK)
async def fetch_resume(resume_id: str,request:Request):
    """
    API endpoint to fetch a resume by resume ID.
    """
    try:
        user_details = await get_user_details_from_header(request)
        # Ensure user_details exist
        if not user_details or not user_details.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user authentication. User ID missing."
            )
        resume = await get_resume_details(user_details.id,resume_id)
        if resume:
            return {
                "status": "Success",
                "message": "Resume fetched successfully",
                "data": resume
            }
        raise HTTPException(status_code=404, detail=f"Resume not found")
    except HTTPException as e:
        raise e  # Propagate the custom error messages
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
@router.delete("/{resume_id}", status_code=status.HTTP_200_OK)
async def remove_resume(resume_id: str):
    """
    API endpoint to delete a resume by its unique ID.
    """
    try:
        deleted_count = await delete_resume(resume_id)

        if deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Resume with ID {resume_id} not found."
            )
        await invalidate_resumes_cache(request.app.redis, user_details.id)
        return {
            "status": "Success",
            "message": "Resume deleted successfully"
        }
    except HTTPException as e:
        raise e  # Preserve custom error messages
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.patch("/save/enhancedData/{resume_id}", status_code=status.HTTP_200_OK)
async def update_enhanced_data(resume_id: str, request: Request, generated_data: Dict[str, Any]):
    """
    API endpoint to update an existing resume with generated data.
    Only updates provided fields.
    """
    try:
        user_details = await get_user_details_from_header(request)
        if not user_details:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User authentication failed."
            )

        success = await update_generated_data(resume_id, user_details.id, generated_data)
        
        if success:
            await invalidate_resumes_cache(request.app.redis, user_details.id)
            return {"message": "Generated data updated successfully.", "status": "success"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found or update failed."
            )
    except HTTPException as e:
        raise e  # Propagate known errors
    except Exception as e:
        print(f"[ERROR]: {e}")  # Log unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred."
        )