from fastapi import HTTPException
from typing import List, Optional
from models.ats import ATSAnalysisResponse, ATSAnalysisInDB
from datetime import datetime
from utils.json.serialize_json import serialize_mongo_document
from utils.json.json_encoder import EnhancedJSONEncoder
import json
from bson import ObjectId

class ATSCRUD:
    def __init__(self, db):
        self.collection = db["ats_reports"]

    async def create_report(self, report: ATSAnalysisResponse, user_id: str, resume_id: str, jd_tailored: bool = False) -> ATSAnalysisInDB:
        """
        Create a new ATS analysis report
        
        Args:
            report: ATSAnalysisResponse object containing the analysis data
            user_id: ID of the user creating the report
            resume_id: ID of the resume being analyzed
            jd_tailored: Whether the analysis was tailored to a job description
            
        Returns:
            dict: Created report data with MongoDB ObjectId converted to string
        """
        try:
            # Convert the report to dict and add metadata
            report_data = report.dict()
            report_data.update({
                "user_id": user_id,
                "resume_id": resume_id,
                "jd_tailored": jd_tailored,
                "created_at": datetime.utcnow()
            })
            
            # Insert into database
            result = await self.collection.insert_one(report_data)
            
            # Get the created document and use enhanced JSON encoding
            created_report = await self.collection.find_one({"_id": result.inserted_id})
            serialized_json = serialize_mongo_document(created_report)

            return serialized_json
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error creating report: {str(e)}")

    async def get_report_by_id(self, report_id: str) -> Optional[ATSAnalysisInDB]:
        """
        Get a specific ATS report by its ID
        
        Args:
            report_id: MongoDB ObjectId as string
            
        Returns:
            dict or None: Report data if found, None otherwise
        """
        try:
            # Validate ObjectId format
            if type(report_id) == str:
                report_id = ObjectId(report_id.strip())

            if not ObjectId.is_valid(report_id):
                raise HTTPException(status_code=400, detail="Invalid report ID format")
            
            # Find the report
            report = await self.collection.find_one({"_id": ObjectId(report_id)})
            
            if not report:
               raise HTTPException(status_code=404, detail="Report not found")
            
            serialized_json = serialize_mongo_document(report)
            return serialized_json
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error retrieving report: {str(e)}")

    async def get_all_reports_of_user(self, user_id: str, skip: int = 0, limit: int = 100) -> List[ATSAnalysisInDB]:
        """
        Get all ATS reports for a specific user
        
        Args:
            user_id: ID of the user
            skip: Number of documents to skip (for pagination)
            limit: Maximum number of documents to return
            
        Returns:
            List[dict]: List of user's reports
        """
        try:
            cursor = self.collection.find({"user_id": user_id}).skip(skip).limit(limit).sort("created_at", -1)
            reports = await cursor.to_list(length=limit)
            
            # Use enhanced JSON encoder for proper serialization
            for report in reports:
                report["id"] = str(report["_id"])
                del report["_id"]
            
            return json.loads(json.dumps(reports, cls=EnhancedJSONEncoder))
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error retrieving user reports: {str(e)}")

    async def get_all_reports(
        self,
        user_id: Optional[str] = None,
        resume_id: Optional[str] = None,
        jd_tailored: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[ATSAnalysisInDB]:
        """
        Get all ATS reports with optional filtering
        
        Args:
            user_id: Filter by user ID (optional)
            resume_id: Filter by resume ID (optional)
            jd_tailored: Filter by whether analysis was JD tailored (optional)
            skip: Number of documents to skip (for pagination)
            limit: Maximum number of documents to return
            
        Returns:
            List[dict]: List of filtered reports
        """
        try:
            # Build filter query
            filter_query = {}
            
            if user_id:
                filter_query["user_id"] = user_id
            
            if resume_id:
                filter_query["resume_id"] = resume_id
                
            if jd_tailored is not None:
                filter_query["jd_tailored"] = jd_tailored
            
            # Execute query with filters
            cursor = self.collection.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
            reports = await cursor.to_list(length=limit)
            
            # Use enhanced JSON encoder for proper serialization
            for report in reports:
                report["id"] = str(report["_id"])
                del report["_id"]
            
            return json.loads(json.dumps(reports, cls=EnhancedJSONEncoder))
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error retrieving reports: {str(e)}")

    async def get_report_count_by_user(self, user_id: str) -> int:
        """
        Get total count of reports for a specific user
        
        Args:
            user_id: ID of the user
            
        Returns:
            int: Total number of reports for the user
        """
        try:
            count = await self.collection.count_documents({"user_id": user_id})
            return count
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error counting user reports: {str(e)}")

    async def get_total_report_count(
        self,
        user_id: Optional[str] = None,
        resume_id: Optional[str] = None,
        jd_tailored: Optional[bool] = None
    ) -> int:
        """
        Get total count of reports with optional filtering
        
        Args:
            user_id: Filter by user ID (optional)
            resume_id: Filter by resume ID (optional)
            jd_tailored: Filter by whether analysis was JD tailored (optional)
            
        Returns:
            int: Total number of filtered reports
        """
        try:
            # Build filter query
            filter_query = {}
            
            if user_id:
                filter_query["user_id"] = user_id
            
            if resume_id:
                filter_query["resume_id"] = resume_id
                
            if jd_tailored is not None:
                filter_query["jd_tailored"] = jd_tailored
            
            count = await self.collection.count_documents(filter_query)
            return count
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error counting reports: {str(e)}")

    async def delete_report(self, report_id: str, user_id: Optional[str] = None) -> bool:
        """
        Delete an ATS report by ID
        
        Args:
            report_id: MongoDB ObjectId as string
            user_id: Optional user ID to ensure user can only delete their own reports
            
        Returns:
            bool: True if deleted successfully, False if not found
        """
        try:
            # Validate ObjectId format
            if not ObjectId.is_valid(report_id):
                raise HTTPException(status_code=400, detail="Invalid report ID format")
            
            # Build delete query
            delete_query = {"_id": ObjectId(report_id)}
            if user_id:
                delete_query["user_id"] = user_id
            
            result = await self.collection.delete_one(delete_query)
            return result.deleted_count > 0
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error deleting report: {str(e)}")

    async def update_report(self, report_id: str, update_data: dict, user_id: Optional[str] = None) -> Optional[ATSAnalysisInDB]:
        """
        Update an ATS report
        
        Args:
            report_id: MongoDB ObjectId as string
            update_data: Dictionary of fields to update
            user_id: Optional user ID to ensure user can only update their own reports
            
        Returns:
            dict or None: Updated report data if found and updated, None otherwise
        """
        try:
            if type(report_id) == str:
                report_id = ObjectId(report_id.strip())

            # Validate ObjectId format
            if not ObjectId.is_valid(report_id):
                raise HTTPException(status_code=400, detail="Invalid report ID format")
            
            # Build update query
            query = {"_id": report_id}
            if user_id:
                query["user_id"] = user_id
            
            # Add updated timestamp
            update_data["updated_at"] = datetime.utcnow()
            
            result = await self.collection.find_one_and_update(
                query,
                {"$set": update_data},
                return_document=True
            )
            
            if result:
                result["id"] = str(result["_id"])
                del result["_id"]
                return json.loads(json.dumps(result, cls=EnhancedJSONEncoder))
            
            return None
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error updating report: {str(e)}")