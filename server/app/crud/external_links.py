from fastapi import HTTPException
from typing import List, Optional
from models.external_links import ShareableLink, ShareableLinkResponse
from bson import ObjectId
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Dict, Any
from passlib.context import CryptContext

# Create a password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class ShareableLinkCRUD:
    def __init__(self, db):
        self.db = db
        self.collection = self.db["external_links"]

    async def create_link(self, link: ShareableLink, user_id: str):      
        # Handle expiration
        if link.expires != "never" and isinstance(link.expires, datetime):
            # Convert both to timezone-aware datetimes using UTC
            now_utc = datetime.now(timezone.utc)
            
            # Make sure link.expires has timezone info if it doesn't already
            if link.expires.tzinfo is None:
                # Convert naive datetime to aware datetime with UTC timezone
                expires_utc = link.expires.replace(tzinfo=timezone.utc)
            else:
                expires_utc = link.expires
                
            if expires_utc < now_utc:
                raise HTTPException(status_code=400, detail="Expiration date cannot be in the past.")
            
            # Store the timezone-aware datetime
            link.expires = expires_utc
        
        link.created_by = user_id
        # Set created_at with timezone awareness
        link.created_at = datetime.now(timezone.utc)
        
        # Hash the password if present
        if link.requires_password and link.password:
            link.password = pwd_context.hash(link.password)
        
        link_data = link.dict()
        result = await self.collection.insert_one(link_data)
        link_data["id"] = str(result.inserted_id)
        return link_data

    async def get_link(self, link_id: str, include_password: bool = False):
        link = await self.collection.find_one({"_id": ObjectId(link_id)})
        if not link:
            raise HTTPException(status_code=404, detail="Link not found")
        
        link["id"] = str(link["_id"])
        del link["_id"]
        
        expires = link.get("expires")

        # Check if the link is expired and it's not set to "never"
        if expires and expires != "never":
            if isinstance(expires, datetime) and expires < datetime.utcnow():
                raise HTTPException(status_code=410, detail="Link has expired")
        
        # Remove password from response if not specifically requested
        if not include_password and "password" in link:
            del link["password"]
            
        return link

    async def verify_password(self, link_id: str, password: str) -> bool:
        """
        Verify if the provided password matches the stored hashed password for the link
        """
        link = await self.collection.find_one({"_id": ObjectId(link_id)})
        if not link:
            return False
            
        if not link.get("requires_password", False):
            return True  # No password required
            
        stored_password = link.get("password")
        if not stored_password:
            return False
            
        return pwd_context.verify(password, stored_password)

    async def get_links_by_relation_id(self, relation_id: str):
        try:
            # Fetch all links for a given relation_id
            links = await self.collection.find({"relation_id": relation_id}).to_list(length=100)

            # Filter out expired links (if not 'never')
            valid_links = []
            for link in links:
                expires = link.get("expires")
                if expires != "never":
                    if isinstance(expires, str):
                        expires = datetime.fromisoformat(expires)
                    if expires < datetime.utcnow():
                        continue  # Skip expired links
                link["id"] = str(link["_id"])
                del link["_id"]
                # Remove password from response
                if "password" in link:
                    del link["password"]
                valid_links.append(link)

            if not valid_links:
                return []
            
            return valid_links

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch links: {str(e)}")

    async def get_links(self):
        links = await self.collection.find().to_list(length=100)
        # Remove passwords from response
        for link in links:
            if "password" in link:
                del link["password"]
        return links

    async def update_link(self, link_id: str, update_data: dict):
        # If password is being updated, hash it
        if "password" in update_data and update_data.get("requires_password", False):
            update_data["password"] = pwd_context.hash(update_data["password"])
            
        result = await self.collection.update_one(
            {"_id": ObjectId(link_id)},
            {"$set": update_data}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Failed to update link")
        return {"message": "Link updated successfully"}

    async def delete_link(self, link_id: str):
        result = await self.collection.delete_one({"_id": ObjectId(link_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Link not found")
        return {"message": "Link deleted successfully"}