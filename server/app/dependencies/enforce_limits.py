# dependencies/enforce_limits.py
import functools
from fastapi import HTTPException, Request
from datetime import datetime
from typing import Union
from functools import wraps
from utils.logger import logger
from utils.redis.redis_keys import RedisKeys
from utils.auth.exceptions import CustomHTTPException

def feature_limit(features: Union[str, list[str]]):
    """
    Enforces feature capacity and rate limits for one or more features.
    - `features`: Single feature name (str) or list of feature names (list[str])
    """
    if isinstance(features, str):
        features = [features]  # normalize to list

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request: Request = kwargs.get("request")
            if not request:
                raise HTTPException(status_code=400, detail="Request object not found.")

            user_id = request.state.user_id
            if not user_id:
                raise HTTPException(status_code=401, detail="Unauthorized")

            # 1️⃣ Get user's plan & limits from MongoDB
            user_plan = request.state.user_plan
            plan_details = user_plan.get("plan_details")
            usage_details = user_plan.get("usage_details", [])
            
            if not user_plan:
                raise HTTPException(status_code=500, detail="Plan details not found.")

            # logger.info(f"features : {plan_details.get("features", [])}")
            # 2️⃣ Loop through each feature & check limits
            for feature in features:
                # Find the feature in plan_details
                plan_feature = next(
                    (f for f in plan_details.get("features", []) if f.get("name") == feature),
                    None
                )
                if not plan_feature:
                    logger.error(f"Feature not found: {feature}")
                    raise HTTPException(
                        status_code=403,
                        detail=f"Feature not available in your plan.Please upgrade to access this feature."
                    )

                # Find the feature usage in usage_details
                feature_usage = next(
                    (u for u in usage_details if u.get("name") == feature),
                    None
                )
                
                # If feature usage not found, assume zero usage and continue
                # The post-processor will handle adding the missing usage entry
                if not feature_usage:
                    logger.warning(f"Feature usage not found for '{feature}', assuming zero usage. Post-processor will initialize.")
                    current_total_usage = 0
                    current_daily_usage = 0
                else:
                    current_total_usage = feature_usage.get("total_usage", 0)
                    current_daily_usage = feature_usage.get("daily_usage", 0)

                # a) Total capacity limit check (-1 means unlimited)
                total_capacity = plan_feature.get("total_capacity")

                if total_capacity != -1 and total_capacity is not None and current_total_usage >= total_capacity:
                    raise CustomHTTPException(
                        status_code=429,
                        message="Total limit exceeded for your current tier. Please upgrade to continue",
                        error="capacity_exceeded",
                        feature=feature,
                        current_usage=current_total_usage,
                        limit=total_capacity
                    )

                # b) Daily limit check (-1 means unlimited)
                daily_limit = plan_feature.get("daily_limit")
                
                if daily_limit != -1 and daily_limit is not None and current_daily_usage >= daily_limit:
                    raise CustomHTTPException(
                        status_code=429,
                        message=f"Daily limit reached for the feature.",
                        error="daily_limit_exceeded",
                        feature=feature,
                        current_daily_usage=current_daily_usage,
                        daily_limit=daily_limit,
                        reset_time="00:00 UTC"
                    )

            # 3️⃣ Passed all checks → proceed
            return await func(*args, **kwargs)

        return wrapper
    return decorator


# Helper function to increment usage after successful operation
async def increment_feature_usage(request: Request, feature_name: str, daily_increment: int = 1, total_increment: int = 1):
    """
    Helper function to increment feature usage after successful operation
    """
    user_id = request.state.user_id
    db = request.app.mongodb
    redis = request.app.redis
    
    # Update in database
    result = await db["user_plans"].update_one(
        {
            "user_id": user_id,
            "is_active": True,
            "usage_details.name": feature_name
        },
        {
            "$inc": {
                "usage_details.$.daily_usage": daily_increment,
                "usage_details.$.total_usage": total_increment
            },
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    if result.matched_count == 0:
        logger.error(f"Failed to increment usage for feature: {feature_name}")
        return False
    
    # Clear user plan cache to force refresh
    cache_key = RedisKeys.get_user_plan(user_id) 
    await redis.delete(cache_key)
    
    return True