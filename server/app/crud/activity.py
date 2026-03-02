from fastapi import HTTPException
from typing import List, Optional
from models.activity import ActivityCreate, ActivityInDB, ActionType
from bson import ObjectId
from datetime import datetime
from utils.json.serialize_json import serialize_mongo_document


class ActivityCRUD:
    def __init__(self, db):
        self.collection = db["activities"]

    async def create_activity(self, activity: ActivityCreate) -> ActivityInDB:
        activity_data = activity.dict()
        activity_data["created_at"] = datetime.utcnow()

        result = await self.collection.insert_one(activity_data)
        activity_data["id"] = str(result.inserted_id)
        return serialize_mongo_document(activity_data)

    async def get_all_activities(
        self, user_id: Optional[int] = None, action_type: Optional[ActionType] = None
    ) -> List[ActivityInDB]:
        query = {}
        if user_id:
            query["user_id"] = user_id
        if action_type:
            query["action_type"] = action_type.value

        activities = await self.collection.find(query).sort("created_at", -1).to_list(length=100)
        return [serialize_mongo_document(a) for a in activities]

    async def get_activity_by_id(self, activity_id: str) -> ActivityInDB:
        try:
            activity = await self.collection.find_one({"_id": ObjectId(activity_id)})
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid activity ID format")

        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
        
        return serialize_mongo_document(activity)

    async def delete_activity(self, activity_id: str) -> bool:
        try:
            result = await self.collection.delete_one({"_id": ObjectId(activity_id)})
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid activity ID format")

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Activity not found")
        return True

    async def delete_activities_by_user(self, user_id: int) -> dict:
        result = await self.collection.delete_many({"user_id": user_id})
        return {"deleted_count": result.deleted_count}
