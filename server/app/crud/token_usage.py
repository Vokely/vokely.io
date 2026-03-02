from fastapi import HTTPException
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from models.token_usage import TokenUsageCreate, TokenUsageInDb
from utils.json.serialize_json import serialize_mongo_document


class TokenUsageCRUD:
    def __init__(self, db):
        self.collection = db["token_usage"]
        self.users_collection = db["users"]

    async def record_usage(self, usage: TokenUsageCreate) -> TokenUsageInDb:
        """Create a new token usage record with time series structure"""
        usage_data = {
            "meta": {
                "user_id": usage.user_id,
                "module_id": usage.module_id,
                "model": usage.model,
            },
            "input_tokens": usage.input_tokens,
            "output_tokens": usage.output_tokens,
            "created_at": datetime.utcnow(),
        }

        result = await self.collection.insert_one(usage_data)
        usage_data["id"] = str(result.inserted_id)
        return serialize_mongo_document(usage_data)

        
        return serialize_mongo_document(usage)

    async def get_all_usage(
        self,
        user_id: Optional[str] = None,
        module_id: Optional[str] = None,
        model: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100,
    ) -> List[TokenUsageInDb]:
        """Get token usage records with optional filters"""
        query = {}
        
        if user_id:
            query["meta.user_id"] = user_id
        if module_id:
            query["meta.module_id"] = module_id
        if model:
            query["meta.model"] = model
        
        if start_date or end_date:
            query["created_at"] = {}
            if start_date:
                query["created_at"]["$gte"] = start_date
            if end_date:
                query["created_at"]["$lte"] = end_date

        usage_records = await self.collection.find(query).sort("created_at", -1).limit(limit).to_list(length=limit)
        return [serialize_mongo_document(u) for u in usage_records]

    async def delete_usage(self, usage_id: str) -> bool:
        """Delete a single token usage record"""
        try:
            result = await self.collection.delete_one({"_id": ObjectId(usage_id)})
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid usage ID format")

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Token usage record not found")
        return True

    # ==================== ANALYTICS AGGREGATIONS ====================

    async def get_total_tokens_by_user(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """Get total input/output tokens aggregated by user with user details"""
        match_stage = {}
        if start_date or end_date:
            match_stage["created_at"] = {}
            if start_date:
                match_stage["created_at"]["$gte"] = start_date
            if end_date:
                match_stage["created_at"]["$lte"] = end_date

        pipeline = [
            {"$match": match_stage} if match_stage else {"$match": {}},
            {
                "$group": {
                    "_id": "$meta.user_id",
                    "total_input_tokens": {"$sum": "$input_tokens"},
                    "total_output_tokens": {"$sum": "$output_tokens"},
                    "total_requests": {"$sum": 1},
                }
            },
            {
                "$addFields": {
                    "user_object_id": {
                        "$cond": {
                            "if": {"$eq": [{"$type": "$_id"}, "string"]},
                            "then": {"$toObjectId": "$_id"},
                            "else": "$_id"
                        }
                    }
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_object_id",
                    "foreignField": "_id",
                    "as": "user_info"
                }
            },
            {
                "$unwind": {
                    "path": "$user_info",
                    "preserveNullAndEmptyArrays": True
                }
            },
            {
                "$project": {
                    "user_id": "$_id",
                    "user_name": {"$ifNull": ["$user_info.name", "Unknown User"]},
                    "user_email": {"$ifNull": ["$user_info.email", None]},
                    "user_created_at": {"$ifNull": ["$user_info.created_at", None]},
                    "total_input_tokens": 1,
                    "total_output_tokens": 1,
                    "total_tokens": {"$add": ["$total_input_tokens", "$total_output_tokens"]},
                    "total_requests": 1,
                    "_id": 0,
                }
            },
            {"$sort": {"total_tokens": -1}},
        ]

        result = await self.collection.aggregate(pipeline).to_list(length=None)
        return result

    async def get_total_tokens_by_module(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """Get total input/output tokens aggregated by module"""
        match_stage = {}
        if start_date or end_date:
            match_stage["created_at"] = {}
            if start_date:
                match_stage["created_at"]["$gte"] = start_date
            if end_date:
                match_stage["created_at"]["$lte"] = end_date

        pipeline = [
            {"$match": match_stage} if match_stage else {"$match": {}},
            {
                "$group": {
                    "_id": "$meta.module_id",
                    "total_input_tokens": {"$sum": "$input_tokens"},
                    "total_output_tokens": {"$sum": "$output_tokens"},
                    "total_requests": {"$sum": 1},
                }
            },
            {
                "$project": {
                    "module_id": "$_id",
                    "total_input_tokens": 1,
                    "total_output_tokens": 1,
                    "total_tokens": {"$add": ["$total_input_tokens", "$total_output_tokens"]},
                    "total_requests": 1,
                    "_id": 0,
                }
            },
            {"$sort": {"total_tokens": -1}},
        ]

        result = await self.collection.aggregate(pipeline).to_list(length=None)
        return result

    async def get_total_tokens_by_model(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """Get total input/output tokens aggregated by model"""
        match_stage = {}
        if start_date or end_date:
            match_stage["created_at"] = {}
            if start_date:
                match_stage["created_at"]["$gte"] = start_date
            if end_date:
                match_stage["created_at"]["$lte"] = end_date

        pipeline = [
            {"$match": match_stage} if match_stage else {"$match": {}},
            {
                "$group": {
                    "_id": "$meta.model",
                    "total_input_tokens": {"$sum": "$input_tokens"},
                    "total_output_tokens": {"$sum": "$output_tokens"},
                    "total_requests": {"$sum": 1},
                }
            },
            {
                "$project": {
                    "model": "$_id",
                    "total_input_tokens": 1,
                    "total_output_tokens": 1,
                    "total_tokens": {"$add": ["$total_input_tokens", "$total_output_tokens"]},
                    "total_requests": 1,
                    "_id": 0,
                }
            },
            {"$sort": {"total_tokens": -1}},
        ]

        result = await self.collection.aggregate(pipeline).to_list(length=None)
        return result

    async def get_usage_over_time(
        self,
        granularity: str = "day",  # hour, day, week, month
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        user_id: Optional[str] = None,
        module_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Get token usage aggregated over time with specified granularity"""
        match_stage = {}
        if start_date or end_date:
            match_stage["created_at"] = {}
            if start_date:
                match_stage["created_at"]["$gte"] = start_date
            if end_date:
                match_stage["created_at"]["$lte"] = end_date
        if user_id:
            match_stage["meta.user_id"] = user_id
        if module_id:
            match_stage["meta.module_id"] = module_id

        # Define date grouping based on granularity
        date_group = {
            "hour": {
                "year": {"$year": "$created_at"},
                "month": {"$month": "$created_at"},
                "day": {"$dayOfMonth": "$created_at"},
                "hour": {"$hour": "$created_at"},
            },
            "day": {
                "year": {"$year": "$created_at"},
                "month": {"$month": "$created_at"},
                "day": {"$dayOfMonth": "$created_at"},
            },
            "week": {
                "year": {"$year": "$created_at"},
                "week": {"$week": "$created_at"},
            },
            "month": {
                "year": {"$year": "$created_at"},
                "month": {"$month": "$created_at"},
            },
        }

        pipeline = [
            {"$match": match_stage} if match_stage else {"$match": {}},
            {
                "$group": {
                    "_id": date_group.get(granularity, date_group["day"]),
                    "total_input_tokens": {"$sum": "$input_tokens"},
                    "total_output_tokens": {"$sum": "$output_tokens"},
                    "total_requests": {"$sum": 1},
                }
            },
            {
                "$project": {
                    "period": "$_id",
                    "total_input_tokens": 1,
                    "total_output_tokens": 1,
                    "total_tokens": {"$add": ["$total_input_tokens", "$total_output_tokens"]},
                    "total_requests": 1,
                    "_id": 0,
                }
            },
            {"$sort": {"period": 1}},
        ]

        result = await self.collection.aggregate(pipeline).to_list(length=None)
        return result

    async def get_user_module_breakdown(
        self,
        user_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """Get detailed breakdown of token usage by module for a specific user"""
        match_stage = {"meta.user_id": user_id}
        if start_date or end_date:
            match_stage["created_at"] = {}
            if start_date:
                match_stage["created_at"]["$gte"] = start_date
            if end_date:
                match_stage["created_at"]["$lte"] = end_date

        pipeline = [
            {"$match": match_stage},
            {
                "$group": {
                    "_id": {
                        "module_id": "$meta.module_id",
                        "model": "$meta.model",
                    },
                    "total_input_tokens": {"$sum": "$input_tokens"},
                    "total_output_tokens": {"$sum": "$output_tokens"},
                    "total_requests": {"$sum": 1},
                    "avg_input_tokens": {"$avg": "$input_tokens"},
                    "avg_output_tokens": {"$avg": "$output_tokens"},
                }
            },
            {
                "$project": {
                    "module_id": "$_id.module_id",
                    "model": "$_id.model",
                    "total_input_tokens": 1,
                    "total_output_tokens": 1,
                    "total_tokens": {"$add": ["$total_input_tokens", "$total_output_tokens"]},
                    "total_requests": 1,
                    "avg_input_tokens": {"$round": ["$avg_input_tokens", 2]},
                    "avg_output_tokens": {"$round": ["$avg_output_tokens", 2]},
                    "_id": 0,
                }
            },
            {"$sort": {"total_tokens": -1}},
        ]

        result = await self.collection.aggregate(pipeline).to_list(length=None)
        return result

    async def get_top_users(
        self,
        limit: int = 10,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """Get top users by token consumption with user details"""
        match_stage = {}
        if start_date or end_date:
            match_stage["created_at"] = {}
            if start_date:
                match_stage["created_at"]["$gte"] = start_date
            if end_date:
                match_stage["created_at"]["$lte"] = end_date

        pipeline = [
            {"$match": match_stage} if match_stage else {"$match": {}},
            {
                "$group": {
                    "_id": "$meta.user_id",
                    "total_tokens": {"$sum": {"$add": ["$input_tokens", "$output_tokens"]}},
                    "total_input_tokens": {"$sum": "$input_tokens"},
                    "total_output_tokens": {"$sum": "$output_tokens"},
                    "total_requests": {"$sum": 1},
                    "avg_tokens_per_request": {"$avg": {"$add": ["$input_tokens", "$output_tokens"]}},
                }
            },
            {
                "$addFields": {
                    "user_object_id": {
                        "$cond": {
                            "if": {"$eq": [{"$type": "$_id"}, "string"]},
                            "then": {"$toObjectId": "$_id"},
                            "else": "$_id"
                        }
                    }
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_object_id",
                    "foreignField": "_id",
                    "as": "user_info"
                }
            },
            {
                "$unwind": {
                    "path": "$user_info",
                    "preserveNullAndEmptyArrays": True
                }
            },
            {
                "$project": {
                    "user_id": "$_id",
                    "user_name": {"$ifNull": ["$user_info.name", "Unknown User"]},
                    "user_email": {"$ifNull": ["$user_info.email", None]},
                    "user_created_at": {"$ifNull": ["$user_info.created_at", None]},
                    "total_tokens": 1,
                    "total_input_tokens": 1,
                    "total_output_tokens": 1,
                    "total_requests": 1,
                    "avg_tokens_per_request": {"$round": ["$avg_tokens_per_request", 2]},
                    "_id": 0,
                }
            },
            {"$sort": {"total_tokens": -1}},
            {"$limit": limit},
        ]

        result = await self.collection.aggregate(pipeline).to_list(length=limit)
        return result

    async def get_dashboard_summary(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Get comprehensive dashboard summary statistics"""
        match_stage = {}
        if start_date or end_date:
            match_stage["created_at"] = {}
            if start_date:
                match_stage["created_at"]["$gte"] = start_date
            if end_date:
                match_stage["created_at"]["$lte"] = end_date

        pipeline = [
            {"$match": match_stage} if match_stage else {"$match": {}},
            {
                "$group": {
                    "_id": None,
                    "total_input_tokens": {"$sum": "$input_tokens"},
                    "total_output_tokens": {"$sum": "$output_tokens"},
                    "total_requests": {"$sum": 1},
                    "unique_users": {"$addToSet": "$meta.user_id"},
                    "unique_modules": {"$addToSet": "$meta.module_id"},
                    "unique_models": {"$addToSet": "$meta.model"},
                    "avg_input_tokens": {"$avg": "$input_tokens"},
                    "avg_output_tokens": {"$avg": "$output_tokens"},
                }
            },
            {
                "$project": {
                    "total_input_tokens": 1,
                    "total_output_tokens": 1,
                    "total_tokens": {"$add": ["$total_input_tokens", "$total_output_tokens"]},
                    "total_requests": 1,
                    "unique_users_count": {"$size": "$unique_users"},
                    "unique_modules_count": {"$size": "$unique_modules"},
                    "unique_models_count": {"$size": "$unique_models"},
                    "avg_input_tokens": {"$round": ["$avg_input_tokens", 2]},
                    "avg_output_tokens": {"$round": ["$avg_output_tokens", 2]},
                    "avg_tokens_per_request": {
                        "$round": [{"$add": ["$avg_input_tokens", "$avg_output_tokens"]}, 2]
                    },
                    "_id": 0,
                }
            },
        ]

        result = await self.collection.aggregate(pipeline).to_list(length=1)
        return result[0] if result else {}

    async def get_usage_comparison(
        self,
        current_start: datetime,
        current_end: datetime,
        previous_start: datetime,
        previous_end: datetime,
    ) -> Dict[str, Any]:
        """Compare usage between two time periods"""
        async def get_period_stats(start: datetime, end: datetime):
            pipeline = [
                {"$match": {"created_at": {"$gte": start, "$lte": end}}},
                {
                    "$group": {
                        "_id": None,
                        "total_tokens": {"$sum": {"$add": ["$input_tokens", "$output_tokens"]}},
                        "total_requests": {"$sum": 1},
                    }
                },
            ]
            result = await self.collection.aggregate(pipeline).to_list(length=1)
            return result[0] if result else {"total_tokens": 0, "total_requests": 0}

        current_stats = await get_period_stats(current_start, current_end)
        previous_stats = await get_period_stats(previous_start, previous_end)

        # Calculate percentage changes
        token_change = 0
        request_change = 0
        
        if previous_stats["total_tokens"] > 0:
            token_change = (
                (current_stats["total_tokens"] - previous_stats["total_tokens"]) 
                / previous_stats["total_tokens"] 
                * 100
            )
        
        if previous_stats["total_requests"] > 0:
            request_change = (
                (current_stats["total_requests"] - previous_stats["total_requests"]) 
                / previous_stats["total_requests"] 
                * 100
            )

        return {
            "current_period": {
                "total_tokens": current_stats["total_tokens"],
                "total_requests": current_stats["total_requests"],
            },
            "previous_period": {
                "total_tokens": previous_stats["total_tokens"],
                "total_requests": previous_stats["total_requests"],
            },
            "changes": {
                "token_change_percent": round(token_change, 2),
                "request_change_percent": round(request_change, 2),
            },
        }