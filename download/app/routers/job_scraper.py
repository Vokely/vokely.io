from fastapi import APIRouter, Query, HTTPException
from utils.scraper import job_scraper
from utils.indeed_scraper import indeed_job_scraper
from utils.naukri_instahyre_scraper import naukri_instahyre_job_scraper

router = APIRouter()

@router.get("/jobs")
async def get_jobs(skill: str | None = Query(description="Skill to search for", default="React"),
                   location: str | None = Query(description="Location to search in", default="Chennai"),
                   experience: int | None = Query(description="Work Experience", default=1)):
    """
    API endpoint to scrape job listings.
    - skill: The skill or keyword to search for.
    - location: The location to search in.
    - experience: Years of work experience.
    """
    try:
        job_listings = await job_scraper(skill=skill, location=location, experience=experience)
        return {"total_jobs": {
                "total":len(job_listings["indeed"]) + len(job_listings["instahyre"])+len(job_listings['naukari']),
                "indeed" : len(job_listings["indeed"]),
                "instahyre" : len(job_listings["instahyre"]),
                "naukari" : len(job_listings["naukari"]),
                }, 
                "naukari_jobs" : job_listings["naukari"],
                "indeed_jobs": job_listings["indeed"], 
                "instahyre_jobs": job_listings["instahyre"]
                }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scraping job listings: {str(e)}")

@router.get("/jobs/indeed")
async def get_jobs(skill: str | None = Query(description="Skill to search for", default="React"),
                   location: str | None = Query(description="Location to search in", default="Chennai"),
                   experience: int | None = Query(description="Work Experience", default=1)):
    """API endpoint to scrape jobs only from indeed using playwright"""
    try:
        indeed_job_listings = await indeed_job_scraper(skill=skill, location=location, experience=experience)
        return {"total_jobs": {
                "indeed" : len(indeed_job_listings["indeed"])
                },
                "indeed_jobs": indeed_job_listings["indeed"]
                }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scraping indeed job listings: {str(e)}")
    
    
@router.get("/jobs/naukri_instahyre")
async def get_jobs(skill: str | None = Query(description="Skill to search for", default="React"),
                   location: str | None = Query(description="Location to search in", default="Chennai"),
                   experience: int | None = Query(description="Work Experience", default=1)):
    """
    API endpoint to scrape job listings for naukri_instahire.
    - skill: The skill or keyword to search for.
    - location: The location to search in.
    - experience: Years of work experience.
    """
    try:
        job_listings = await naukri_instahyre_job_scraper(skill=skill, location=location, experience=experience)
        return {"total_jobs": {
                "total":len(job_listings["instahyre"])+len(job_listings['naukari']),
                "instahyre" : len(job_listings["instahyre"]),
                "naukari" : len(job_listings["naukari"]),
                }, 
                "naukari_jobs" : job_listings["naukari"],
                "instahyre_jobs": job_listings["instahyre"]
                }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scraping job listings: {str(e)}")