from typing import List, Optional, Tuple
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel, Field
from bson import ObjectId
from fastapi import HTTPException
from models.roadmap import RoadmapDB, RoadMapItem, ContentItem, Links, RoadmapResponseJSON, LearningStatus, GroqSummaryResponseJSON


class RoadmapCRUD:
    def __init__(self, db):
        self.db = db
        self.collection = self.db["roadmap"]

    def serialize_roadmap(self, roadmap: dict):
        roadmap["_id"] = str(roadmap["_id"])
        roadmap["id"] = roadmap["_id"]
        del roadmap["_id"]
        roadmap["user_id"] = str(roadmap["user_id"])
        return roadmap
    def authorize(self,roadmap:dict, user_id: str):
        if str(roadmap.get("user_id")) != str(user_id):
            return False
        return True

    async def create(self, user_id: str, skill: str, raw_roadmap: RoadmapResponseJSON, report_id: Optional[str] = None):
        """
        Converts raw GEMINI response into the DB format and inserts it.
        """
        processed_roadmap = []
        for item in raw_roadmap:
            sub_headings = [
                ContentItem(heading=sub.get("heading",""),summary=[],sub_heading_task_status=LearningStatus.NOT_STARTED,sub_heading_status=LearningStatus.NOT_STARTED, links=Links(),your_task=sub.get("your_task", "")).dict()
                for sub in item["sub_headings"]
            ]
            processed_roadmap.append(
                RoadMapItem(heading=item["heading"], sub_headings=sub_headings,comprehensive_task=item.get("comprehensive_task", ""),heading_task_status=LearningStatus.NOT_STARTED).dict()
            )
        roadmap_doc = {
            "user_id":ObjectId(user_id),
            "skill":skill,
            "roadmap":processed_roadmap,
            "created_at": datetime.utcnow(),
            "modified_at": datetime.utcnow(),
            "streak": 0,
            "last_logged_at": datetime.utcnow(),
            "status" : 1,
            "feedback_received": False
        }
        if report_id:
            roadmap_doc["report_id"] = report_id

        result = await self.collection.insert_one(roadmap_doc)
        return {
            "report_id": roadmap_doc["report_id"] if report_id else None,
            "id": str(result.inserted_id),  
            "user_id": str(roadmap_doc["user_id"]),
            "skill": roadmap_doc["skill"],
            "roadmap": roadmap_doc["roadmap"],  
            "created_at": roadmap_doc["created_at"],
            "modified_at": roadmap_doc["modified_at"],
            "streak": roadmap_doc["streak"],
            "last_logged_at": roadmap_doc["last_logged_at"],
            "status": roadmap_doc["status"],
            "feedback_received": roadmap_doc["feedback_received"]
        }

    async def update_roadmap(self, roadmap_id: str, update_fields: dict):
        """
        Updates fields of a roadmap document.
        """
        roadmap_object_id = ObjectId(roadmap_id)
        update_fields["modified_at"] = datetime.utcnow()
        result = await self.collection.update_one(
            {"_id": roadmap_object_id},
            {"$set": update_fields}
        )
        if result.modified_count == 0:
            raise HTTPException(
                status_code=400,
                detail="Failed to update the roadmap"
            )
        updated_data = await self.collection.find_one({"_id": roadmap_object_id})
        return self.serialize_roadmap(updated_data)

    async def update_links(self, user_id: str, roadmap_id: str, heading: str, new_links: List[Links]):
        """
        Updates all sub_heading links under a specific roadmap heading.
        """
        roadmap_object_id = ObjectId(roadmap_id)
        roadmap_doc = await self.collection.find_one({"_id": roadmap_object_id, "status": 1})
        if not roadmap_doc:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        authorized = self.authorize(roadmap_doc, user_id)
        if not authorized:
            raise HTTPException(status_code=403, detail="Unauthorized access")

        updated = False
        
        for item in roadmap_doc.get("roadmap", []):
            if item.get("heading") == heading:
                for sub_heading in item.get("sub_headings", []):
                    matching_link = None
                    for link in new_links:
                        if sub_heading.get("heading") == link.get("heading"):
                            matching_link = link
                            break

                    if matching_link:
                        sub_heading["links"] = matching_link["links"]
                        updated = True
                break

        if updated:
            update_fields = {
                "roadmap": roadmap_doc["roadmap"],
                "modified_at": datetime.utcnow(),
            }

            result = await self.collection.update_one(
                {"_id": roadmap_object_id},
                {"$set": update_fields}
            )
            if result.modified_count == 0:
                raise HTTPException(
                    status_code=400,
                    detail="Failed to update the roadmap"
                )
            updated_data = await self.collection.find_one({"_id": roadmap_object_id})
            return self.serialize_roadmap(updated_data)
        return None

    async def update_subheading_task_status(self, roadmap_id: str, heading: str, subheading: Optional[str], new_status: LearningStatus, type: str):
        roadmap_object_id = ObjectId(roadmap_id)
        roadmap_doc = await self.collection.find_one({"_id": roadmap_object_id})

        if not roadmap_doc:
            raise HTTPException(status_code=404, detail="Roadmap not found")

        updated = False

        for item in roadmap_doc.get("roadmap", []):
            if item.get("heading") == heading:
                if type == "task":
                    if subheading:
                        for sh in item.get("sub_headings", []):
                            if sh.get("heading") == subheading:
                                sh["sub_heading_task_status"] = new_status.value
                                updated = True
                                break
                    else:
                        item["heading_task_status"] = new_status.value
                        updated = True

                elif type == "content":
                    if not subheading:
                        raise HTTPException(
                            status_code=400,
                            detail="Subheading is required when type is 'content'"
                        )
                    for sh in item.get("sub_headings", []):
                        if sh.get("heading") == subheading:
                            sh["sub_heading_status"] = new_status.value
                            updated = True
                            break

                else:
                    raise HTTPException(
                        status_code=400,
                        detail="Invalid type. Must be either 'task' or 'content'"
                    )
                break

        if not updated:
            raise HTTPException(status_code=404, detail="Matching item not found")

        result = await self.collection.update_one(
            {"_id": roadmap_object_id},
            {
                "$set": {
                    "roadmap": roadmap_doc["roadmap"],
                    "modified_at": datetime.utcnow()
                }
            }
        )

        if result.modified_count == 0:
            raise HTTPException(
                status_code=400,
                detail="Failed to update the roadmap"
            )

        updated_data = await self.collection.find_one({"_id": roadmap_object_id})
        return self.serialize_roadmap(updated_data)

    async def update_summaries(self, user_id: str, roadmap_id: str, heading: str, all_summaries: GroqSummaryResponseJSON):
        """
        Updates summaries for sub_headings under a specific roadmap heading.
        Only updates summaries that are empty or don't exist.
        """
        roadmap_object_id = ObjectId(roadmap_id)
        roadmap_doc = await self.collection.find_one({"_id": roadmap_object_id, "status": 1})
        if not roadmap_doc:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        authorized = self.authorize(roadmap_doc, user_id)
        if not authorized:
            raise HTTPException(status_code=403, detail="Unauthorized access")

        updated = False
        summary_map = {item["sub_heading"]: item["summary"] for item in all_summaries["summaries"]}
        
        for item in roadmap_doc.get("roadmap", []):
            if item.get("heading") == heading:
                for sub_heading in item.get("sub_headings", []):
                    # Check if summary is empty or doesn't exist before updating
                    existing_summary = sub_heading.get("summary", "")
                    if not existing_summary or existing_summary.strip() == "":
                        matching_summary = summary_map.get(sub_heading.get("heading"))
                        if matching_summary:
                            sub_heading["summary"] = matching_summary
                            updated = True
                break

        if updated:
            result = await self.collection.update_one(
                {"_id": roadmap_object_id},
                {
                    "$set": {
                        "roadmap": roadmap_doc["roadmap"],
                        "modified_at": datetime.utcnow()
                    }
                }
            )
            if result.modified_count == 0:
                raise HTTPException(
                    status_code=400,
                    detail="Failed to update summaries"
                )
            updated_data = await self.collection.find_one({"_id": roadmap_object_id})
            return self.serialize_roadmap(updated_data)
        return None

    async def get_full_subheadings(self, user_id, roadmap_id: str, heading: str) -> Tuple[dict, bool, List[dict], List[str]]:
        """
        Retrieves the full roadmap document and returns a flag indicating if links need to be fetched,
        all subheadings of the matched heading, and subheadings that need summaries.
        Returns (roadmap_doc, should_fetch_from_perplexity, sub_headings_array, empty_summaries).
        """
        roadmap_doc = await self.collection.find_one({"_id": ObjectId(roadmap_id)})
        if not roadmap_doc:
            raise HTTPException(status_code=404, detail="Roadmap not found")

        if str(roadmap_doc.get("user_id")) != str(user_id):
            raise HTTPException(status_code=403, detail="Unauthorized access")

        sub_headings_array = []
        empty_summaries = []
        should_fetch_links = True
        
        for item in roadmap_doc.get("roadmap", []):
            if item.get("heading") == heading:
                sub_headings = item.get("sub_headings", [])
                sub_headings_array = [sh.get("heading", "") for sh in sub_headings]
                
                # Check if ANY sub_heading has non-empty links
                for sh in sub_headings:
                    links = sh.get("links", {})
                    if any(links.get(key) for key in ["blogs", "documentations", "courses", "youtube_videos"]):
                        should_fetch_links = False
                        break
                
                # Check which summaries are empty or missing
                for sh in sub_headings:
                    existing_summary = sh.get("summary", "")
                    if not existing_summary:
                        empty_summaries.append(sh.get("heading", ""))
                
                return self.serialize_roadmap(roadmap_doc), should_fetch_links, sub_headings_array, empty_summaries

        return self.serialize_roadmap(roadmap_doc), False, [], []

    async def get_by_user_id(self, user_id: str):
        """
        Retrieves all roadmaps for a given user_id.
        """
        cursor = self.collection.find({"user_id": ObjectId(user_id), "status": 1})
        all_roadmaps = []
        async for roadmap in cursor:
            all_roadmaps.append(self.serialize_roadmap(roadmap))
        return all_roadmaps

    async def get_by_roadmap_id(self, roadmap_id: str, user_id: str) -> Optional[dict]:
        """
        Retrieves a roadmap document by its ObjectId.
        """
        roadmap = await self.collection.find_one({"_id": ObjectId(roadmap_id),"status": 1})
        if not roadmap:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        if str(roadmap.get("user_id")) != str(user_id):
            raise HTTPException(status_code=403, detail="Unauthorized access")
        serialized_roadmap = self.serialize_roadmap(roadmap)
        response_model = RoadmapDB(**serialized_roadmap)
        return response_model
    
    async def update_streak(self, roadmap_id: str):
        """
        Updates the streak for a given roadmap.
        """
        roadmap_doc = await self.collection.find_one({"_id": ObjectId(roadmap_id)})
        if not roadmap_doc:
            raise HTTPException(status_code=404, detail="Roadmap not found")

        last_logged = roadmap_doc.get("last_logged_at", datetime.utcnow())
        if (datetime.utcnow() - last_logged).days >= 1:
            new_streak = roadmap_doc.get("streak", 0) + 1
        else:
            new_streak = 0

        result = await self.collection.update_one(
            {"_id": ObjectId(roadmap_id)},
            {"$set": {
                "streak": new_streak,
                "last_logged_at": datetime.utcnow()
            }}
        )

        if result.modified_count == 0:
            raise HTTPException(
                status_code=400,
                detail="Failed to update the roadmap"
            )

        return {"result": "Success", "streak": new_streak}

    async def delete_roadmap(self, roadmap_id: str, user_id: str):
        """
        Deletes a roadmap document by its ObjectId.
        """
        roadmap_doc = await self.collection.find_one({"_id": ObjectId(roadmap_id)})
        if not roadmap_doc:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        if str(roadmap_doc.get("user_id")) != str(user_id):
            raise HTTPException(status_code=403, detail="Unauthorized access")
        # update the status as 0
        result = await self.collection.update_one(
            {"_id": ObjectId(roadmap_id)},
            {"$set": {"status": 0}}
        )
        if result.modified_count == 0:
            raise HTTPException(
                status_code=400,
                detail="Failed to delete the roadmap"
            )
        return {"result": "Success"}