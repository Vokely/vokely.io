from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query, UploadFile, File

from db.config import get_database
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from bson import ObjectId
import json
#models
from models.admin_models import UsersWithTotalOut
from models.blog import BlogPost
from models.user_plan import UserPlanCreate
#crud
from crud.user import UserCRUD, get_user_details_from_header
from crud.transaction import TransactionCRUD
from crud.blog import BlogCRUD
from crud.user_plan import UserPlanCRUD
#utils
from db.config import get_database
from utils.gcp import upload_to_gcs
from utils.logger import logger
from utils.auth.jwt import convert_expires_to_datetime
from utils.redis.redis_keys import RedisKeys
#router
from routers.user_router import create_usage_details_from_plan_features

router = APIRouter()

class EmailList(BaseModel):
    emails: List[str]

class FeaturedUpdateRequest(BaseModel):
    featured: bool

class CoverImageUpdateRequest(BaseModel):
    is_cover_image: bool

async def get_blog_crud():
    db = await get_database()
    return BlogCRUD(db)

async def get_transaction_crud():
    db = await get_database()
    return TransactionCRUD(db)

async def get_user_crud():
    db = await get_database()
    return UserCRUD(db)

async def get_user_plan_crud():
    db = await get_database()
    return UserPlanCRUD(db)

MAX_FILE_SIZE_MB = 2
ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp"}

@router.get("/check-access")
async def check_admin_access():
    return {"message": "You have access to this route"}
    
def convert_objectid(doc):
    if "_id" in doc and isinstance(doc["_id"], ObjectId):
        doc["_id"] = str(doc["_id"])
    if "activities" in doc:
        for txn in doc["activities"]:
            if "_id" in txn and isinstance(txn["_id"], ObjectId):
                txn["id"] = str(txn["_id"])
                del txn["_id"]
                txn["created_at"] = txn["created_at"].isoformat()
    return doc

@router.get("/signedusers", response_model=UsersWithTotalOut)
async def get_all_users_with_transactions(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    date: Optional[str] = Query(None, description="Filter by single date (YYYY-MM-DD)"),
    start_date: Optional[str] = Query(None, description="Start date for range filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date for range filter (YYYY-MM-DD)")
):
    try:
        skip = (page - 1) * limit
        
        # Build date filter
        date_filter = {}
        if date:
            try:
                target_date = datetime.strptime(date, "%Y-%m-%d")
                next_day = target_date + timedelta(days=1)
                date_filter = {"created_at": {"$gte": target_date, "$lt": next_day}}
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        elif start_date or end_date:
            date_filter["created_at"] = {}
            if start_date:
                try:
                    start = datetime.strptime(start_date, "%Y-%m-%d")
                    date_filter["created_at"]["$gte"] = start
                except ValueError:
                    raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD")
            if end_date:
                try:
                    end = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
                    date_filter["created_at"]["$lt"] = end
                except ValueError:
                    raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD")
        
        db = await get_database()
        
        # ---------------------------
        # 1️⃣ User aggregation
        # ---------------------------
        pipeline = []
        if date_filter:
            pipeline.append({"$match": date_filter})
        pipeline.extend([
            {"$addFields": {"string_id": {"$toString": "$_id"}}},
            {
                "$lookup": {
                    "from": "activities",
                    "let": {"uid": "$string_id"},
                    "pipeline": [
                        {"$match": {"$expr": {"$eq": ["$user_id", "$$uid"]}}},
                        {
                            "$group": {
                                "_id": {"feature_name": "$feature_name", "action_type": "$action_type"},
                                "count": {"$sum": 1},
                                "created_at": {"$min": "$created_at"}  # optional: earliest activity
                            }
                        },
                        {
                            "$project": {
                                "_id": 0,
                                "feature_name": "$_id.feature_name",
                                "action_type": "$_id.action_type",
                                "count": 1,
                                "created_at": 1
                            }
                        }
                    ],
                    "as": "activities"
                }
            },
            {"$project": {"string_id": 0}},
            {"$skip": skip},
            {"$limit": limit}
        ])
        
        users = await db["users"].aggregate(pipeline).to_list(length=limit)
        users = [convert_objectid(user) for user in users]

        # ---------------------------
        # 2️⃣ Total counts aggregation
        # ---------------------------
        total_pipeline = []
        if date_filter:
            total_pipeline.append({"$match": date_filter})
        total_pipeline.extend([
            {"$lookup": {
                "from": "activities",
                "let": {"uid": {"$toString": "$_id"}},
                "pipeline": [
                    {"$match": {"$expr": {"$eq": ["$user_id", "$$uid"]}}}
                ],
                "as": "activities"
            }},
            {"$unwind": "$activities"},
            {"$group": {
                "_id": {"feature_name": "$activities.feature_name", "action_type": "$activities.action_type"},
                "total_count": {"$sum": 1}
            }},
            {"$project": {
                "_id": 0,
                "feature_name": "$_id.feature_name",
                "action_type": "$_id.action_type",
                "total_count": 1
            }}
        ])
        total_counts = await db["users"].aggregate(total_pipeline).to_list(length=None)

        return {
            "users": users,
            "total": {
                "users_count": await db["users"].count_documents(date_filter if date_filter else {}),
                "activities_count": total_counts
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users")
async def get_users_by_filter(
    username: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, gt=0),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    user_crud: UserCRUD = Depends(get_user_crud),
):
    """
    Endpoint to get users based on query parameters with pagination.
    - username: substring match (case-insensitive)
    - email: substring match (case-insensitive)
    - is_active: optional boolean filter
    - offset / limit: pagination
    """
    try:
        query: Dict[str, Any] = {}

        if username:
            query["username"] = {"$regex": username, "$options": "i"}

        if email:
            query["email"] = {"$regex": email, "$options": "i"}

        if is_active is not None:
            query["is_active"] = is_active

        # paginated users
        users = await user_crud.find_users_by_query(
            query=query,
            offset=offset,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return {
            "users": users or [],
            "offset": offset,
            "limit": limit,
        }

    except Exception as e:
        logger.error(f"Error retrieving users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while retrieving users: {str(e)}",
        )

@router.get("/user-count")
async def get_user_count(request: Request):
    """
    Endpoint to get the total number of users signed up.
    """
    try:
        header_details = await get_user_details_from_header(request)
        db = await get_database()
        user_crud = UserCRUD(db)
        user_count = await user_crud.count_users()
        return {"total_users": user_count}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while retrieving user count: {str(e)}",
        )

#Blogs
@router.post("/blogs/add")
async def create_blog(blog: BlogPost, blog_crud: BlogCRUD = Depends(get_blog_crud)):
    try:
        return await blog_crud.create_blog(blog)
    except HTTPException as http_exc:
        raise http_exc

@router.post("/blogs/add-image/{blog_id}")
async def add_image_to_blog(
    blog_id: str,
    file: UploadFile = File(...),
    blog_crud: BlogCRUD = Depends(get_blog_crud)
):
    try:
        # Check MIME type
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only PNG, JPG, JPEG, and WEBP images are allowed."
            )

        # Check file size (read bytes and check length)
        file_content = await file.read()
        file_size_mb = len(file_content) / (1024 * 1024)
        if file_size_mb > MAX_FILE_SIZE_MB:
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST,
                detail="File size exceeds the 2MB limit."
            )

        # Get blog and slug
        blog = await blog_crud.get_blog_by_id(blog_id)
        if not blog:
            raise HTTPException(status_code=404, detail="Blog not found")

        slug = blog["slug"]
        file_name = f"{slug}.png"
        upload_path = f"blogs/{slug}/"

        # Upload image to GCS
        public_url = upload_to_gcs(file_content, file_name, file.content_type, upload_path)

        # Update blog with image URL
        updated_blog = await blog_crud.add_image_to_blog(blog_id, public_url)
        return updated_blog

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading blog image: {str(e)}")

@router.patch("/blogs/set-featured/{blog_id}")
async def set_featured_blog(blog_id: str, featured_update: FeaturedUpdateRequest, blog_crud: BlogCRUD = Depends(get_blog_crud)):
    try:
        # Call the CRUD method to update the featured status
        updated_blog = await blog_crud.set_featured(blog_id, featured_update.featured)
        return updated_blog
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating blog featured status: {str(e)}")

@router.patch("/blogs/set-cover-image/{blog_id}")
async def set_cover_image_blog(blog_id: str, cover_image_update: CoverImageUpdateRequest, blog_crud: BlogCRUD = Depends(get_blog_crud)):
    try:
        await blog_crud.set_cover_image(blog_id, cover_image_update.is_cover_image)
        return {"message": "Cover image set successfully"}
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating blog cover image status: {str(e)}")
    
@router.delete("/blogs/{blog_id}")
async def delete_blog(blog_id: str,  blog_crud: BlogCRUD = Depends(get_blog_crud)):
    try:
        await blog_crud.delete_blog(blog_id)
        return {"message": "Blog deleted successfully"}
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting blog: {str(e)}")

#User Plans
@router.get("/user-plan")
async def get_user_plan_by_email(email:str = Query(None, description="The email should be passed here"),user_crud= Depends(get_user_crud), user_plan_crud = Depends(get_user_plan_crud)):
    try:
        user_details = await user_crud.find_user_by_email(email)
        if user_details is None:
            raise HTTPException(status_code=404,detail="User not found")
        
        user_plan = await user_plan_crud.get_user_plan(user_details.id)
        if not user_plan:
            raise HTTPException(status_code=404, detail="User plan not found")
        return user_plan
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving user plan: {str(e)}")

@router.patch("/user-plan/upgrade")
async def upgrade_user_plan(request:Request,details: Dict[str,Any], user_plan_crud: UserPlanCRUD = Depends(get_user_plan_crud)):
    try:
        if isinstance(details, str):
            details = json.loads(details)
        user_id = details.get("user_id")
        expiry_date_str = details.get("expiry_date")
        plan_details = details.get("plan_details")

        # Validate input
        if not (user_id and expiry_date_str and plan_details):
            raise HTTPException(status_code=400, detail="Please provide user_id, expiry_date, and plan_details")
        
        plan_id = plan_details.get("id")

        #Convert into ISO format
        expiry_date = None
        try:
            expiry_date = convert_expires_to_datetime(expiry_date_str)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="expiry_date must be in ISO format (e.g., 2025-12-31T23:59:59)"
            )
        
        #Check if is a future date
        now = now = datetime.now(timezone.utc)  
        if expiry_date <= now:
            raise HTTPException(
                status_code=400,
                detail="expiry_date must be a future date."
            )

        existing_user_plan = await user_plan_crud.get_user_plan(user_id)
        plan_features = plan_details.get("features", [])
        usage_details = []
            
        usage_details = create_usage_details_from_plan_features(plan_features)
        user_plan_create = UserPlanCreate(
                user_id=user_id,
                plan_id=plan_id,
                geo_location_details=existing_user_plan.get("geo_location_details"),
                plan_details=plan_details,
                usage_details=usage_details,
                expiry_date=expiry_date
            )
        
        #De-activate the current plan and create a new one
        status = await user_plan_crud.deactivate_user_plan(user_id)
        if not status:
            raise HTTPException(status_code=500, detail="Error deactivating existing user plan")
        created_plan = await user_plan_crud.create_user_plan(user_plan_create)
        cache_key = RedisKeys.get_user_data(user_id)
        user_plan_cache_key = RedisKeys.get_user_plan(user_id)
        await request.app.redis.delete_key(cache_key)
        await request.app.redis.delete_key(user_plan_cache_key) 
        return created_plan
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Error upgrading user plan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error upgrading user plan: {str(e)}")

from utils.email_service import send_mail_to_many
from pydantic import EmailStr
import asyncio

MAX_RECIPIENTS_PER_EMAIL = 20

class BulkEmailRequest(BaseModel):
    recipients : List[EmailStr]
    subject: str
    body: str

def chunk_list(items: List[str], size: int) -> List[List[str]]:
    return [items[i:i + size] for i in range(0, len(items), size)]

@router.post("/send-bulk-email")
async def send_bulk_email(payload: BulkEmailRequest):
    if not payload.recipients:
        raise HTTPException(status_code=400, detail="Recipient list is empty")

    # Split into batches to respect limits
    batches = chunk_list([str(r) for r in payload.recipients], MAX_RECIPIENTS_PER_EMAIL)

    try:
        # Send batches concurrently for speed
        send_tasks = [
            send_mail_to_many(batch, payload.subject, payload.body)
            for batch in batches
        ]
        await asyncio.gather(*send_tasks)

    except Exception as e:
        # Log error in real app
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send bulk email: {str(e)}"
        )

    return {
        "message": "Bulk emails sent successfully",
        "total_recipients": len(payload.recipients),
        "batches": len(batches),
        "batch_size": MAX_RECIPIENTS_PER_EMAIL,
    }