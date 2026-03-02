"""
Dodo Payments Webhook Handler
Enhanced webhook handler implementing Standard Webhooks specification for Dodo Payments.
Based on official Dodo Payments documentation and best practices.
"""

import os
import json
from typing import Dict, Any, Optional
from datetime import datetime
from dateutil.relativedelta import relativedelta
from enum import Enum
from pydantic import BaseModel
from standardwebhooks.webhooks import Webhook
from utils.logger import logger  
#models
from models.transaction import TransactionCreate, BillingDetails, CustomerDetails
from models.pricing_plans import PlanDuration
from models.user_plan import UserPlanCreate
#crud
from crud.transaction import TransactionCRUD
from crud.user import UserCRUD
from crud.user_plan import UserPlanCRUD
from crud.pricing_plans import PricingPlanCRUD
#utils
from db.config import get_database
#routers
from routers.user_router import create_usage_details_from_plan_features

class DodoWebhookEvents(str, Enum):
    PAYMENT_SUCCESS = "payment.succeeded"
    PAYMENT_FAILED = "payment.failed"
    PAYMENT_PROCESSING = "payment.processing"
    PAYMENT_CANCELLED = "payment.cancelled"

class DodoWebhookEvent(BaseModel):
    business_id: str
    timestamp: str
    type: DodoWebhookEvents
    data: Dict[str, Any]

async def get_transaction_crud():
    db = await get_database()
    return TransactionCRUD(db)

async def get_user_crud():
    db = await get_database()
    return UserCRUD(db)

async def get_user_plan_crud():
    db = await get_database()
    return UserPlanCRUD(db)

async def get_pricing_plan_crud():
    db = await get_database()
    return PricingPlanCRUD(db)

class DodoWebhookHandler:
    """
    Enhanced webhook handler for Dodo Payments following Standard Webhooks specification.
    Handles subscription lifecycle events and payment processing.
    """
    
    def __init__(self, request=None):
        self.webhook_secret = os.getenv("DODO_WEBHOOK_SECRET")
        self.environment = os.getenv("DODO_ENVIRONMENT", "test")
        self.tolerance = 300  
        self.webhook = Webhook(self.webhook_secret)
        self.request = request  # Store request object

        if not self.webhook_secret:
            raise ValueError("DODO_WEBHOOK_SECRET is required")
        logger.info(f"Initialized Dodo webhook handler for {self.environment} environment")
    
    async def process_webhook(self, payload: bytes,headers: Dict[str, str],) -> Dict[str, Any]:
        try:
            self.webhook.verify(payload, headers)
        except Exception as e:
            logger.error(f"Webhook signature verification failed: {str(e)}")
            return {
                "status": "error",
                "message": "Signature verification failed",
                "code": "INVALID_SIGNATURE"
            }

        try:
            webhook_data = json.loads(payload.decode('utf-8'))
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON payload: {e}")
            return {
                "status": "error",
                "message": "Invalid JSON payload",
                "code": "INVALID_JSON"
            }

        try:
            logger.info(f"Received webhook for {webhook_data['type']}")
            webhook_event = DodoWebhookEvent(
                business_id=webhook_data["business_id"],
                timestamp=webhook_data["timestamp"],
                type=webhook_data["type"],
                data=webhook_data["data"]
            )
        except Exception as e:
            logger.error(f"Webhook event validation error: {e}")
            return {
                "status": "error",
                "message": "Event validation error",
                "code": "INVALID_EVENT"
            }

        result = await self._process_event(webhook_event)
        logger.info(f"Webhook processed: {webhook_event.type}")
        return {
            "status": "success",
            "message": "Webhook processed successfully",
            "event_type": webhook_event.type,
            "result": result
        }

    async def _process_event(self, webhook_event: DodoWebhookEvent) -> Dict[str, Any]:
        if webhook_event.type == DodoWebhookEvents.PAYMENT_SUCCESS:
            return await self._handle_payment_succeeded(webhook_event)
        elif webhook_event.type == DodoWebhookEvents.PAYMENT_FAILED:
            return await self._handle_payment_failed(webhook_event)
        elif webhook_event.type == DodoWebhookEvents.PAYMENT_PROCESSING:
            return await self._handle_payment_processing(webhook_event)
        elif webhook_event.type == DodoWebhookEvents.PAYMENT_CANCELLED:
            return await self._handle_payment_cancelled(webhook_event)
        else:
            logger.warning(f"Unhandled event type: {webhook_event.type}")
            return {"status": "ignored", "message": "Unhandled event type"}


    async def _handle_payment_succeeded(self, webhook_event: DodoWebhookEvent) -> Dict[str, Any]:
        return await self._log_transaction(webhook_event, status="succeeded")

    async def _handle_payment_failed(self, webhook_event: DodoWebhookEvent) -> Dict[str, Any]:
        return await self._log_transaction(webhook_event, status="failed")

    async def _handle_payment_processing(self, webhook_event: DodoWebhookEvent) -> Dict[str, Any]:
        return await self._log_transaction(webhook_event, status="processing")

    async def _handle_payment_cancelled(self, webhook_event: DodoWebhookEvent) -> Dict[str, Any]:
        return await self._log_transaction(webhook_event, status="cancelled")

    async def update_user_plan(self, user_details: UserCRUD, product_id: str):
        try:
            pricing_plan_crud = await get_pricing_plan_crud()
            plan_details = await pricing_plan_crud.get_plan_by_product_id(product_id)
            duration = plan_details.get("duration")

            user_plan_crud = await get_user_plan_crud()
            
            # Start date is now
            start_date = datetime.utcnow()

            # Determine expiry date based on plan duration
            if duration == PlanDuration.MONTHLY:
                expiry_date = start_date + relativedelta(months=1)
            elif duration == PlanDuration.QUATERLY:
                expiry_date = start_date + relativedelta(months=3)
            else:
                raise ValueError(f"Unsupported plan duration: {duration}")

            usage_details = create_usage_details_from_plan_features(plan_details.get("features"))
            user_plan = await user_plan_crud.create_user_plan(UserPlanCreate(
                user_id=user_details.id,
                plan_id=plan_details.get("id"),
                plan_details=plan_details,
                geo_location_details=user_details.geo_location_details,
                usage_details=usage_details,
                start_date=start_date,
                expiry_date=expiry_date
            ))
        except Exception as e:
            logger.error({
                "source": "update_user_plan",
                "product_id": product_id,
                "user_id": getattr(user_details, "id", None),
                "error": str(e)
            })
            raise e  

    async def _log_transaction(self, webhook_event: DodoWebhookEvent, status: str) -> Dict[str, Any]:
        try:
            user_crud = await get_user_crud()
            transaction_crud = await get_transaction_crud()
            
            customer_data = webhook_event.data.get("customer", {})
            email = customer_data.get("email")

            if not email:
                raise ValueError("Missing customer_email in webhook data")

            user = await user_crud.find_user_by_email(email)
            # Set user in request state for audit logs
            if self.request:
                self.request.state.user = user
            if not user:
                raise ValueError(f"No user found with email {email}")
            
            product_id = webhook_event.data["product_cart"][0]["product_id"]
            transaction = TransactionCreate(
                user_id=user.id,
                plan_id=product_id,

                payment_id=webhook_event.data["payment_id"],
                payment_link=webhook_event.data.get("payment_link"),

                customer=CustomerDetails(**customer_data),
                billing=BillingDetails(**webhook_event.data["billing"]) if webhook_event.data.get("billing") else None,

                currency=webhook_event.data["currency"],
                settlement_currency=webhook_event.data.get("settlement_currency"),
                amount=webhook_event.data["total_amount"],
                tax=webhook_event.data.get("tax", 0),
                settlement_amount=webhook_event.data.get("settlement_amount"),
                settlement_tax=webhook_event.data.get("settlement_tax"),

                status=status,
                payment_method=webhook_event.data.get("payment_method"),
                payment_method_type=webhook_event.data.get("payment_method_type"),

                error_code=webhook_event.data.get("error_code"),
                error_message=webhook_event.data.get("error_message"),
                dodo_metadata=webhook_event.data.get("metadata", {}),

                created_at=datetime.fromisoformat(webhook_event.data["created_at"]),
                updated_at=datetime.fromisoformat(webhook_event.data["updated_at"]) if webhook_event.data.get("updated_at") else None
            )
            created = await transaction_crud.create_transaction(transaction)
            if webhook_event.type == DodoWebhookEvents.PAYMENT_SUCCESS:
                await self.update_user_plan(user_details=user,product_id=product_id)
            return { "success":True }

        except Exception as e:
            logger.error(f"Failed to log transaction: {e}")
            return {"status": "error", "message": str(e)}

# Singleton 
class DodoPaymentsSingleton:
    _instance: Optional[DodoWebhookHandler] = None

    @classmethod
    def get_instance(cls, request=None) -> DodoWebhookHandler:
        if cls._instance is None or (request and getattr(cls._instance, "request", None) != request):
            cls._instance = DodoWebhookHandler(request=request)
        return cls._instance
