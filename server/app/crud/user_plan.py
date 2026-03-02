from fastapi import HTTPException
from typing import Optional, Dict, Any, List
from datetime import datetime

from models.user_plan import UserPlanCreate, FeatureUsage
from utils.json.serialize_json import serialize_mongo_document


class UserPlanCRUD:
    def __init__(self, db):
        self.db = db
        self.collection = db["user_plans"] 

    async def create_user_plan(self, plan_data: UserPlanCreate) -> Dict[str, Any]:
        user_id = plan_data.user_id

        # Step 1: Check if an active plan of same type already exists
        existing_plan = await self.collection.find_one({
            "user_id": str(user_id),
            "is_active": True,
            "plan_details.plan_type" : str(plan_data.plan_details.plan_type)
        })

        if existing_plan:
            print(f"Existing plan found for user :{user_id} and plan: {plan_data.plan_details.plan_type}")
            return serialize_mongo_document(existing_plan)

        # Step 2: Deactivate all existing active plans for this user
        await self.collection.update_many(
            {"user_id": str(user_id), "is_active": True},
            {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
        )

        # Step 3: Insert the new active plan
        plan_dict = plan_data.dict()
        plan_dict["created_at"] = datetime.utcnow()
        plan_dict["updated_at"] = datetime.utcnow()
        plan_dict["is_active"] = True

        result = await self.collection.insert_one(plan_dict)
        return serialize_mongo_document(plan_dict)

    async def get_user_plan(self, user_id: str, filters: Optional[dict] = None) -> Optional[Dict[str, Any]]:
        query = {
            "user_id": user_id,
            "is_active": True
        }
        if filters:
            query.update(filters)  
        plan = await self.collection.find_one(query)
        if not plan:
            return None
        return serialize_mongo_document(plan)

    async def get_user_plan_history(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all plans for a user (both active and inactive) sorted by creation date"""
        plans = await self.collection.find(
            {"user_id": user_id}
        ).sort("created_at", -1).to_list(length=None)
        
        if not plans:
            return []
        
        return [serialize_mongo_document(plan) for plan in plans]

    async def update_usage(self, user_id: str, feature_name: str, daily_increment: int = 0, total_increment: int = 0) -> None:
        """Update usage for a specific feature"""
        update_operations = {}
        
        if daily_increment != 0:
            update_operations["usage_details.$.daily_usage"] = daily_increment
        if total_increment != 0:
            update_operations["usage_details.$.total_usage"] = total_increment

        if not update_operations:
            return

        result = await self.collection.update_one(
            {
                "user_id": user_id, 
                "is_active": True,
                "usage_details.name": feature_name
            },
            {
                "$inc": update_operations,
                "$set": {"updated_at": datetime.utcnow()}
            }
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail=f"User plan not found or feature '{feature_name}' does not exist")

    async def bulk_update_usage(self, user_id: str, usage_updates: Dict[str, Dict[str, int]]) -> None:
        """
        Bulk update usage for multiple features
        usage_updates format: {"feature_name": {"daily": increment, "total": increment}}
        """
        user_plan = await self.collection.find_one({"user_id": user_id, "is_active": True})
        if not user_plan:
            raise HTTPException(status_code=404, detail="User plan not found")

        # Build bulk update operations
        bulk_operations = []
        
        for feature_name, increments in usage_updates.items():
            update_fields = {}
            if increments.get("daily", 0) != 0:
                update_fields["usage_details.$.daily_usage"] = increments["daily"]
            if increments.get("total", 0) != 0:
                update_fields["usage_details.$.total_usage"] = increments["total"]
            
            if update_fields:
                bulk_operations.append({
                    "updateOne": {
                        "filter": {
                            "user_id": user_id,
                            "is_active": True,
                            "usage_details.name": feature_name
                        },
                        "update": {
                            "$inc": update_fields,
                            "$set": {"updated_at": datetime.utcnow()}
                        }
                    }
                })

        if bulk_operations:
            result = await self.collection.bulk_write(bulk_operations)
            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail="No matching features found for update")

    async def reset_daily_usage(self, user_id: str, feature_names: Optional[List[str]] = None) -> None:
        """Reset daily usage for specified features or all features if none specified"""
        user_plan = await self.collection.find_one({"user_id": user_id, "is_active": True})
        if not user_plan:
            raise HTTPException(status_code=404, detail="User plan not found")

        last_reset = user_plan.get("last_reset_at")
        today = datetime.utcnow().date()

        # Check if reset is needed (hasn't been reset today)
        if last_reset and last_reset.date() >= today:
            return  # Already reset today

        if feature_names:
            # Reset specific features
            for feature_name in feature_names:
                await self.collection.update_one(
                    {
                        "user_id": user_id,
                        "is_active": True,
                        "usage_details.name": feature_name
                    },
                    {
                        "$set": {
                            "usage_details.$.daily_usage": 0,
                            "last_reset_at": datetime.utcnow(),
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
        else:
            # Reset all features' daily usage
            result = await self.collection.update_one(
                {"user_id": user_id, "is_active": True},
                {
                    "$set": {
                        "usage_details.$[].daily_usage": 0,
                        "last_reset_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail="Failed to reset daily usage")

    async def get_feature_usage(self, user_id: str, feature_name: str) -> Optional[Dict[str, Any]]:
        """Get usage details for a specific feature"""
        user_plan = await self.collection.find_one(
            {"user_id": user_id, "is_active": True},
            {"usage_details": {"$elemMatch": {"name": feature_name}}}
        )
        
        if not user_plan or not user_plan.get("usage_details"):
            return None
            
        return user_plan["usage_details"][0]

    async def get_all_usage(self, user_id: str) -> List[Dict[str, Any]]:
        """Get usage details for all features"""
        user_plan = await self.collection.find_one(
            {"user_id": user_id, "is_active": True},
            {"usage_details": 1}
        )
        
        if not user_plan:
            raise HTTPException(status_code=404, detail="User plan not found")
            
        return user_plan.get("usage_details", [])

    async def add_feature_usage(self, user_id: str, feature_name: str, daily_usage: int = 0, total_usage: int = 0) -> None:
        """Add a new feature usage tracking to existing plan"""
        new_feature = FeatureUsage(
            name=feature_name,
            daily_usage=daily_usage,
            total_usage=total_usage
        )
        
        result = await self.collection.update_one(
            {"user_id": user_id, "is_active": True},
            {
                "$push": {"usage_details": new_feature.dict()},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User plan not found")

    async def remove_feature_usage(self, user_id: str, feature_name: str) -> None:
        """Remove a feature usage tracking from existing plan"""
        result = await self.collection.update_one(
            {"user_id": user_id, "is_active": True},
            {
                "$pull": {"usage_details": {"name": feature_name}},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User plan not found")

    async def deactivate_user_plan(self, user_id: str) -> bool:
        result = await self.collection.update_one(
            {"user_id": user_id, "is_active": True},
            {
                "$set": {
                    "is_active": False,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="No active plan found for this user.")
        
        return True