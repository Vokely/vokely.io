# app/routers/contact.py
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from utils.email_service import send_contact_emails

class ContactFormSubmission(BaseModel):
    fullName: str
    email: EmailStr
    phoneNumber: Optional[str] = None
    subject: str
    message: str

class ContactFormResponse(BaseModel):
    success: bool
    message: str
    emailStatus: dict

router = APIRouter()

@router.post("/", response_model=ContactFormResponse, status_code=status.HTTP_200_OK)
async def submit_contact_form(submission: ContactFormSubmission):
    """
    Submit a new contact form
    
    This endpoint:
    1. Sends an email notification to support@vokely.io with the form details
    2. Sends an auto-reply email to the user confirming their message was received
    """
    try:
        # Send both emails - notification to support and auto-reply to user
        email_results = await send_contact_emails(
            fullName=submission.fullName,
            email=submission.email,
            phoneNumber=submission.phoneNumber,
            subject=submission.subject,
            message=submission.message
        )
        
        # Check if at least one email was sent successfully
        if email_results["notificationSent"] or email_results["autoReplySent"]:
            return {
                "success": True,
                "message": "Your message has been received. We'll get back to you soon.",
                "emailStatus": email_results
            }
        else:
            # Both emails failed, but we don't want to show a full error to the user
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process your request due to email delivery issues"
            )
            
    except Exception as e:
        # Log the error for debugging
        print(f"Error processing contact form: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process your request"
        )