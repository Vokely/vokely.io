from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from typing import List
from pydantic import BaseModel

from models.external_links import ShareableLink, ShareableLinkResponse

from crud.external_links import ShareableLinkCRUD
from crud.user import get_user_details_from_header

from db.config import get_database
from passlib.context import CryptContext
from pydantic import BaseModel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

async def get_shareable_link_crud():
    db = await get_database()  
    return ShareableLinkCRUD(db)

class AllLinksByRelation(BaseModel):
    links: List[ShareableLinkResponse]

@router.post("/add", response_model=ShareableLinkResponse)
async def create_shareable_link(
    link: ShareableLink, 
    link_crud: ShareableLinkCRUD = Depends(get_shareable_link_crud),
    user_details: str = Depends(get_user_details_from_header) 
):
    try:           
        link_data = await link_crud.create_link(link, user_details.id)
        
        if "password" in link_data:
            del link_data["password"]
            
        return ShareableLinkResponse.model_validate(link_data).model_dump()
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create link: {str(e)}")

@router.get("/", response_model=List[ShareableLinkResponse])
async def get_shareable_links(link_crud: ShareableLinkCRUD = Depends(get_shareable_link_crud)):
    try:
        return await link_crud.get_links()
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.put("/{link_id}", response_model=dict)
async def update_shareable_link(link_id: str, update_data: dict, link_crud: ShareableLinkCRUD = Depends(get_shareable_link_crud)):
    try:
        return await link_crud.update_link(link_id, update_data)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.delete("/{link_id}", response_model=dict)
async def delete_shareable_link(link_id: str, link_crud: ShareableLinkCRUD = Depends(get_shareable_link_crud)):
    try:
        return await link_crud.delete_link(link_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.get("/relation/{relation_id}", response_model=AllLinksByRelation)
async def get_links_by_relation_id(relation_id: str, link_crud: ShareableLinkCRUD = Depends(get_shareable_link_crud)):
    try:
        links =  await link_crud.get_links_by_relation_id(relation_id)
        return {
            "links": [ShareableLinkResponse.model_validate(link).model_dump() for link in links]
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
