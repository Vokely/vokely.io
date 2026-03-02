import aiosmtplib
from utils.email_template import generate_verification_email, reset_password_template, confirmation_email_template, contact_confirmation_template, support_notification_template
from email.message import EmailMessage
import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = os.getenv("SMTP_PORT")
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SUPPORT_EMAIL = "support@vokely.io"

async def send_mail_to_many(recipients: list[str], subject: str, body: str):
    msg = EmailMessage()
    msg["From"] = SMTP_USERNAME
    msg["To"] = SMTP_USERNAME              
    msg["Bcc"] = ", ".join(recipients)     
    msg["Subject"] = subject
    msg.set_content(body, subtype="html")

    await aiosmtplib.send(
        msg,
        hostname=SMTP_SERVER,
        port=SMTP_PORT,
        start_tls=True,
        username=SMTP_USERNAME,
        password=SMTP_PASSWORD,
        recipients=recipients,             
    )

async def send_verification_email(email: str, code: str):
    msg = EmailMessage()
    msg["From"] = SMTP_USERNAME
    msg["To"] = email
    msg["Subject"] = "Genresume Confirmation Email"
    email_content = generate_verification_email(email, code)
    msg.set_content(email_content, subtype="html")

    await aiosmtplib.send(
        msg,
        hostname=SMTP_SERVER,
        port=SMTP_PORT,
        start_tls=True,  # Enable encryption
        username=SMTP_USERNAME,
        password=SMTP_PASSWORD
    )

async def send_password_reset_email(email: str,name:str, code: str):
    msg = EmailMessage()
    msg["From"] = SMTP_USERNAME
    msg["To"] = email
    msg["Subject"] = "Genresume Email verification"
    email_content = reset_password_template(name, code)
    msg.set_content(email_content, subtype="html")

    await aiosmtplib.send(
        msg,
        hostname=SMTP_SERVER,
        port=SMTP_PORT,
        start_tls=True,  # Enable encryption
        username=SMTP_USERNAME,
        password=SMTP_PASSWORD
    )

async def send_contact_emails(
    fullName: str,
    email: str,
    subject: str,
    message: str,
    phoneNumber: Optional[str] = None
):
    """
    Sends two emails when a contact form is submitted:
    1. A notification to the support team
    2. An auto-reply to the user who submitted the form
    
    Returns a dictionary with success/failure status for both emails
    """
    results = {
        "notificationSent": False,
        "autoReplySent": False
    }
    
    # 1. Send notification email to support
    try:
        notification_msg = EmailMessage()
        notification_msg["From"] = SMTP_USERNAME
        notification_msg["To"] = "genresume.ai@gmail.com"
        notification_msg["Subject"] = f"New Contact Form: {subject}"
        
        notification_content = support_notification_template(
            fullName=fullName,
            email=email,
            phoneNumber=phoneNumber,
            subject=subject,
            message=message
        )
        
        notification_msg.set_content("New contact form submission received.") 
        notification_msg.add_alternative(notification_content, subtype="html")
        
        await aiosmtplib.send(
            notification_msg,
            hostname=SMTP_SERVER,
            port=SMTP_PORT,
            start_tls=True,
            username=SMTP_USERNAME,
            password=SMTP_PASSWORD
        )
        results["notificationSent"] = True
    except Exception as e:
        print(f"Failed to send notification email: {str(e)}")
    
    # 2. Send auto-reply to the user
    try:
        reply_msg = EmailMessage()
        reply_msg["From"] = SUPPORT_EMAIL
        reply_msg["To"] = email
        reply_msg["Subject"] = "We've received your message - Genresume.io"
        
        reply_content = contact_confirmation_template(fullName)
        
        reply_msg.set_content("Thank you for contacting us. We'll get back to you soon.") 
        reply_msg.add_alternative(reply_content, subtype="html")
        
        await aiosmtplib.send(
            reply_msg,
            hostname=SMTP_SERVER,
            port=SMTP_PORT,
            start_tls=True,
            username=SMTP_USERNAME,
            password=SMTP_PASSWORD
        )
        results["autoReplySent"] = True
    except Exception as e:
        print(f"Failed to send auto-reply email: {str(e)}")
    
    return results