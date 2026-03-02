from fastapi import APIRouter, Depends, HTTPException, Query, Request
from typing import Optional
from datetime import datetime, timedelta
from crud.token_usage import TokenUsageCRUD
from models.token_usage import TokenUsageCreate, TokenUsageInDb
from db.config import get_database
from utils.logger import logger

router = APIRouter()

def attach_token_usage(request: Request, usage, model: str):
    """
    Safely attach or update token usage on request.state.token_usage.
    If values already exist, merge (accumulate) them.
    """
    try:
        if not request or not usage:
            return

        # Extract usage safely
        input_tokens = getattr(usage, "prompt_tokens", 0) or 0
        output_tokens = getattr(usage, "completion_tokens", 0) or 0
        used_model = getattr(usage, "model", None) or model

        # If token usage already exists: accumulate them
        existing = getattr(request.state, "token_usage", {})

        merged_input = existing.get("input_tokens", 0) + int(input_tokens)
        merged_output = existing.get("output_tokens", 0) + int(output_tokens)

        request.state.token_usage = {
            "input_tokens": merged_input,
            "output_tokens": merged_output,
            "model": used_model,  # latest model overrides
        }

    except Exception as e:
        logger.error(f"Warning: failed to attach token usage to request.state: {e}")

# Dependency to get the CRUD instance
async def get_token_usage_crud():
    db = await get_database()
    return TokenUsageCRUD(db)


# ==================== BASIC CRUD ENDPOINTS ====================

@router.post("/", response_model=TokenUsageInDb, status_code=201)
async def create_token_usage(
    usage: TokenUsageCreate,
    crud: TokenUsageCRUD = Depends(get_token_usage_crud)
):
    """Create a new token usage record"""
    try:
        return await crud.create_token_usage(usage)
    except HTTPException as http_exc:
        raise http_exc


@router.get("/", response_model=dict)
async def get_token_usage_records(
    user_id: Optional[str] = Query(default=None),
    module_id: Optional[str] = Query(default=None),
    model: Optional[str] = Query(default=None),
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    limit: int = Query(default=100, le=1000),
    crud: TokenUsageCRUD = Depends(get_token_usage_crud)
):
    """Get token usage records with optional filters"""
    try:
        records = await crud.get_all_usage(
            user_id=user_id,
            module_id=module_id,
            model=model,
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )
        return {"records": records, "count": len(records)}
    except HTTPException as http_exc:
        raise http_exc


@router.get("/{usage_id}", response_model=TokenUsageInDb)
async def get_token_usage_by_id(
    usage_id: str,
    crud: TokenUsageCRUD = Depends(get_token_usage_crud)
):
    """Get a single token usage record by ID"""
    try:
        return await crud.get_usage_by_id(usage_id)
    except HTTPException as http_exc:
        raise http_exc


@router.delete("/{usage_id}", response_model=dict)
async def delete_token_usage(
    usage_id: str,
    crud: TokenUsageCRUD = Depends(get_token_usage_crud)
):
    """Delete a token usage record"""
    try:
        await crud.delete_usage(usage_id)
        return {"message": "Token usage record deleted successfully"}
    except HTTPException as http_exc:
        raise http_exc


# ==================== ANALYTICS ENDPOINTS ====================

@router.get("/analytics/summary", response_model=dict)
async def get_dashboard_summary(
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    crud: TokenUsageCRUD = Depends(get_token_usage_crud)
):
    """Get comprehensive dashboard summary statistics"""
    try:
        summary = await crud.get_dashboard_summary(
            start_date=start_date,
            end_date=end_date
        )
        return {"summary": summary}
    except HTTPException as http_exc:
        raise http_exc


@router.get("/analytics/by-user", response_model=dict)
async def get_tokens_by_user(
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    crud: TokenUsageCRUD = Depends(get_token_usage_crud)
):
    """Get total token usage aggregated by user"""
    try:
        data = await crud.get_total_tokens_by_user(
            start_date=start_date,
            end_date=end_date
        )
        return {"data": data, "count": len(data)}
    except HTTPException as http_exc:
        raise http_exc


@router.get("/analytics/by-module", response_model=dict)
async def get_tokens_by_module(
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    crud: TokenUsageCRUD = Depends(get_token_usage_crud)
):
    """Get total token usage aggregated by module"""
    try:
        data = await crud.get_total_tokens_by_module(
            start_date=start_date,
            end_date=end_date
        )
        return {"data": data, "count": len(data)}
    except HTTPException as http_exc:
        raise http_exc


@router.get("/analytics/by-model", response_model=dict)
async def get_tokens_by_model(
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    crud: TokenUsageCRUD = Depends(get_token_usage_crud)
):
    """Get total token usage aggregated by AI model"""
    try:
        data = await crud.get_total_tokens_by_model(
            start_date=start_date,
            end_date=end_date
        )
        return {"data": data, "count": len(data)}
    except HTTPException as http_exc:
        raise http_exc


@router.get("/analytics/over-time", response_model=dict)
async def get_usage_over_time(
    granularity: str = Query(default="day", regex="^(hour|day|week|month)$"),
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    user_id: Optional[str] = Query(default=None),
    module_id: Optional[str] = Query(default=None),
    crud: TokenUsageCRUD = Depends(get_token_usage_crud)
):
    """Get token usage over time with specified granularity (hour/day/week/month)"""
    try:
        data = await crud.get_usage_over_time(
            granularity=granularity,
            start_date=start_date,
            end_date=end_date,
            user_id=user_id,
            module_id=module_id
        )
        return {"data": data, "count": len(data), "granularity": granularity}
    except HTTPException as http_exc:
        raise http_exc


@router.get("/analytics/top-users", response_model=dict)
async def get_top_users(
    limit: int = Query(default=10, le=100),
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    crud: TokenUsageCRUD = Depends(get_token_usage_crud)
):
    """Get top users by token consumption"""
    try:
        data = await crud.get_top_users(
            limit=limit,
            start_date=start_date,
            end_date=end_date
        )
        return {"data": data, "count": len(data)}
    except HTTPException as http_exc:
        raise http_exc


@router.get("/analytics/user/{user_id}/breakdown", response_model=dict)
async def get_user_module_breakdown(
    user_id: str,
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    crud: TokenUsageCRUD = Depends(get_token_usage_crud)
):
    """Get detailed breakdown of token usage by module and model for a specific user"""
    try:
        data = await crud.get_user_module_breakdown(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date
        )
        return {"user_id": user_id, "data": data, "count": len(data)}
    except HTTPException as http_exc:
        raise http_exc


@router.get("/analytics/comparison", response_model=dict)
async def get_usage_comparison(
    current_start: datetime = Query(..., description="Start date of current period"),
    current_end: datetime = Query(..., description="End date of current period"),
    previous_start: datetime = Query(..., description="Start date of previous period"),
    previous_end: datetime = Query(..., description="End date of previous period"),
    crud: TokenUsageCRUD = Depends(get_token_usage_crud)
):
    """Compare usage between two time periods with percentage changes"""
    try:
        comparison = await crud.get_usage_comparison(
            current_start=current_start,
            current_end=current_end,
            previous_start=previous_start,
            previous_end=previous_end
        )
        return comparison
    except HTTPException as http_exc:
        raise http_exc


# ==================== CONVENIENCE ENDPOINTS ====================

@router.get("/analytics/quick/today", response_model=dict)
async def get_today_summary(
    crud: TokenUsageCRUD = Depends(get_token_usage_crud)
):
    """Get token usage summary for today"""
    try:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = datetime.utcnow()
        
        summary = await crud.get_dashboard_summary(
            start_date=today_start,
            end_date=today_end
        )
        return {"period": "today", "summary": summary}
    except HTTPException as http_exc:
        raise http_exc


@router.get("/analytics/quick/this-week", response_model=dict)
async def get_this_week_summary(
    crud: TokenUsageCRUD = Depends(get_token_usage_crud)
):
    """Get token usage summary for this week"""
    try:
        now = datetime.utcnow()
        week_start = now - timedelta(days=now.weekday())
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        
        summary = await crud.get_dashboard_summary(
            start_date=week_start,
            end_date=now
        )
        return {"period": "this_week", "summary": summary}
    except HTTPException as http_exc:
        raise http_exc


@router.get("/analytics/quick/this-month", response_model=dict)
async def get_this_month_summary(
    crud: TokenUsageCRUD = Depends(get_token_usage_crud)
):
    """Get token usage summary for this month"""
    try:
        now = datetime.utcnow()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        summary = await crud.get_dashboard_summary(
            start_date=month_start,
            end_date=now
        )
        return {"period": "this_month", "summary": summary}
    except HTTPException as http_exc:
        raise http_exc


@router.get("/analytics/quick/last-30-days", response_model=dict)
async def get_last_30_days_summary(
    crud: TokenUsageCRUD = Depends(get_token_usage_crud)
):
    """Get token usage summary for the last 30 days"""
    try:
        now = datetime.utcnow()
        thirty_days_ago = now - timedelta(days=30)
        
        summary = await crud.get_dashboard_summary(
            start_date=thirty_days_ago,
            end_date=now
        )
        return {"period": "last_30_days", "summary": summary}
    except HTTPException as http_exc:
        raise http_exc
