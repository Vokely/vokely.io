import uuid
from typing import Any, Dict
from datetime import datetime
from db.config import get_database  

async def store_or_update_profile(resume_data: Dict[str, Any], unique_id: str, email: str):
    """
    Stores or updates a user's resume in MongoDB with a unique ID.
    Includes created_at and modified_at timestamps.
    """  
    try:
        db = await get_database()  
        resume_collection = db["profile"]
        
        current_time = datetime.utcnow().isoformat() + 'Z'
        
        # Check if profile already exists to handle created_at properly
        existing_profile = await resume_collection.find_one({"user_id": unique_id})
        
        if existing_profile:
            # Update existing profile with modified_at
            result = await resume_collection.update_one(
                {"user_id": unique_id},
                {
                    "$set": {
                        "email": email,
                        "resume_data": resume_data,
                        "modified_at": current_time
                    }
                }
            )
        else:
            # Create new profile with both created_at and modified_at
            result = await resume_collection.update_one(
                {"user_id": unique_id},
                {
                    "$set": {
                        "email": email,
                        "user_id": unique_id,
                        "resume_data": resume_data,
                        "created_at": current_time,
                        "modified_at": current_time
                    }
                },
                upsert=True
            )
            
        print(f"[LOG]:Profile updated/inserted for user_id: {unique_id}. Upserted ID: {result.upserted_id}")
    except Exception as e:
        print(f"[ERROR]:An error occurred while storing/updating resume: {e}")
        raise e  # Re-raise exception to be handled by the route

async def get_profile_details(user_id: str):
    """
    Retrieves a user's resume from MongoDB by user ID.
    """    
    try:
        db = await get_database()
        resume_collection = db["profile"]
        resume = await resume_collection.find_one({"user_id": user_id}, {"_id": 0})
        
        return resume
    except Exception as e:
        print(f"[ERROR] An error occurred while retrieving resume: {e}")
        raise e  # Re-raise exception to be handled by the route

async def update_profile_image(user_id: str, image_filename: str, image_url_base: str):
    """
    Updates a user's profile with image information in the personalInfo section.
    
    Args:
        user_id (str): The unique identifier for the user
        image_filename (str): The name of the uploaded image file
        image_url_base (str): The base URL where the image is stored
    
    Returns:
        bool: True if the update was successful, False otherwise
    """
    try:
        db = await get_database()
        resume_collection = db["profile"]
        
        # First get the current profile data
        profile = await resume_collection.find_one({"user_id": user_id})
        if not profile:
            print(f"[ERROR]: Profile not found for user_id: {user_id}")
            return False
        
        # Update the modified_at timestamp
        current_time = datetime.utcnow().isoformat() + 'Z'
        
        # Update the personalInfo section with image information
        result = await resume_collection.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "resume_data.personalInfo.imgFileName": image_filename,
                    "resume_data.personalInfo.profileImage": image_url_base,
                    "modified_at": current_time
                }
            }
        )
        
        if result.modified_count > 0:
            print(f"[LOG]: Profile image updated for user_id: {user_id}")
            return True
        else:
            print(f"[LOG]: No changes made to profile for user_id: {user_id}")
            return False
            
    except Exception as e:
        print(f"[ERROR]: An error occurred while updating profile image: {e}")
        raise e