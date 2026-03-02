from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Literal
from datetime import datetime

class BillingDetails(BaseModel):
    street: Optional[str]
    city: Optional[str]
    state: Optional[str]
    country: Optional[str]
    zipcode: Optional[str]

class CustomerDetails(BaseModel):
    customer_id: str
    email: EmailStr
    name: Optional[str]

class ProductInfo(BaseModel):
    product_id: str
    quantity: int

class TransactionBase(BaseModel):
    payment_id: str
    payment_link: Optional[str]

    customer: CustomerDetails
    billing: Optional[BillingDetails]

    currency: str
    settlement_currency: Optional[str]
    amount: int
    tax: Optional[int] = 0
    settlement_amount: Optional[int]
    settlement_tax: Optional[int]

    status: Literal["succeeded", "failed"]
    payment_method: Optional[str]
    payment_method_type: Optional[str]

    error_code: Optional[str]
    error_message: Optional[str]
    dodo_metadata: dict = Field(default_factory=dict)

    created_at: datetime
    updated_at: Optional[datetime] = None


class TransactionCreate(TransactionBase):
    user_id: str 
    plan_id: str

class TransactionInDB(TransactionCreate):
    id: str
    webhook_received_at: datetime

class TransactionResponse(TransactionInDB):
    """Model to return as response to clients"""
    pass