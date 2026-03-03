from fastapi import HTTPException, APIRouter, Request, Depends
from fastapi.responses import Response,JSONResponse
from pydantic import BaseModel
from typing import Optional
from enum import Enum
import json

#utils
from db.config import get_database
from utils.gpt import generate_roadmap_topics,generate_gpt_summaries
from utils.groq import get_summaries_of_sub_headings
from utils.perplexity import get_perplexity_links
from utils.redis.redis_keys import RedisKeys
from utils.json.json_encoder import EnhancedJSONEncoder

#models
from models.roadmap import  LearningStatus

#crud 
from crud.roadmap import RoadmapCRUD
from crud.user import get_user_details_from_header

router = APIRouter()

response_data_2 = {
    "generated_content": [
        {
            "heading": "HTML: Structure of Web Pages",
            "links": {
                "blogs": [
                    "https://www.altimetrik.com/blog/essential-javascript-for-react"
                ],
                "documentations": [
                    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes",
                    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions"
                ],
                "courses": [],
                "youtube_videos": [
                    "https://www.youtube.com/watch?v=m55PTVUrlnA"
                ]
            }
        },
        {
            "heading": "Responsive Design Principles",
            "links": {
                "blogs": [
                    "https://www.altimetrik.com/blog/essential-javascript-for-react"
                ],
                "documentations": [
                    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment",
                    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax"
                ],
                "courses": [],
                "youtube_videos": []
            }
        },
        {
            "heading": "CSS Selectors, Box Model, and Layouts (Flexbox/Grid)",
            "links": {
                "blogs": [
                    "https://www.altimetrik.com/blog/essential-javascript-for-react"
                ],
                "documentations": [
                    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules"
                ],
                "courses": [],
                "youtube_videos": []
            }
        },
        {
            "heading": "Basic DOM Manipulation",
            "links": {
                "blogs": [
                    "https://www.altimetrik.com/blog/essential-javascript-for-react"
                ],
                "documentations": [
                    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
                    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function"
                ],
                "courses": [],
                "youtube_videos": []
            }
        },
        {
            "heading": "State Management with useState Hook",
            "links": {
                "blogs": [
                    "https://www.freecodecamp.org/news/javascript-skills-you-need-for-react-practical-examples/",
                    "https://www.altimetrik.com/blog/essential-javascript-for-react"
                ],
                "documentations": [
                    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map"
                ],
                "courses": [],
                "youtube_videos": [
                    "https://www.youtube.com/watch?v=m55PTVUrlnA"
                ]
            }
        }
    ]
}


class UpdateType(str, Enum):
    task = "task"
    content = "content"

class UpdateStatusRequest(BaseModel):
    heading: str
    subheading: Optional[str] = None
    new_status: LearningStatus
    type: UpdateType  

class RoadMapRequest(BaseModel):
    skill: str
class LinksRequest(BaseModel):
    id: str
    heading : str

async def get_roadmap_crud():
    db = await get_database()  
    return RoadmapCRUD(db)

async def invalidate_roadmaps_cache(redis_client, user_id: str):
    """
    Helper function to invalidate roadmaps cache for a user.
    Call this whenever roadmaps are created, updated, or deleted.
    """
    cache_key = RedisKeys.user_roadmaps(user_id)
    await redis_client.delete_key(cache_key)
    print(f"Invalidated roadmaps cache for user: {user_id}")

@router.get("/all/roadmaps")
async def get_all_roadmaps_of_user(request:Request,roadmap_crud: RoadmapCRUD = Depends(get_roadmap_crud)):
    try:
        user_details = await get_user_details_from_header(request)
        cache_key = RedisKeys.user_roadmaps(user_details.id)        
        cached_data = await request.app.redis.get_value(cache_key)
        
        if cached_data:
            print("Fetched roadmaps from cache")
            cached_roadmaps = json.loads(cached_data)
            response = JSONResponse(content=cached_roadmaps)
            return response

        response = await roadmap_crud.get_by_user_id(user_details.id)
        roadmap_response = {"all_roadmaps":response}
        
        json_response = json.dumps(roadmap_response, cls=EnhancedJSONEncoder)
        await request.app.redis.set_value(
            key=cache_key,
            value=json_response,
            expire_seconds=1800  
        )

        return roadmap_response

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error fetching roadmaps: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching roadmaps"+str(e))

@router.get("/{roadmap_id}")
async def get_roadmap_by_id(request:Request,roadmap_id: str,roadmap_crud: RoadmapCRUD = Depends(get_roadmap_crud)):
    try:
        user_details = await get_user_details_from_header(request)
        return await roadmap_crud.get_by_roadmap_id(roadmap_id,user_details.id)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error generating links: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching roadmap")

@router.post("/generate")
async def get_roadmap(request:Request,details: RoadMapRequest,roadmap_crud: RoadmapCRUD = Depends(get_roadmap_crud)):
    try:
        user_details = await get_user_details_from_header(request)

        roadmap_response = await generate_roadmap_topics(request,details.skill)
        created_roadmap =  await roadmap_crud.create(user_details.id, details.skill, roadmap_response["roadmap"])

        await invalidate_roadmaps_cache(request.app.redis, user_details.id)
        return created_roadmap
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error generating links: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating roadmap"+str(e))

@router.post("/generate-links")
async def generate_roadmap_links(request_data: LinksRequest, request: Request, roadmap_crud: RoadmapCRUD = Depends(get_roadmap_crud)):
    """
    Generates a roadmap of relevant online links for a given heading and its sub-headings.
    """
    try:
        user_details = await get_user_details_from_header(request)

        roadmap_doc, should_fetch_links, sub_headings_array, empty_summaries = await roadmap_crud.get_full_subheadings(
            user_details.id, request_data.id, request_data.heading
        )
        
        # Generate summaries if needed
        if empty_summaries:
            print(f"Generating summaries for sub-headings: {empty_summaries}")
            summary_request_data = {
                "heading": request_data.heading,
                "sub_headings": empty_summaries  # Only send the ones that need summaries
            }
            generated_summaries = await get_summaries_of_sub_headings(request,summary_request_data)
            
            # Update summaries separately
            await roadmap_crud.update_summaries(user_details.id, request_data.id, request_data.heading, generated_summaries)

        # Generate links if needed
        if should_fetch_links:
            print("Generating links")
            headings_data = {
                "heading": request_data.heading,
                "sub_headings": sub_headings_array  # Use the full sub_headings array
            }

            response_data = await get_perplexity_links(headings_data)
            updated_data = await roadmap_crud.update_links(
                user_details.id, request_data.id, request_data.heading, response_data["generated_content"]
            )
            return updated_data
        else:
            # If links were not fetched, we might still need to return updated data if summaries were updated
            if empty_summaries:
                # Fetch the updated roadmap document
                updated_roadmap_doc, _, _, _ = await roadmap_crud.get_full_subheadings(
                    user_details.id, request_data.id, request_data.heading
                )
                return updated_roadmap_doc
            else:
                # Return the original document if no updates were made
                return roadmap_doc

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error generating links: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating links")

@router.put("/{roadmap_id}/status")
async def update_subheading_status(
    roadmap_id: str,
    body: UpdateStatusRequest,
    roadmap_crud: RoadmapCRUD = Depends(get_roadmap_crud),
):
    try:
        result = await roadmap_crud.update_subheading_task_status(
            roadmap_id=roadmap_id,
            heading=body.heading,
            subheading=body.subheading,
            new_status=body.new_status,
            type=body.type
        )
        return result
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error generating links: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating status")
    
@router.put("/{roadmap_id}/update-streak")
async def update_streak(
    roadmap_id: str,
    roadmap_crud: RoadmapCRUD = Depends(get_roadmap_crud),
):
    try:
        result = await roadmap_crud.update_streak(roadmap_id)
        return result
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error generating links: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating streak"+str(e))
    
@router.delete("/{roadmap_id}")
async def delete_roadmap(request:Request,roadmap_id: str,roadmap_crud: RoadmapCRUD = Depends(get_roadmap_crud)):
    try:
        await invalidate_roadmaps_cache(request.app.redis, request.state.user_id)
        user_details = await get_user_details_from_header(request)
        await roadmap_crud.delete_roadmap(roadmap_id,user_details.id)
        return Response(status_code=204)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error generating links: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting roadmap"+str(e))
