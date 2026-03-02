from typing import Dict, Any, List
from db.config import get_database  
from models.resume import UpdateResume  
from models.resume import ModuleName
from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status
from utils.json.serialize_json import serialize_mongo_document

async def update_resume_details(resume: UpdateResume, resume_id: str, user_id: str):
    """
    Updates specific fields of a resume in the database and returns the updated resume.
    """
    db = await get_database()
    resume_collection = db["resumes"]

    # Validate and convert resume_id
    if not ObjectId.is_valid(resume_id):
        raise HTTPException(status_code=400, detail="Invalid resume ID format")

    # Find the resume and verify ownership
    existing_resume = await resume_collection.find_one({"_id": ObjectId(resume_id), "user_id": user_id})
    if not existing_resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or unauthorized access."
        )
    # Prepare the update fields (only update provided fields)
    update_data = {"modified_at": datetime.utcnow().isoformat() + 'Z'}
    resume_dict = resume.dict()
    if resume_dict.get("data"):
        update_data["resume_data"] = resume_dict["data"]
    if resume_dict.get("name"):
        update_data["name"] = resume_dict["name"]
    if resume_dict.get("job_description") is not None:
        update_data["job_description"] = resume_dict["job_description"]

    # Perform the update
    result = await resume_collection.update_one(
        {"_id": ObjectId(resume_id)},
        {"$set": update_data}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_304_NOT_MODIFIED,
            detail="No changes were made to the resume."
        )

    # Fetch and return the updated resume
    updated_resume = await resume_collection.find_one({"_id": ObjectId(resume_id)})
    updated_resume["_id"] = str(updated_resume["_id"])  # Convert ObjectId to string

    return updated_resume

async def update_generated_data(resume_id: str, user_id: str, generated_data: Dict[str, Any]):
    """
    Updates the generated_data field of a resume in the database.
    """
    db = await get_database()
    resume_collection = db["resumes"]

    # Validate and convert resume_id
    if not ObjectId.is_valid(resume_id):
        raise HTTPException(status_code=400, detail="Invalid resume ID format")

    # Find the resume and verify ownership
    existing_resume = await resume_collection.find_one({"_id": ObjectId(resume_id), "user_id": user_id})
    if not existing_resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or unauthorized access."
        )

    # Prepare the update data
    update_data = {
        "modified_at": datetime.utcnow().isoformat() + 'Z',
        "old_resume" : existing_resume["resume_data"],
        "generated_data": generated_data,
    }
    # Conditionally add old_score and new_score if they exist in generated_data
    if "old_score" in generated_data and "new_score" in generated_data:
        update_data["old_score"] = generated_data["old_score"]
        update_data["new_score"] = generated_data["new_score"] 

    # Perform the update
    result = await resume_collection.update_one(
        {"_id": ObjectId(resume_id)},
        {"$set": update_data}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_304_NOT_MODIFIED,
            detail="No changes were made to the resume."
        )

    # Fetch and return the updated resume
    updated_resume = await resume_collection.find_one({"_id": ObjectId(resume_id)})
    updated_resume["_id"] = str(updated_resume["_id"])  # Convert ObjectId to string
    return updated_resume

async def get_resume_details(user_id: str, resume_id: str) -> Dict[str, Any]:
    """
    Retrieves a resume from MongoDB by its unique resume ID.
    Ensures the resume belongs to the given user_id.
    """
    try:
        db = await get_database()
        resume_collection = db["resumes"]

        # Ensure the provided resume_id is a valid ObjectId
        if not ObjectId.is_valid(resume_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid input"
            )

        resume = await resume_collection.find_one({"_id": ObjectId(resume_id)})

        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found."
            )

        # Check if the resume belongs to the given user_id
        if resume["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized access: You do not have permission to view this resume."
            )

        # Convert ObjectId to string for JSON serialization
        resume["_id"] = str(resume["_id"])

        return resume

    except HTTPException as e:
        raise e  # Re-raise known errors
    except Exception as e:
        print(f"[ERROR]: Failed to fetch resume: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database query failed while fetching the resume."
        )

async def delete_resume(resume_id: str) -> int:
    """
    Deletes a resume from MongoDB by resume ID.
    Returns the number of deleted documents.
    """
    try:
        db = await get_database()
        resume_collection = db["resumes"]

        # Validate if resume_id is a valid ObjectId
        if not ObjectId.is_valid(resume_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid resume ID format: {resume_id}"
            )

        result = await resume_collection.delete_one({"_id": ObjectId(resume_id)})

        return result.deleted_count

    except HTTPException as e:
        raise e  # Re-raise custom exceptions
    except Exception as e:
        print(f"[ERROR]: Failed to delete resume: {e}")
        raise HTTPException(status_code=500, detail="Database deletion failed")

async def create_resume(user_id: str, resume_details: Dict[str, Any],module_name: ModuleName, is_interview_specific: bool = False) -> Dict[str, Any]:
    """
    Creates a new resume in the database with proper error handling.
    Returns the newly created resume document.
    """
    try:
        db = await get_database()
        resume_collection = db["resumes"]

        # Validate required fields
        if not resume_details.get("name") or not resume_details.get("data"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing required fields: 'name' or 'data'."
            )

        new_resume = {
            "_id": ObjectId(),  # Generate a unique ID
            "user_id": user_id,
            "name": resume_details["name"],
            "resume_data": resume_details["data"],
            "created_at": datetime.utcnow(),
            "modified_at": datetime.utcnow(),
            "generated_data": None,
            "is_interview_specific" : is_interview_specific,
            "module_name" : module_name
        }
        if "job_description" in resume_details and resume_details["job_description"]:
            new_resume["job_description"] = resume_details["job_description"]

        # Insert into the database
        result = await resume_collection.insert_one(new_resume)
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create resume in the database."
            )

        # Fetch and return the newly inserted document
        created_resume = await resume_collection.find_one({"_id": result.inserted_id})
        serialized_json = serialize_mongo_document(created_resume)
        return serialized_json

    except HTTPException as e:
        raise e  # Re-raise known errors
    except Exception as e:
        print(f"[ERROR]: Failed to create resume: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database operation failed while creating the resume."
        )    

async def find_all_resumes_of_user(user_id: str) -> List[Dict[str, Any]]:
    """
    Retrieves all resumes belonging to the given user from the database.
    Returns a list of resume objects or an empty list if none are found.
    """
    db = await get_database()
    resume_collection = db["resumes"]

    # Query all resumes for the given user_id
    resumes_cursor = resume_collection.find({"user_id": user_id, "is_interview_specific": False})
    
    # Convert the cursor to a list of dictionaries
    resumes = []
    async for resume in resumes_cursor:
        for key, value in resume.items():
            if isinstance(value, datetime):
                resume[key] = value.isoformat()
        resume["_id"] = str(resume["_id"])  # Convert ObjectId to string
        resumes.append(resume)

    return resumes  # Returns an empty list if no resumes exist

async def update_resume_image(resume_id: str, image_filename: str, image_url_base: str):
    """
    Updates a user's profile with image information in the personalInfo section.
    
    Args:
        resume_id (str): The unique identifier for the resume
        image_filename (str): The name of the uploaded image file
        image_url_base (str): The base URL where the image is stored
    
    Returns:
        bool: True if the update was successful, False otherwise
    """
    try:
        db = await get_database()
        resume_collection = db["resumes"]
        
        # First get the current profile data
        resume = await resume_collection.find_one({"_id": ObjectId(resume_id)})
        if not resume:
            print(f"[ERROR]: Profile not found for resume_id: {resume_id}")
            return False

        # Update the modified_at timestamp
        current_time = datetime.utcnow().isoformat() + 'Z'
        
        # Update the personalInfo section with image information
        result = await resume_collection.update_one(
            {"_id": ObjectId(resume_id)},
            {
                "$set": {
                    "resume_data.personalInfo.imgFileName": image_filename,
                    "resume_data.personalInfo.profileImage": image_url_base,
                    "modified_at": current_time
                }
            }
        )
        
        if result.modified_count > 0:
            print(f"[LOG]: resume image updated for user_id: {resume_id}")
            return True
        else:
            print(f"[LOG]: No changes made to resume for resume_id: {resume_id}")
            return False
            
    except Exception as e:
        print(f"[ERROR]: An error occurred while updating resume image: {e}")
        raise e
    