# dependencies/feature_usage_processor.py
import functools
from fastapi import HTTPException, Request, Response
from datetime import datetime
from typing import Any, Union, List, Optional
from functools import wraps
from utils.logger import logger
from pymongo import UpdateOne
from utils.redis.redis_keys import RedisKeys
# db
from db.config import get_database
#crud 
from crud.activity import ActivityCRUD
from crud.token_usage import TokenUsageCRUD
#models
from models.activity import ActivityCreate
from models.token_usage import TokenUsageCreate

async def get_activity_crud():
    db = await get_database()
    return ActivityCRUD(db)

async def get_token_usage_crud():
    db = await get_database()
    return TokenUsageCRUD(db)

class FeatureUsageConfig:
    """Configuration for feature usage tracking"""
    def __init__(
        self, 
        feature_name: str, 
        daily_increment: int = 1, 
        total_increment: int = 1,
        condition: callable = None
    ):
        self.feature_name = feature_name
        self.daily_increment = daily_increment
        self.total_increment = total_increment
        self.condition = condition  # Optional condition function to check before incrementing

def track_tokens(feature: str | None = None):
    """
    feature: str  → log token usage + feature usage
    feature: None → log token usage ONLY
    """

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract request
            request: Request = kwargs.get("request") or (
                len(args) > 0 and isinstance(args[0], Request) and args[0]
            )

            if not request:
                raise HTTPException(
                    status_code=400,
                    detail="Request object not found for token tracking."
                )
            try:
                result = await func(*args, **kwargs)
                await log_token_usage_from_state(
                        request=request,
                        feature_name=feature
                    )
                return result
            except Exception as e:
                logger.error(f"Function failed, not incrementing usage: {str(e)}")
                raise e
            
        return wrapper
    return decorator

async def log_token_usage_from_state(request: Request,feature_name: str):
    token_info = getattr(request.state, "token_usage", None)
    if not token_info:
        return
    user_id = request.state.user_id

    try:
        token_data = TokenUsageCreate(
            user_id=user_id or "system",
            module_id=feature_name or "system_module",
            input_tokens=int(token_info.get("input_tokens", 0)),
            output_tokens=int(token_info.get("output_tokens", 0)),
            model=token_info.get("model")
        )
        token_usage_crud = await get_token_usage_crud()
        await token_usage_crud.record_usage(token_data)
    except Exception as e:
        print("Token logging failed:", e)

def track_feature_usage(features: Union[str, List[str], FeatureUsageConfig, List[FeatureUsageConfig]]):
    """
    Post-processor decorator to track feature usage after successful API calls.
    
    Args:
        features: Can be:
            - Single feature name (str)
            - List of feature names (List[str]) 
            - Single FeatureUsageConfig for advanced configuration
            - List of FeatureUsageConfig for multiple features with different configs
    
    Usage Examples:
        @track_feature_usage("ai_resume_generator")
        @track_feature_usage(["ai_resume_generator", "ats_checker"])
        @track_feature_usage(FeatureUsageConfig("ai_resume_generator", daily_increment=2))
        @track_feature_usage([
            FeatureUsageConfig("ai_resume_generator", daily_increment=1),
            FeatureUsageConfig("ats_checker", daily_increment=1, condition=lambda result: result.get("ats_score") > 0)
        ])
    """
    
    # Normalize input to list of FeatureUsageConfig
    if isinstance(features, str):
        feature_configs = [FeatureUsageConfig(features)]
    elif isinstance(features, FeatureUsageConfig):
        feature_configs = [features]
    elif isinstance(features, list):
        feature_configs = []
        for feature in features:
            if isinstance(feature, str):
                feature_configs.append(FeatureUsageConfig(feature))
            elif isinstance(feature, FeatureUsageConfig):
                feature_configs.append(feature)
            else:
                raise ValueError(f"Invalid feature type: {type(feature)}")
    else:
        raise ValueError(f"Invalid features parameter type: {type(features)}")

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request: Request = kwargs.get("request")
            if not request:
                raise HTTPException(status_code=400, detail="Request object not found.")

            result = None
            try:
                # Execute the original function
                # logger.debug(f"[track_feature_usage] Calling {func.__name__} with args={args}, kwargs={kwargs}")
                result = await func(*args, **kwargs)
                # logger.debug(f"[track_feature_usage] {func.__name__} executed successfully. Result={result}")

                # If successful, increment usage for all configured features
                await _increment_multiple_features_usage(request, feature_configs, result)
                await update_activity(request, feature_configs)
                
                return result
                
            except Exception as e:
                # Don't increment usage if the function failed
                logger.error(f"Function failed, not incrementing usage: {str(e)}")
                raise e

        return wrapper
    return decorator

async def update_activity(request: Request, feature_configs: List[FeatureUsageConfig]):
    """Log activity for each feature used"""
    activity_crud = await get_activity_crud()
    user_id = request.state.user_id
    method = request.method.lower()
    logger.debug(f"Logging activity for user_id: {user_id} for method: {method}")
    for config in feature_configs:
        try:
            activity = await activity_crud.create_activity(
                activity=ActivityCreate(
                    user_id=user_id,
                    action_type=method,
                    feature_name=config.feature_name,
                    metadata={
                        "daily_increment": config.daily_increment,
                        "total_increment": config.total_increment
                    }
                )
            )
            logger.info(f"Logged activity for user {user_id} on feature {config.feature_name}")
        except Exception as e:
            logger.error(f"Failed to log activity for user {user_id} on feature {config.feature_name}: {str(e)}")

async def _increment_multiple_features_usage(
    request: Request, 
    feature_configs: List[FeatureUsageConfig], 
    function_result: Any = None
):
    """Internal function to increment usage for multiple features"""
    user_id = request.state.user_id
    logger.debug(f"Incrementing usage for user_id: {user_id} for features: {[c.feature_name for c in feature_configs]}")
    if not user_id:
        logger.error("User ID not found in request state")
        return False

    # Group updates by feature to batch them
    updates_to_apply = []
    
    for config in feature_configs:
        # Check condition if provided
        if config.condition and not config.condition(function_result):
            logger.info(f"Condition not met for feature: {config.feature_name}, skipping usage increment")
            continue
            
        updates_to_apply.append(config)
    
    if not updates_to_apply:
        return True

    # Apply all updates in a single database operation
    success = await _bulk_increment_usage_(request, updates_to_apply)
    
    if success:
        logger.info(f"Successfully incremented usage for features: {[c.feature_name for c in updates_to_apply]}")
    else:
        logger.error(f"Failed to increment usage for features: {[c.feature_name for c in updates_to_apply]}")
    
    return success

async def _bulk_increment_usage_(request: Request, feature_configs: List[FeatureUsageConfig]) -> bool:
    """Optimized bulk increment with upsert to reduce DB operations"""
    user_id = request.state.user_id
    db = request.app.mongodb
    redis = request.app.redis
    
    try:
        # Single operation using upsert-like behavior with conditional updates
        bulk_operations = []
        for config in feature_configs:
            # For each feature, try to increment if exists, or add if missing
            update_fields = {}
            if config.daily_increment != 0:
                update_fields["usage_details.$.daily_usage"] = config.daily_increment
            if config.total_increment != 0:
                update_fields["usage_details.$.total_usage"] = config.total_increment
            
            if update_fields:
                # Try to increment existing entry
                bulk_operations.append(
                    UpdateOne(
                        {
                            "user_id": user_id,
                            "is_active": True,
                            "usage_details.name": config.feature_name
                        },
                        {
                            "$inc": update_fields,
                            "$set": {"updated_at": datetime.utcnow()}
                        }
                    )
                )
        
        # Execute first attempt
        if bulk_operations:
            result = await db["user_plans"].bulk_write(bulk_operations, ordered=False)
            logger.info(f"First bulk update: matched={result.matched_count}, modified={result.modified_count}")
        
        # If some features weren't matched, add them in a single operation
        if result.matched_count < len(feature_configs):
            # Get current user plan to see what's missing
            user_plan = await db["user_plans"].find_one({
                "user_id": user_id,
                "is_active": True
            })
            
            existing_features = {u.get("name") for u in user_plan.get("usage_details", [])}
            missing_configs = [c for c in feature_configs if c.feature_name not in existing_features]
            
            if missing_configs:
                # Add all missing features in one operation
                new_entries = []
                for config in missing_configs:
                    new_entries.append({
                        "name": config.feature_name,
                        "daily_usage": config.daily_increment,
                        "total_usage": config.total_increment,
                        "last_reset": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0),
                        "created_at": datetime.utcnow()
                    })
                
                await db["user_plans"].update_one(
                    {"user_id": user_id, "is_active": True},
                    {
                        "$push": {"usage_details": {"$each": new_entries}},
                        "$set": {"updated_at": datetime.utcnow()}
                    }
                )
                
                logger.info(f"Added {len(missing_configs)} missing feature entries")
        
        # Clear cache
        cache_key = RedisKeys.get_user_plan(user_id) 
        await redis.delete_key(cache_key)
        
        return True
        
    except Exception as e:
        logger.error(f"Error in optimized bulk increment: {str(e)}")
        return False

# Helper function for manual usage increment (if needed outside decorators)
async def increment_feature_usage_manual(
    request: Request, 
    feature_name: str, 
    daily_increment: int = 1, 
    total_increment: int = 1
) -> bool:
    """
    Manually increment feature usage (for cases where decorator can't be used)
    """
    config = FeatureUsageConfig(feature_name, daily_increment, total_increment)
    return await _bulk_increment_usage(request, [config])

# Convenience decorators for common patterns
def track_single_feature(feature_name: str, daily_increment: int = 1, total_increment: int = 1):
    """Convenience decorator for tracking a single feature"""
    return track_feature_usage(FeatureUsageConfig(feature_name, daily_increment, total_increment))

def track_ai_generation(feature_name: str = "ai_resume_generator"):
    """Convenience decorator for AI generation features"""
    return track_feature_usage(FeatureUsageConfig(feature_name, daily_increment=1, total_increment=1))

def track_conditional_feature(feature_name: str, condition: callable, daily_increment: int = 1, total_increment: int = 1):
    """Convenience decorator for conditional tracking"""
    return track_feature_usage(FeatureUsageConfig(
        feature_name, 
        daily_increment, 
        total_increment, 
        condition
    ))