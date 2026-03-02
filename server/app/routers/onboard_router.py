from fastapi import APIRouter, status, Request, HTTPException
from fastapi.responses import JSONResponse
import json
from models.user import OnBoardingRequest, OnBoardingResponse
from crud.user import UserCRUD, get_user_details_from_header

from db.config import get_database
from utils.redis.redis_keys import RedisKeys
from constants.credit_constants import USER_LIMIT

router = APIRouter()

async def invalidate_onboarding_cache(redis_client, user_id: str):
    """
    Helper function to invalidate onboarding details cache for a user.
    Call this whenever onboarding details are updated.
    """
    cache_key = RedisKeys.user_onboarding_details(user_id)
    await redis_client.delete_key(cache_key)
    print(f"Invalidated onboarding cache for user: {user_id}")


@router.get("/details", response_model=OnBoardingResponse)
async def get_onboarding_details(request: Request):
    """
    Fetch full onboarding details for the authenticated user and set CSRF cookie.
    Uses Redis caching to improve performance.
    """
    try:
        user_details = await get_user_details_from_header(request)
        if not user_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        cache_key = RedisKeys.user_onboarding_details(user_details.id)        
        cached_data = await request.app.redis.get_value(cache_key)
        
        if cached_data:
            print("Onboarding details fetched from cache")
            onboarding_details_dict = json.loads(cached_data)
            response = JSONResponse(content=onboarding_details_dict)
            return response

        db = await get_database()
        user_crud = UserCRUD(db)

        onboarding_details = await user_crud.get_onboarding_details(user_details.id)
        onboarding_details_dict = onboarding_details.dict()

        await request.app.redis.set_value(
            key=cache_key,
            value=json.dumps(onboarding_details_dict),
            expire_seconds=3600 
        )

        response = JSONResponse(content=onboarding_details_dict)
        return response

    except HTTPException as http_exec:
        raise http_exec
    except Exception as e:
        print(f"Error occurred while fetching onboarding details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching onboarding details"
        )

@router.put("/update")
async def update_onboarding_details(onboarding_details: OnBoardingRequest,request: Request):
    """
    Update onboarding details for the authenticated user.
    """
    try:
        user_details = await get_user_details_from_header(request)
        if not user_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        db = await get_database()
        user_crud = UserCRUD(db)
        
        updated_details = await user_crud.update_onboarding_details(user_details.id, onboarding_details)

        #invalidate redis cache
        await invalidate_onboarding_cache(request.app.redis, user_details.id)

        return {
            "success": True,
            "message": "Onboarding details updated successfully",
            "onboarding_details": updated_details
        }

    except HTTPException as http_exec:
        raise http_exec
    except Exception as e:
        print(f"Error occured while updating onboard details {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while updating onboarding details"
        )


@router.put("/complete", response_model=OnBoardingResponse)
async def complete_onboarding(request: Request):
    """
    Mark onboarding as completed for the authenticated user.
    """
    try:
        user_details = await get_user_details_from_header(request)
        if not user_details:
            raise HTTPException(status_code=404, detail="User not found")

        db = await get_database()
        user_crud = UserCRUD(db)
        updated_details = await user_crud.mark_onboarding_completed(user_details.id)

        #invalidate redis cache
        await invalidate_onboarding_cache(request.app.redis, user_details.id)

        return updated_details

    except HTTPException as http_exec:
        raise http_exec
    except Exception as e:
        print(f"Error occured while completing onboarding {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while completing onboarding"
        )