from fastapi import HTTPException, status
from typing import List, Optional
from models.rating import RatingRequest, RatingInDB
from models.global_models import ModuleName

from utils.json.serialize_json import serialize_mongo_document
from datetime import datetime
from bson import ObjectId


class RatingCRUD:
    def __init__(self, db):
        self.collection = db["ratings"]

    async def create_rating(self, rating: RatingRequest, user_id:str):
        """Create a new rating document."""
        if rating.module_name not in ModuleName.__members__.values():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid module_name: '{rating.module_name}'. Must be one of {[m.value for m in ModuleName]}"
            )

        rating_in_db = RatingInDB(
            user_id=user_id,
            module_name=rating.module_name,
            module_id=rating.module_id,
            rating=rating.rating,
            comment=rating.comment,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        # Insert into MongoDB
        result = await self.collection.insert_one(rating_in_db.dict())

        # Return inserted data with inserted ID
        rating_dict = rating_in_db.dict()
        rating_dict["id"] = str(result.inserted_id)
        rating_dict["created_at"] = rating_dict["created_at"]
        rating_dict["updated_at"] = rating_dict["updated_at"]
        return serialize_mongo_document(rating_dict)

    async def get_all_ratings(
    self,
    min_rating: Optional[float] = None,
    module_name: Optional[ModuleName] = None,
    user_id: Optional[str] = None
    ) -> List[dict]:
        """Fetch all ratings with optional filters."""
        query = {}
        if min_rating is not None:
            query["rating"] = {"$gte": min_rating}

        if module_name is not None and module_name not in [m.value for m in ModuleName]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid module_name: '{module_name}'. Must be one of {[m.value for m in ModuleName]}"
            )
        elif module_name is not None:
            query["module_name"] = module_name
        
        if user_id is not None:
            query["user_id"] = user_id
        
        cursor = self.collection.find(query)
        results = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            results.append(doc)
        return serialize_mongo_document(results)