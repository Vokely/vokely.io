from fastapi import APIRouter, Depends, HTTPException, Request

from models.user_plan import UserPlanResponse

from crud.user_plan import UserPlanCRUD

from db.config import get_database

from utils.logger import logger

router = APIRouter()

def get_user_plan_crud(request: Request):
    db = request.app.mongodb()
    return UserPlanCRUD(db)

@router.get("/",response = UserPlanResponse)
async def get_user_current_plan(request:Request,user_id: str,user_plan_crud: UserPlanCRUD = Depends(get_user_plan_crud)):
    """Get user's current active plan"""
    try:
        user_id = request.state.user_id
        current_plan = await user_plan_crud.get_user_plan(user_id)
        
        if not current_plan:
            raise HTTPException(status_code=404, detail="No active plan found for this user")
        
        return current_plan
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.get("/{user_id}/history")
async def get_user_plan_history(user_id: str,user_plan_crud: UserPlanCRUD = Depends(get_user_plan_crud)):
    """Get all plans of the user (history including inactive ones)"""
    try:
        plans = await user_plan_crud.get_user_plan_history(user_id)
        return plans
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")