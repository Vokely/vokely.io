# dependencies/user_plan.py
from fastapi import HTTPException, Request
from datetime import datetime
import json
from typing import Dict, Any
from utils.json.serialize_json import serialize_mongo_document
from utils.redis.redis_keys import RedisKeys
from utils.logger import logger
from models.pricing_plans import PlanType

async def get_pricing_plans_cache(mongodb, redis) -> Dict[str, Any]:
    """Fetch and cache all pricing plans"""
    cache_key = RedisKeys.get_pricing_plans()
    cached_plans = await redis.get_value(cache_key)
    
    if cached_plans:
        return json.loads(cached_plans)
    
    # Fetch all pricing plans from database
    pricing_plans = await mongodb["pricing_plans"].find({"is_active": True}).to_list(None)
    
    # Convert to dictionary with plan_id as key for quick lookup
    plans_dict = {str(plan["_id"]): plan for plan in pricing_plans}
    
    #serialize json
    serialized_json = serialize_mongo_document(plans_dict)

    # Cache for 5 minutes (300 seconds)
    await redis.set_value(
        key=cache_key, 
        value=json.dumps(serialized_json), 
        expire_seconds=300
    )
    
    return serialized_json

async def get_active_user_plan(request: Request):
    """Loads the active user plan for the authenticated user with proper validation"""
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "unauthenticated",
                "message": "Authentication required. Provide a valid access token.",
                "code": "AUTH_401"
            }
        )

    redis = request.app.redis
    mongodb = request.app.mongodb

    # Try to get from cache first
    cache_key = RedisKeys.get_user_plan(user_id) 
    cached = await redis.get_value(cache_key)
    if cached:
        user_plan = json.loads(cached)
        # Ensure pricing plans are cached
        await get_pricing_plans_cache(mongodb, redis)
        request.state.user_plan = user_plan
        return user_plan

    # Fetch from database
    user_plan = await mongodb["user_plans"].find_one(
        {"user_id": user_id, "is_active": True}
    )

    if not user_plan:
        raise HTTPException(
            status_code=403,
            detail={
                "error": "plan_not_found",
                "message": "No active subscription found. Please subscribe to a plan.",
                "code": "PLAN_NOT_FOUND"
            }
        )
    
    is_free_plan = user_plan.get("plan_details").get("plan_type")==PlanType.FREE
    # Check if plan has expired
    if not is_free_plan and user_plan.get("expiry_date") and datetime.utcnow() > user_plan["expiry_date"]:
        # Deactivate expired plan
        await mongodb["user_plans"].update_one(
            {"_id": user_plan["_id"]},
            {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
        )
        
        raise HTTPException(
            status_code=403,
            detail={
                "error": "subscription_expired",
                "message": "Your subscription has expired. Please renew to continue.",
                "code": "PLAN_EXPIRED",
                "plan": {
                    "plan_type": user_plan["plan_details"]["plan_type"],
                    "plan_name": user_plan["plan_details"]["name"],
                    "expiry_date": user_plan["expiry_date"].isoformat()
                }
            }
        )

    # Get detailed pricing plan information
    plan_id = user_plan["plan_id"]
    pricing_plans = await get_pricing_plans_cache(mongodb, redis)
    
    detailed_plan = pricing_plans.get(plan_id)
    if detailed_plan:
        # Merge detailed plan information
        user_plan["plan_details"] = detailed_plan
    
    # Reset daily usage if needed (check if last reset was not today)
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    last_reset = user_plan.get("last_reset_at", datetime.min)
    
    if isinstance(last_reset, str):
        last_reset = datetime.fromisoformat(last_reset.replace('Z', '+00:00'))
    
    if last_reset.replace(tzinfo=None).date() < today.date():
        # Reset daily usage for all features in usage_details
        usage_details = user_plan.get("usage_details", [])
        
        # Reset daily_usage to 0 for all features
        reset_operations = []
        for i, feature_usage in enumerate(usage_details):
            reset_operations.append({
                f"usage_details.{i}.daily_usage": 0
            })
        
        if reset_operations:
            # Combine all reset operations into a single update
            update_fields = {}
            for op in reset_operations:
                update_fields.update(op)
            
            await mongodb["user_plans"].update_one(
                {"_id": user_plan["_id"]},
                {
                    "$set": {
                        **update_fields,
                        "last_reset_at": today,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            # Update the user_plan object in memory
            for feature_usage in usage_details:
                feature_usage["daily_usage"] = 0
            
            user_plan["last_reset_at"] = today

    #serialize json
    serialized_json = serialize_mongo_document(user_plan)

    # Cache for 60 seconds
    await redis.set_value(
        key=cache_key, 
        value=json.dumps(serialized_json), 
        expire_seconds=60
    )

    request.state.user_plan = user_plan
    return user_plan