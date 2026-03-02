from fastapi import HTTPException
from typing import List, Optional
from models.blog import BlogPost
from bson import ObjectId
from datetime import datetime


class BlogCRUD:
    def __init__(self, db):
        self.collection = db["blogs"]

    async def create_blog(self, blog: BlogPost):
        existing = await self.collection.find_one({"slug": blog.slug})
        if existing:
            raise HTTPException(status_code=400, detail="Blog with this slug already exists")
        
        blog_data = blog.dict()
        blog_data["createdAt"] = datetime.utcnow()
        if blog_data.get("image"):
            blog_data["image"] = str(blog_data["image"])

        result = await self.collection.insert_one(blog_data)
        blog_data["id"] = str(result.inserted_id)
        del blog_data["_id"]
        return blog_data

    async def get_all_blogs(self, recent_only: bool = False, tag: Optional[str] = None, featured: Optional[bool] = None):
        query = {}
        if tag:
            query["tags"] = tag
        if featured is not None:  
            query["featured"] = featured

        sort_order = [("publishedAt", -1)]
        limit = 3 if recent_only else 100

        blogs = await self.collection.find(query).sort(sort_order).to_list(length=limit)

        for blog in blogs:
            blog["id"] = str(blog["_id"])
            del blog["_id"]
        return blogs

    async def get_blog_by_slug(self, name: str):
        try:
            blog = await self.collection.find_one({"slug": name})
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid blog ID format")
        
        if not blog:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        blog["id"] = str(blog["_id"])
        del blog["_id"]
        return blog

    async def get_blog_by_id(self, id: str):
        try:
            blog = await self.collection.find_one({"_id": ObjectId(id)})
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid blog ID format")
        
        if not blog:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        blog["id"] = str(blog["_id"])
        del blog["_id"]
        return blog


    async def add_image_to_blog(self, blog_id: str, image_url: str):
        """
        Adds an image to an existing blog post by its ID and returns updated blog.
        """
        try:
            blog = await self.collection.find_one({"_id": ObjectId(blog_id)})
            if not blog:
                raise HTTPException(status_code=404, detail="Blog not found")

            # Update the image field
            await self.collection.update_one(
                {"_id": ObjectId(blog_id)},
                {"$set": {"image": image_url, "updatedAt": datetime.utcnow()}}
            )

            # Return the updated blog
            updated_blog = await self.collection.find_one({"_id": ObjectId(blog_id)})
            updated_blog["id"] = str(updated_blog["_id"])
            updated_blog.pop("_id", None)
            return updated_blog

        except Exception:
            raise HTTPException(status_code=400, detail="Invalid blog ID format")

    async def set_featured(self, blog_id: str, featured: bool):
        """
        Set the 'featured' field of a blog post to the given value.
        """
        try:
            # Check if the blog exists by its ID
            blog = await self.collection.find_one({"_id": ObjectId(blog_id)})
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid blog ID format")
        
        if not blog:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        # Update the blog's 'featured' field
        result = await self.collection.update_one(
            {"_id": ObjectId(blog_id)},
            {"$set": {"featured": featured, "updatedAt": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        # Fetch the updated blog to return
        updated_blog = await self.collection.find_one({"_id": ObjectId(blog_id)})
        updated_blog["id"] = str(updated_blog["_id"])
        del updated_blog["_id"]

        return updated_blog

    async def set_cover_image(self, blog_id: str, is_cover_image: bool):
        """
        Set the 'isCoverImage' field of a blog post to the given value.
        """
        result = await self.collection.update_one(
            {"_id": ObjectId(blog_id)},
            {"$set": {"isCoverImage": is_cover_image}}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Blog not found or already set")

        return True

    async def delete_blog(self, blog_id: str):
        result = await self.collection.delete_one({"_id": ObjectId(blog_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Blog not found")

        return True
