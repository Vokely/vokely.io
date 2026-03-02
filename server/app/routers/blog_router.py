from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from crud.blog import BlogCRUD
from db.config import get_database

router = APIRouter()


# Dependency to get the CRUD instance
async def get_blog_crud():
    db = await get_database()
    return BlogCRUD(db)


@router.get("/")
async def get_blogs(
    recent: Optional[bool] = Query(default=False),
    tag: Optional[str] = Query(default=None),
    featured: Optional[bool] = Query(default=None),  
    blog_crud: BlogCRUD = Depends(get_blog_crud)
):
    try:
        all_blogs = await blog_crud.get_all_blogs(recent_only=recent, tag=tag, featured=featured)
        return {"blogs": all_blogs}
    except HTTPException as http_exc:
        raise http_exc


@router.get("/id/{slug}")
async def get_blog_by_id(slug: str, blog_crud: BlogCRUD = Depends(get_blog_crud)):
    try:
        return await blog_crud.get_blog_by_slug(slug)
    except HTTPException as http_exc:
        raise http_exc
