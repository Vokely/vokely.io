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
from models.pricing_plans import PlanCreate, PlanInDB, PlanUpdate, PlanPublic
from models.external_links import ShareableLink, ShareableLinkResponse
#crud
from crud.external_links import ShareableLinkCRUD
from crud.pricing_plans import PricingPlanCRUD
#constants
from constants.credit_constants import COUNTRY_PRICING_TIERS,EXCHANGE_CODES_CACHE_KEY
from utils.auth.get_ip import get_real_ip, get_geo_location
from utils.redis.redis_keys import RedisKeys

# Create a password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
EXCHANGE_RATE_API_KEY = os.getenv("EXCHANGE_RATE_API_KEY")

router = APIRouter()

dummy_data = {
  "country_code": "IN",
  "currency_code": "INR",
  "currency_symbol": "₹",
  "country_name":"India"
}


class PasswordVerification(BaseModel):
    password: str

async def get_shareable_link_crud():
    db = await get_database()  
    return ShareableLinkCRUD(db)

async def get_plan_crud():
    db = await get_database()
    return PricingPlanCRUD(db)

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

@router.get("/geo")
async def get_user_location(request: Request):
    try:
        ip = get_real_ip(request)
        if os.getenv("DEV_MODE")=="local":
            return dummy_data
        
        if ip is None:
            logger.error("No headers found to determine IP")
            return JSONResponse(
                status_code=400,
                content={"detail": f"No headers found to determine IP"}
            )
        if ip.startswith("127.") or ip.startswith("192.168.") or ip.startswith("10."):
            logger.debug("Invalid IP. Cannot determine location")
            return JSONResponse(
               content={
                    "country_code": "IN",
                    "currency_code": "INR",
                    "currency_symbol": "₹",
                    "country_name": "India"
                }
            )

        redis = request.app.redis  
        redis_key = RedisKeys.geo_ip_details(ip)

        # Try to fetch from cache
        cached_data = await redis.get_value(redis_key)
        if cached_data:
            geo_details = json.loads(cached_data)
            return geo_details

        response = await get_geo_location(ip)
        # Cache in Redis for 1 day
        await redis.set_value(redis_key, json.dumps(response), expire_seconds=86400)

        return response
    except Exception as e:
        logger.error(f"[GEO-ERROR] {e}")
        return JSONResponse(
            status_code=500,
            content={"detail": "An error occurred while determining location."}
        )


async def get_exchange_rate():
    async with httpx.AsyncClient() as client:
        try:
            EXCHANGE_API_URL = f"https://v6.exchangerate-api.com/v6/{EXCHANGE_RATE_API_KEY}/latest/USD"
            response = await client.get(EXCHANGE_API_URL)
            response.raise_for_status()
            data = response.json()
            rates = data["conversion_rates"]
            if not rates:
                raise ValueError(f"No rates found")
            return rates
        except Exception as e:
            logger.error(f"Exchange rate fetch failed: {str(e)}")
            raise HTTPException(status_code=502, detail="Currency conversion service unavailable")

def get_country_discount(country:str,all_plans: List[PlanInDB],converted_rate:str) -> int:
    if country=="IN":
        for plan in all_plans:
            logger.info(plan.get("inr_price"))
            plan["price"] = plan.get("inr_price")
    else:
        for plan in all_plans:
            base_price = plan.get("price")
            if base_price:
                plan["price"] = round(base_price * converted_rate)

    return all_plans

def get_country_tier(country_code:str):
    for tier_name, tier in COUNTRY_PRICING_TIERS.items():
        if country_code.upper() in tier["countries"]:
            return tier["tier"]

@router.get("/regional-pricing", response_model = List[PlanPublic])
async def get_regional_plans(
    request: Request,
    country: str = Query(..., min_length=2, max_length=10),
    currency: str = Query(..., min_length=2, max_length=10),
    plan_crud: PricingPlanCRUD = Depends(get_plan_crud)
):
    """Create a new plan and corresponding Dodo product"""
    try:
        logger.debug(f"Fetching plans for country: {country}, currency: {currency}")
        plan_tier = get_country_tier(country)
        if country.upper() == "IN":
            query = {
                "$or": [
                    {"plan_type": "free"},
                    {"country_code": "IN"}
                ]
            }
        else:
            query = {
                "$or": [
                    {"plan_type": "free"},
                    {"current_tier": str(plan_tier)}
                ]
            }

        all_plans = await plan_crud.get_all_plans(query)
        cached_data = await request.app.redis.get_value(EXCHANGE_CODES_CACHE_KEY)
        if cached_data:
            exchange_rates = json.loads(cached_data)
        else:
            exchange_rates = await get_exchange_rate()
            await request.app.redis.set_value(
                key=EXCHANGE_CODES_CACHE_KEY,
                value=json.dumps(exchange_rates),
                expire_seconds=3600 
            )
        converted_rate = exchange_rates.get(currency)
        logger.debug(f"converted_rate:{converted_rate}")

        return get_country_discount(country, all_plans, converted_rate)        
    except HTTPException as http_exc:
        logger.error(http_exc)
        raise http_exc
    except Exception as e:
        logger.error("Exception occurred", exc_info=True)  
        raise HTTPException(status_code=400, detail=f"Error getting price details: {str(e)}")