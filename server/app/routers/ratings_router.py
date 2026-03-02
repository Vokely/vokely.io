from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from typing import Optional
#models
from models.rating import RatingRequest
#crud
from crud.rating import RatingCRUD
from crud.user import UserCRUD
from crud.roadmap import RoadmapCRUD
from db.config import get_database
from middleware.authorize import verify_admin_access 

router = APIRouter()

async def get_rating_crud():
    db = await get_database()
    return RatingCRUD(db)

async def get_user_crud():
    db = await get_database()
    return UserCRUD(db)

async def get_roadmap_crud():
    db = await get_database()  
    return RoadmapCRUD(db)

@router.post("/", response_model=dict)
async def create_rating(
    request: Request,
    rating: RatingRequest,
    rating_crud: RatingCRUD = Depends(get_rating_crud),
):
    """
    Create a new rating.
    """
    try:
        module_name = rating.module_name
        user_id = request.state.user_id
        created = await rating_crud.create_rating(rating, user_id)
        if module_name == "roadmap":
            update_fields = {
                "feedback_received" : True
            }
            roadmap_crud = await get_roadmap_crud()
            await roadmap_crud.update_roadmap(rating.module_id,update_fields)
        return JSONResponse(status_code=201, content={"message": "Rating created successfully", "data": created})
    except HTTPException as http_exc:
        raise http_exc
    except Exception as exc:
        print(exc)
        raise HTTPException(status_code=500, detail="An Error cccured while submitting rating")


####################
#   ADMIN ROUTES  #
####################

@router.get("/")
async def get_all_ratings(
    request: Request,
    rating: Optional[float] = Query(default=None, description="Filter ratings greater than this value"),
    module_name: Optional[str] = Query(default=None, description="Filter ratings by module name"),
    user_id: Optional[str] = Query(default=None, description="Filter ratings by user_id"),
    rating_crud: RatingCRUD = Depends(get_rating_crud)
):
    """
    Get all ratings with optional filters.
    """
    try:
        ratings = await rating_crud.get_all_ratings(
            min_rating=rating,
            module_name=module_name,
            user_id=user_id
        )

        user_details = None
        if user_id is not None:
            print(user_id)
            user_crud = await get_user_crud()
            user_details = await user_crud.find_user_by_id(user_id)

        response_data = {} 
        if user_details:
            response_data["user_details"] = user_details
            
        response_data["ratings"] = ratings

        return JSONResponse(status_code=200, content=response_data)

    except HTTPException as http_exc:
        raise http_exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))