from fastapi import HTTPException
from typing import List, Optional, Dict, Any
from models.skillgap import SkillGapBase, SkillGapResponse, SkillGapCreate
from bson import ObjectId
from datetime import datetime


class SkillGapCRUD:
    def __init__(self, db):
        self.collection = db["skill_gaps"]

    async def create_skill_gap_report(self, skill_gap_data: SkillGapBase):
        """Create a new skill gap report"""
        try:
            existing = await self.collection.find_one({
                "user_id": skill_gap_data.user_id,
                "resume_id": skill_gap_data.resume_id,
            })
            
            report_data = skill_gap_data.dict()
            report_data["created_at"] = datetime.utcnow()
            report_data["updated_at"] = datetime.utcnow()
            
            result = await self.collection.insert_one(report_data)
            
            created_report = await self.collection.find_one({"_id": result.inserted_id})
            created_report["id"] = str(created_report["_id"])
            del created_report["_id"]
            
            return created_report
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error creating skill gap report: {str(e)}")

    async def get_skill_reports_by_resume_id(self, resume_id: int, user_id: int):
        """Get all active skill gap reports by resume ID for a specific user"""
        try:
            cursor = self.collection.find({
                "resume_id": resume_id,
                "user_id": user_id,
                "status": 1
            })

            reports = []
            async for report in cursor:
                report["id"] = str(report["_id"])
                del report["_id"]
                reports.append(report)

            if not reports:
                raise HTTPException(status_code=404, detail="No active skill gap reports found")

            return reports

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching skill gap reports: {str(e)}")

    async def get_skill_report_by_id(self, report_id: str, user_id: int):
        """Get active skill gap report by report ID for a specific user"""
        try:
            if not ObjectId.is_valid(report_id):
                raise HTTPException(status_code=400, detail="Invalid report ID format")
            
            report = await self.collection.find_one({
                "_id": ObjectId(report_id),
                "user_id": user_id,
                "status": 1  
            })
            
            if not report:
                raise HTTPException(status_code=404, detail="Active skill gap report not found")
            
            report["id"] = str(report["_id"])
            del report["_id"]
            return report
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching skill gap report: {str(e)}")

    async def update_skill_gap_report(self, report_id: str, update_data: Dict[str, Any]):
        """Update active skill gap report with new data"""
        try:
            if not ObjectId.is_valid(report_id):
                raise HTTPException(status_code=400, detail="Invalid report ID format")
            
            existing_report = await self.collection.find_one({
                "_id": ObjectId(report_id),
                "status": 1
            })
            
            if not existing_report:
                raise HTTPException(status_code=404, detail="Active skill gap report not found")
            
            update_data = {k: v for k, v in update_data.items() if v is not None}
            update_data["updated_at"] = datetime.utcnow()
            
            result = await self.collection.update_one(
                {
                    "_id": ObjectId(report_id),
                    "status": 1  
                },
                {"$set": update_data}
            )
            
            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail="Active skill gap report not found")
            
            # Return updated report
            updated_report = await self.collection.find_one({"_id": ObjectId(report_id)})
            updated_report["id"] = str(updated_report["_id"])
            del updated_report["_id"]
            
            return updated_report
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error updating skill gap report: {str(e)}")

    async def delete_skill_gap_report(self, report_id: str, user_id: int):
        """Soft delete skill gap report by setting status to 0"""
        try:
            if not ObjectId.is_valid(report_id):
                raise HTTPException(status_code=400, detail="Invalid report ID format")
            
            # First check if the report exists and is active
            existing_report = await self.collection.find_one({
                "_id": ObjectId(report_id),
                "user_id": user_id,
                "status": 1
            })
            
            if not existing_report:
                raise HTTPException(status_code=404, detail="Active skill gap report not found")
            
            result = await self.collection.update_one(
                {
                    "_id": ObjectId(report_id),
                    "user_id": user_id,
                    "status": 1  # Only soft delete active reports
                },
                {
                    "$set": {
                        "status": 0,  # Set status to inactive
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail="Active skill gap report not found")
            
            return {"message": "Skill gap report deleted successfully"}
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error deleting skill gap report: {str(e)}")

    async def get_all_skill_reports_by_user(self, user_id: int, limit: int = 50):
        """Get all active skill gap reports for a user"""
        try:
            reports = await self.collection.find(
                {
                    "user_id": user_id,
                    "status": 1  
                }
            ).sort("updated_at", -1).to_list(length=limit)
            
            for report in reports:
                report["id"] = str(report["_id"])
                del report["_id"]
            
            return reports
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching skill gap reports: {str(e)}")