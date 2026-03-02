import os
import httpx
from utils.logger import logger
from typing import Optional, Dict, Any
from fastapi import HTTPException, UploadFile
import mimetypes
import io
import urllib.parse

class DodoPaymentsService:
    """Service class for handling Dodo Payments product operations."""

    def __init__(self):  
        logger.debug("DodoPaymentsService __init__ started")
        self.api_key = os.getenv("DODO_PAYMENTS_API_KEY")
        self.webhook_secret = os.getenv("DODO_WEBHOOK_SECRET")
        self.base_url = os.getenv("DODO_API_BASE_URL", "https://test.dodopayments.com")
        self.environment = os.getenv("DODO_ENVIRONMENT", "test")
        logger.debug({
            "api_key": self.api_key,
            "webhook_secret": self.webhook_secret,
            "base_url": self.base_url,
            "environment": self.environment
        })


        if not self.api_key:
            raise ValueError("DODO_PAYMENTS_API_KEY is required")
        if not self.webhook_secret:
            raise ValueError("DODO_WEBHOOK_SECRET is required")

        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            },
            timeout=30.0
        )
        logger.info(f"Initialized Dodo Payments service in {self.environment} environment")

    async def close(self):
        await self.client.aclose()

    async def _handle_request(self, func, *args, **kwargs):
        try:
            resp = await func(*args, **kwargs)
            resp.raise_for_status()
            if resp.status_code == 204 or not resp.content:
                return None
            try:
                return resp.json()
            except ValueError:
                return None

        except httpx.HTTPStatusError as e:
            error_data = None
            try:
                error_data = e.response.json()
            except Exception:
                pass

            # Log full error object
            logger.error({
                "source": "Dodo API",
                "status_code": e.response.status_code,
                "error": error_data or e.response.text
            })

            # Create user-friendly flat detail string
            code = error_data.get("code", "UNKNOWN_ERROR") if error_data else "UNKNOWN_ERROR"
            message = error_data.get("message", e.response.text if e.response else "Unknown error")
            flat_detail = f"Dodo API error: [{code}] {message}"

            raise HTTPException(
                status_code=e.response.status_code,
                detail=flat_detail
            )

        except httpx.RequestError as e:
            logger.error({
                "type": "ConnectionError",
                "message": str(e)
            })
            raise HTTPException(
                status_code=503,
                detail="Failed to connect to Dodo Payments API"
            )

        except Exception as e:
            logger.exception("Unexpected error in DodoPaymentsService")
            raise HTTPException(
                status_code=500,
                detail=f"Unexpected error: {str(e)}"
            )

    async def upload_image_from_url(self, product_id: str, image_url: str):
        """
        Downloads an image from the given URL and uploads it to Dodo using pre-signed URL.
        """
        try:
            async with httpx.AsyncClient() as http_client:
                resp = await http_client.get(image_url)
                resp.raise_for_status()

                content_type = resp.headers.get("Content-Type") or mimetypes.guess_type(image_url)[0] or "image/png"
                image_data = resp.content

            # Create a Starlette UploadFile-like object
            image_file = UploadFile(
                filename=image_url.split("/")[-1] or "upload.png",
                file=io.BytesIO(image_data)
            )
            return await self.update_product_image(product_id, image_file,content_type)

        except Exception as e:
            logger.error(f"Failed to upload image from URL for product {product_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to upload product image from URL")


    async def create_product(self, name: str, amount: float, currency: str, desc:str) -> str:
        payload = {
            "brand_id": "bus_zwtPzwyxtuPqcZ7zHyaka",
            "description": desc,
            "name": name,
            "price": {
                "price": round(amount * 100),  # Corrected conversion
                "currency": currency,
                "discount":0,
                "type": "one_time_price",
                "purchasing_power_parity": False,
                "tax_inclusive": True
            },
            "tax_category": "saas"
        }
        data = await self._handle_request(self.client.post, "/products", json=payload)
        product_id = data["product_id"]
        #Upload image
        image_url = "https://storage.googleapis.com/genresume_bucket/public/images/favicon.png"
        upload_image_url = await self.upload_image_from_url(product_id, image_url)
        return product_id, upload_image_url

    async def get_product(self, product_id: str) -> dict:
        return await self._handle_request(self.client.get, f"/products/{product_id}")

    async def update_product(self, product_id: str, update_data: Dict[str, Any]):
        logger.debug(update_data)
        updated_price = update_data["price"]
        if updated_price:
            update_data["price"] = {
                "price": round(updated_price * 100),  
                "currency": update_data["currency"],
                "discount":0,
                "type": "one_time_price",
                "purchasing_power_parity": False,
                "tax_inclusive": True
            }
        return await self._handle_request(self.client.patch, f"/products/{product_id}", json=update_data)

    async def update_product_image(self, product_id: str, image_file: UploadFile, content_type:str) -> Dict[str, str]:
        """
        Step 1: Request pre-signed S3 upload URL from Dodo.
        Step 2: Upload the image to the returned S3 URL.
        """
        # Step 1: Get the upload URL
        response = await self._handle_request(self.client.put, f"/products/{product_id}/images")

        presigned_url = response.get("url")
        logger.debug(f"Presigned url :{presigned_url}")
        if not presigned_url:
            raise HTTPException(status_code=500, detail="Dodo failed to return upload URL")

        # Step 2: Upload image to S3
        try:
            file_data = await image_file.read()
            headers = {
                "Content-Type": content_type,
                "Content-Length": str(len(file_data))
            }

            upload_resp = await httpx.AsyncClient().put(presigned_url, content=file_data, headers=headers)
            upload_resp.raise_for_status()
            
            # Step 3: Extract base URL if upload succeeded
            if upload_resp.status_code == 200:
                parsed_url = urllib.parse.urlparse(presigned_url)
                permanent_url = f"{parsed_url.scheme}://{parsed_url.netloc}{parsed_url.path}"
                return permanent_url

        except Exception as e:
            logger.error(f"Failed to upload image to S3: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to upload image to Dodo S3 URL")
        
    async def delete_product(self, product_id: str):
        await self._handle_request(self.client.delete, f"/products/{product_id}")
        return True

class DodoPaymentsSingleton:
    _instance: Optional[DodoPaymentsService] = None

    @classmethod
    def get_instance(cls) -> DodoPaymentsService:
        if cls._instance is None:
            cls._instance = DodoPaymentsService()
        return cls._instance
