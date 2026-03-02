#crud/pricing_plans.py
from fastapi import HTTPException
from typing import Optional, List, Dict, Any
from bson import ObjectId
from models.pricing_plans import PlanCreate, PlanInDB, PlanUpdate, Feature
from utils.json.serialize_json import serialize_mongo_document
from datetime import datetime

class PricingPlanCRUD:
    def __init__(self, db):
        self.db = db
        self.collection = db["pricing_plans"]

    async def create_plan(self, plan_data: PlanCreate) -> PlanInDB:
        plan_create_data = plan_data.dict()
        plan_create_data["is_active"] = True
        result = await self.collection.insert_one(plan_create_data)
        plan_create_data["id"] = str(result.inserted_id)
        serialized_data = serialize_mongo_document(plan_create_data)
        return PlanInDB(**serialized_data)

    async def get_plan(self, plan_id: str) -> Optional[PlanInDB]:
        try:
            obj_id = ObjectId(plan_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid plan ID format")
        
        doc = await self.collection.find_one({"_id": obj_id})
        if doc:
            doc["id"] = str(doc["_id"])
            serialized_data = serialize_mongo_document(doc)
            return PlanInDB(**serialized_data)
        return None

    async def get_plan_by_product_id(self, product_id: str) -> Optional[Dict[str,Any]]:       
        doc = await self.collection.find_one({"dodo_product_id": product_id})
        if doc:
            serialized_data = serialize_mongo_document(doc)
            return serialized_data
        return None

    async def get_all_plans(self, filters: dict = None) -> List[PlanInDB]:
        query = {} 
        if filters:
            query.update(filters)
        docs = await self.collection.find(filters).to_list(length=100)
        serialized_docs = [serialize_mongo_document(doc) for doc in docs]
        return serialized_docs

    async def update_plan(self, plan_id: str, update_data: PlanUpdate):
        try:
            obj_id = ObjectId(plan_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid plan ID format")

        update_dict = update_data.dict(exclude_unset=True)

        result = await self.collection.find_one_and_update(
            {"_id": obj_id},
            {"$set": update_dict},
            return_document=True  
        )

        if not result:
            raise HTTPException(status_code=404, detail="PlanInDB not found")

        serialized_data = serialize_mongo_document(result)
        return serialized_data

    async def add_feature_to_all_plans(self, new_feature: Feature) -> Dict[str, Any]:
        """Add a new feature to all active pricing plans"""        
        feature_dict = new_feature.dict()
        
        result = await self.collection.update_many(
            {"is_active": True},
            {
                "$push": {"features": feature_dict},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return {
            "matched_count": result.matched_count,
            "modified_count": result.modified_count,
            "feature_added": feature_dict
        }

    async def check_feature_exists_in_plans(self, feature_name: str) -> bool:
        """Check if a feature with the given name already exists in any plan"""
        count = await self.collection.count_documents({
            "is_active": True,
            "features.name": feature_name
        })
        return count > 0


    async def delete_plan(self, plan_id: str) -> bool:
        try:
            obj_id = ObjectId(plan_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid plan ID format")
        
        result = await self.collection.delete_one({"_id": obj_id})
        return result.deleted_count == 1
