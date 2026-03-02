# routers/pricing_plans.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Request
from fastapi.responses import JSONResponse
from typing import List, Dict, Any

from models.pricing_plans import PlanCreate, PlanInDB, PlanUpdate, PlanType, Feature
from crud.pricing_plans import PricingPlanCRUD
from constants.credit_constants import COUNTRY_PRICING_TIERS

from services.dodo_service import DodoPaymentsSingleton
from db.config import get_database

#utils
from utils.logger import logger
from utils.auth.exceptions import CustomHTTPException
from utils.redis.redis_keys import RedisKeys

router = APIRouter()

async def get_plan_crud():
    db = await get_database()
    return PricingPlanCRUD(db)


async def invalidate_pricing_plans_cache(redis_client):
    """
    Helper function to invalidate pricing_plans cache for a user.
    Call this whenever pricing_plans are created, updated, or deleted.
    """
    cache_key = RedisKeys.get_pricing_plans()
    await redis_client.delete_key(cache_key)
    logger.info(f"Invalidated pricing_plans cache")
    
@router.post("/", response_model=list[PlanInDB])
async def create_new_plan(plan: PlanCreate, plan_crud: PricingPlanCRUD = Depends(get_plan_crud)):
    """
    Create a new plan for all tiers based on the given plan's details.
    If the plan type is FREE → only create the given tier once (no duplicates).
    Otherwise, create Tier 1, Tier 2, and Tier 3 versions.
    """
    dodo = DodoPaymentsSingleton.get_instance()

    try:
        created_plans = []

        # Helper to create & store plan
        async def process_plan(tier_key: str, discount: int, tier_number: int):
            tier_plan = plan.model_copy(deep=True)  # deep copy original
            tier_plan.current_tier = str(tier_number)

            if discount > 0:
                tier_plan.price = int(round(plan.price * (1 - discount / 100)))

            # Create Dodo product only if not FREE
            if plan.plan_type != PlanType.FREE:
                dodo_product_id, upload_image_url = await dodo.create_product(
                    name=tier_plan.name,
                    amount=tier_plan.price,
                    currency=tier_plan.currency,
                    desc=tier_plan.description
                )
                tier_plan.dodo_product_id = dodo_product_id
                tier_plan.image_url = upload_image_url

            created = await plan_crud.create_plan(tier_plan)
            created_plans.append(created)

        # FREE tier → only create the plan as-is, no duplicates
        if plan.plan_type == PlanType.FREE:
            created = await plan_crud.create_plan(plan)
            created_plans.append(created)
        else:
            # Create plans for all tiers
            for tier_key, tier_data in COUNTRY_PRICING_TIERS.items():
                await process_plan(tier_key, tier_data["discount"], tier_data["tier"])
            if plan.inr_price > 0:
                plan.price = plan.inr_price
                plan.currency = "INR"
                plan.country_code = "IN"
                await process_plan("INR", 0, 1)

        return created_plans

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Plan creation failed: {str(e)}")

@router.get("/{plan_id}", response_model=PlanInDB)
async def fetch_plan(plan_id: str, plan_crud: PricingPlanCRUD = Depends(get_plan_crud)):
    """Fetch a specific plan by ID"""
    try:
        plan = await plan_crud.get_plan(plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        return plan
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get products: {str(e)}")

@router.get("/", response_model=List[PlanInDB])
async def get_all_plans(plan_crud: PricingPlanCRUD = Depends(get_plan_crud)):
    """Fetch all plans"""
    try:
        plans = await plan_crud.get_all_plans()
        if not plans:
            return JSONResponse(status_code=status.HTTP_200_OK,content={"detail": "No plans found"})
        return plans
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get products: {str(e)}")

@router.put("/{plan_id}")
async def update_existing_plan(request:Request, plan_id: str,updated_plan: PlanUpdate,plan_crud: PricingPlanCRUD = Depends(get_plan_crud)):
    """Update a plan and conditionally sync with Dodo product"""
    existing_plan = await plan_crud.get_plan(plan_id)
    is_free_plan = existing_plan.plan_type == PlanType.FREE
    if not existing_plan or (not is_free_plan and not existing_plan.dodo_product_id):
        raise HTTPException(status_code=404, detail="Dodo product ID not found for this plan")

    updated_fields = updated_plan.dict(exclude_unset=True)

    dodo_update_fields = {}

    for field in ["name", "price", "currency"]:
        if field in updated_fields and updated_fields[field] != getattr(existing_plan, field):
            dodo_update_fields[field] = updated_fields[field]

    if "price" in dodo_update_fields and "currency" not in dodo_update_fields:
        dodo_update_fields["currency"] = existing_plan.currency

    try:
        if dodo_update_fields and not is_free_plan:
            dodo = DodoPaymentsSingleton.get_instance()
            await dodo.update_product(existing_plan.dodo_product_id, dodo_update_fields)

        updated = await plan_crud.update_plan(plan_id, updated_plan)
        await invalidate_pricing_plans_cache(request.app.redis)
        return updated

    except HTTPException as http_exc:
        logger.error(http_exc)
        raise http_exc
    except Exception as e:
        logger.error(f"{str(e)}")
        raise CustomHTTPException(
            status_code=400,
            message="Failed to update plan",
            error="plan_update_failed",
        )

@router.post("/add-feature")
async def add_feature_to_all_pricing_plans(feature: Feature,plan_crud: PricingPlanCRUD = Depends(get_plan_crud)) -> Dict[str, Any]:   
    try:
        feature_exists = await plan_crud.check_feature_exists_in_plans(feature.name)
        
        if feature_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Feature '{feature.name}' already exists in one or more pricing plans"
            )
        
        result = await plan_crud.add_feature_to_all_plans(feature)
        
        if result["modified_count"] == 0:
            return {
                "success": False,
                "message": "No active pricing plans found to update",
                "details": result
            }
        
        updated_plans = await plan_crud.get_all_plans({"is_active":True})
        
        return {
            "success": True,
            "message": f"Successfully added feature '{feature.name}' to {result['modified_count']} pricing plan(s)",
            "details": {
                "matched_plans": result["matched_count"],
                "updated_plans": result["modified_count"],
                "feature_added": {
                    "name": feature.name,
                    "total_capacity": feature.get_effective_total_capacity(),
                    "daily_limit": feature.get_effective_daily_limit()
                }
            },
            "total_active_plans": len(updated_plans)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding feature to pricing plans: {str(e)}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while adding the feature to pricing plans"
        )

@router.delete("/{plan_id}")
async def delete_plan_and_dodo(plan_id: str, plan_crud: PricingPlanCRUD = Depends(get_plan_crud)):
    """Delete a plan and its associated Dodo product (if exists)"""
    plan = await plan_crud.get_plan(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="PlanInDB not found")

    dodo = DodoPaymentsSingleton.get_instance()

    try:
        if plan.dodo_product_id:
            await dodo.delete_product(plan.dodo_product_id)
        await plan_crud.delete_plan(plan_id)
        return {"message": "Plan and Dodo product deleted"}
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{plan_id}/upload_image")
async def upload_plan_image(plan_id: str,file: UploadFile = File(...),plan_crud: PricingPlanCRUD = Depends(get_plan_crud)):
    """Upload image for Dodo product associated with plan"""
    plan = await plan_crud.get_plan(plan_id)
    if not plan or not plan.dodo_product_id:
        raise HTTPException(status_code=404, detail="Plan or Dodo product not found")

    dodo = DodoPaymentsSingleton.get_instance()

    try:
        image_url = await dodo.update_product_image(plan.dodo_product_id, file, file.content_type)
        return {"message": "Image uploaded successfully", "image_url": image_url}
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image upload failed: {str(e)}")
