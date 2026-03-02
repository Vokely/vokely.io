from typing import Optional, List, Dict, Any
from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException
import json
from db.config import get_database
#models
from models.interview import Interview, InterviewExchange, AllInterviewsResponse
from models.resume import Resume

class InterviewCRUD:
    def __init__(self, db):
        self.db = db
        self.collection = self.db["interviews"]

    async def get_all_interviews_of_user(self, user_id: str) -> List[Dict[str, Any]]:
        try:
            pipeline = [
                {
                    "$match": {
                        "user_id": user_id  # Filter by user_id
                    }
                },
                {
                    "$addFields": {
                        "interview_id_str": {"$toString": "$_id"},
                        "resume_id_obj": {
                            "$cond": {
                                "if": {"$ne": ["$resume_id", None]},
                                "then": {"$toObjectId": "$resume_id"},
                                "else": None
                            }
                        }
                    }
                },
                {
                    "$lookup": {
                        "from": "resumes",
                        "localField": "resume_id_obj",  # Matching converted ObjectId
                        "foreignField": "_id",
                        "as": "resume"
                    }
                },
                {
                    "$unwind": {
                        "path": "$resume",
                        "preserveNullAndEmptyArrays": True
                    }
                },
                {
                    "$lookup": {
                        "from": "external_links",
                        "let": {"relationId": "$session_id"},  # Match session_id with relation_id
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$eq": ["$relation_id", "$$relationId"]  # Matching session_id with relation_id
                                    }
                                }
                            },
                            {
                                "$project": {
                                    "_id": 0,  # Exclude default _id
                                    "id": {"$toString": "$_id"},  # Add the id field with _id converted to string
                                    "name": 1,
                                    "candidate_name": 1,
                                    "expires": 1,
                                    "requires_password": 1,
                                    "type": 1,
                                    "created_at": 1,
                                    "created_by": 1,
                                }
                            }
                        ],
                        "as": "external_links"
                    }
                },
                {
                    "$project": {
                        "interview": {
                            "_id": "$interview_id_str",
                            "user_id": "$user_id",
                            "session_id": "$session_id",
                            "feedback": "$feedback",
                            "performance_rating": "$performance_rating",
                            "history": "$history",
                            "ideal_answers": "$ideal_answers",
                            "title": "$title",
                            "created_at": "$created_at",
                            "updated_at": "$updated_at"
                        },
                        "resume": {
                            "resume_id": {
                                "$cond": {
                                    "if": {"$ifNull": ["$resume._id", False]},
                                    "then": {"$toString": "$resume._id"},
                                    "else": None
                                }
                            },
                            "name": "$resume.name",
                            "job_description": "$resume.job_description",
                            "resume_details": "$resume.data",
                            "created_at": "$resume.created_at",
                            "modified_at": "$resume.modified_at"
                        },
                        "external_links": 1
                    }
                }
            ]
            result = await self.collection.aggregate(pipeline).to_list(None)
            return result

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error retrieving data: {str(e)}")

    async def get_interview_details_with_resume(self, session_id: str) -> Dict[str, Any]:
        """
        Get interview details along with associated resume information using an aggregation pipeline.
        The resume_id is fetched from the interview document itself.
        """        
        pipeline = [
            {
                "$match": {"session_id": session_id}
            },
            {
                "$addFields": {
                    "interview_id_str": {"$toString": "$_id"}
                }
            },
            {
                "$lookup": {
                    "from": "resumes",
                    "let": {"resume_id": "$resume_id"},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$eq": ["$_id", { "$toObjectId": "$$resume_id" }]
                                }
                            }
                        },
                        {
                            "$project": {
                                "_id": {"$toString": "$_id"},
                                "name": 1,
                                "job_description": 1,
                                "data": 1,
                                "created_at": 1,
                                "modified_at": 1
                            }
                        }
                    ],
                    "as": "resume_data"
                }
            },
            {
                "$unwind": {
                    "path": "$resume_data",
                    "preserveNullAndEmptyArrays": False
                }
            },
            {
                "$project": {
                    "interview": {
                        "interview_id": "$interview_id_str",
                        "user_id": "$user_id",
                        "session_id": "$session_id",
                        "feedback": "$feedback",
                        "performance_rating": "$performance_rating",
                        "history": "$history",
                        "ideal_answers": "$ideal_answers",
                        "title": "$title",
                        "created_at": "$created_at",
                        "updated_at": "$updated_at"
                    },
                    "resume": {
                        "resume_id": "$resume_data._id",
                        "name": "$resume_data.name",
                        "job_description": "$resume_data.job_description",
                        "resume_details": "$resume_data.data",
                        "created_at": "$resume_data.created_at",
                        "modified_at": "$resume_data.modified_at"
                    }
                }
            }
        ]

        cursor = self.collection.aggregate(pipeline)
        result = await cursor.to_list(length=1)

        if not result:
            interview = await self.collection.find_one({"_id": interview_obj_id})
            if not interview:
                raise HTTPException(status_code=404, detail="Interview not found")
            if "resume_id" not in interview:
                raise HTTPException(status_code=404, detail="Resume ID not found in interview")
            resume = await self.db["resumes"].find_one({"_id": ObjectId(interview["resume_id"])})
            if not resume:
                raise HTTPException(status_code=404, detail="Resume not found")
            raise HTTPException(status_code=500, detail="Failed to retrieve data")

        return result[0]     

    async def create_session(self, user_id: str, resume_id: str, session_id:str) -> str:
        """
        Creates a new interview session and returns the session ID.
        """
        session_data = {
            "user_id": user_id,
            "history": [],
            "ideal_answers": [],
            "title": "",
            "input_tokens": 0,
            "output_tokens": 0,
            "performance_rating": None,
            "session_id":session_id,
            "feedback": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "resume_id": resume_id,
        }

        result = await self.collection.insert_one(session_data)
        return str(result.inserted_id)

    async def update_history(self, session_id: str, exchange: InterviewExchange, title: Optional[str] = None, ideal_answer: Optional[str] = None):
        """
        Updates the interview history by adding a new exchange.
        """
        session = await self.collection.find_one({"session_id": session_id})

        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Update the interview history
        updated_history = session.get("history", []) + [exchange.dict()]
        updated_data = {
            "history": updated_history,
            "updated_at": datetime.utcnow()
        }
        if title:
            updated_data["title"] = title
        if ideal_answer:
            updated_data["ideal_answers"] = session.get("ideal_answers", []) + [ideal_answer]

        await self.collection.update_one(
            {"session_id": session_id},  
            {"$set": updated_data}
        )

    async def get_session(self, session_id: str) -> Optional[Interview]:
        """
        Retrieves an interview session by session_id.
        """
        session = await self.collection.find_one({"session_id":session_id})

        if not session:
            return None

        session["id"] = str(session["_id"])
        del session["_id"]

        return Interview(**session)

    async def update_session_metrics(
        self,
        session_id: str,
        performance_rating: int,
        input_tokens: int,
        output_tokens: int
    ):
        """
        Updates performance_rating, input_tokens, and output_tokens in a single operation.
        """
        session = await self.collection.find_one({"session_id": session_id})

        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        updated_data = {
            "performance_rating": performance_rating,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "updated_at": datetime.utcnow()
        }

        result = await self.collection.update_one(
            {"session_id": session_id},
            {"$set": updated_data}
        )
        return result.modified_count>0

    async def add_feedback(self, session_id: str, feedback: Dict[str, Any]):
        """
        adds the feedback to the db
        """
        session = await self.collection.find_one({"session_id": session_id})

        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # add the performance rating
        updated_data = {
            "feedback": feedback,
            "updated_at": datetime.utcnow()
        }

        await self.collection.update_one(
            {"session_id": session_id},
            {"$set": updated_data}
        )

    async def delete_interview(self, interview_id: str) -> bool:
        """
        Delete an interview by ID
        """
        try:
            obj_id = ObjectId(interview_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid interview ID format")
            
        result = await self.collection.delete_one({"_id": obj_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Interview not found")
            
        return result.deleted_count > 0
