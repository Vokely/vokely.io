from fastapi import APIRouter, Depends, Request, HTTPException, status
from crud.transaction import TransactionCRUD
from db.config import get_database
from services.dodo_webhook_handler import DodoPaymentsSingleton
from utils.redis.redis_keys import RedisKeys
from utils.logger import logger  

router = APIRouter()

async def get_transaction_crud():
    db = await get_database()
    return TransactionCRUD(db)


@router.post("/webhook-handler")
async def handle_dodo_payment_webhook(request: Request,tx_crud: TransactionCRUD = Depends(get_transaction_crud)):
    """Handle incoming Dodo Payments webhook events."""
    try:
        payload = await request.body()
        headers = dict(request.headers)

        signature = request.headers.get("webhook-signature")
        timestamp = request.headers.get("webhook-timestamp")
        webhook_id = request.headers.get("webhook-id")

        if not signature or not timestamp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing required webhook headers"
            )

        # Get singleton instance of the webhook handler, pass request
        handler = DodoPaymentsSingleton.get_instance(request=request)

        # Process the webhook
        result = await handler.process_webhook(
            payload=payload,
            headers=headers
        )

        if result.get("status") == "error":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("message", "Webhook processing failed")
            )
        elif result.get("status") == "success":
            logger.info(f"Webhook processed successfully: {result}")
            user_details = getattr(request.state, "user", None)
            logger.debug(f"User details from request state: {user_details}")
            if user_details:
                user_data_cache_key = RedisKeys.get_user_data(user_details.id)
                await request.app.redis.delete_key(user_data_cache_key) 
        return result

    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook processing failed: {str(e)}"
        )
