from fastapi import APIRouter, Depends, HTTPException, Body, Request, Query
from fastapi.responses import JSONResponse
from typing import List, Optional
from db.config import get_database
from passlib.context import CryptContext
from pydantic import BaseModel
from utils.logger import logger
import os
import json
import httpx
#models
from models.external_links import ShareableLink, ShareableLinkResponse
#crud
from crud.external_links import ShareableLinkCRUD
#constants
from utils.redis.redis_keys import RedisKeys

# Create a password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()


class PasswordVerification(BaseModel):
    password: str

async def get_shareable_link_crud():
    db = await get_database()  
    return ShareableLinkCRUD(db)


@router.get("/external-links/{link_id}")
async def get_shareable_link(link_id: str, link_crud: ShareableLinkCRUD = Depends(get_shareable_link_crud)):
    try:
        link_details = await link_crud.get_link(link_id)
        # Check if the link requires a password
        if link_details.get("requires_password", False):
            # If password protected, return limited information without the actual data
            return {
                "id": link_details["id"],
                "name": link_details["name"],
                "candidate_name": link_details["candidate_name"],
                "requires_password": True,
                "type": link_details["type"],
                "created_at": link_details["created_at"],
                "protected": True  # Flag to indicate this is a protected resource
            }
        
        # If no password required, return full data
        return ShareableLinkResponse.model_validate(link_details).model_dump()
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.post("/external-links/{link_id}/verify")
async def verify_link_password(
    link_id: str, 
    verification: PasswordVerification = Body(...),
    link_crud: ShareableLinkCRUD = Depends(get_shareable_link_crud)
):
    try:
        # Get the link with its hashed password
        link_details = await link_crud.get_link(link_id, include_password=True)
        
        # Check if the link requires password
        if not link_details.get("requires_password", False):
            raise HTTPException(status_code=400, detail="This link does not require password verification")
        
        # Verify the password
        stored_password = link_details.get("password")
        if not stored_password or not pwd_context.verify(verification.password, stored_password):
            raise HTTPException(status_code=401, detail="Invalid password")
        
        # Password is verified, return the complete link data
        # Remove the password from the response
        if "password" in link_details:
            del link_details["password"]
            
        return ShareableLinkResponse.model_validate(link_details).model_dump()
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")