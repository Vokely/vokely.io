def generate_verification_email(name: str, code: str):
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Verify Your Email - Genresume</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                text-align: center;
            }}
            .logo {{
                font-size: 24px;
                font-weight: bold;
                color: #4CAF50;
                text-transform: uppercase;
                margin-bottom: 10px;
            }}
            .content {{
                font-size: 16px;
                color: #333333;
                line-height: 1.6;
            }}
            .code {{
                font-size: 22px;
                font-weight: bold;
                background: #f3f3f3;
                padding: 10px;
                display: inline-block;
                border-radius: 5px;
                margin: 10px 0;
            }}
            .footer {{
                margin-top: 20px;
                font-size: 14px;
                color: #777777;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">Genresume</div>
            <p class="content">Hi {name},</p>
            <p class="content">Thank you for signing up for Genresume. Please verify your email address using the code below:</p>
            <p class="code">{code}</p>
            <p class="content">Enter this code in the app to complete your verification.</p>
            <p class="footer">If you didn’t sign up for Genresume, please ignore this email.</p>
            <p class="footer">Best Regards, <br> The Genresume Team</p>
        </div>
    </body>
    </html>
    """

def reset_password_template(name,code):
    return f"""
        <!DOCTYPE html>
        <html lang="en" style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f6f6;">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Genresume.io - Password Reset</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f6f6;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                    <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                        <h1 style="margin: 0; color: #8F56E8;">Genresume.io</h1>
                    </td>
                    </tr>
                    <tr>
                    <td style="padding: 0 40px 20px; text-align: center;">
                        <h2 style="margin: 0 0 10px; font-size: 20px; color: #333333;">Hi {name},forgot your password?</h2>
                        <p style="margin: 0; font-size: 16px; color: #555555;">No worries! Use the verification code below to reset it:</p>
                    </td>
                    </tr>
                    <tr>
                    <td style="padding: 30px 40px; text-align: center;">
                        <div style="display: inline-block; padding: 16px 32px; background-color: #8F56E8; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 4px; border-radius: 8px;">
                        {code}
                        </div>
                    </td>
                    </tr>
                    <tr>
                    <td style="padding: 0 40px 30px; text-align: center;">
                        <p style="font-size: 14px; color: #777777;">This code will expire in 10 minutes. If you didn’t request this, you can safely ignore it.</p>
                    </td>
                    </tr>
                    <tr>
                    <td style="padding: 20px 40px 10px; text-align: center;">
                        <p style="font-size: 14px; color: #aaa;">Need help? Contact us at <a href="mailto:support@vokely.io" style="color: #8F56E8; text-decoration: none;">support@vokely.io</a></p>
                    </td>
                    </tr>
                    <tr>
                    <td style="padding: 0 40px 30px; text-align: center; background-color: #f0f0f0; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                        <p style="font-size: 12px; color: #999;">© 2025 Genresume.io. All rights reserved.</p>
                    </td>
                    </tr>
                </table>
                </td>
            </tr>
            </table>
        </body>
        </html>
    """

def confirmation_email_template(name):
    return f"""
        <!DOCTYPE html>
        <html lang="en" style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f6f6;">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Genresume.io - Onboarding Confirmation</title>
        </head>
            <body style="margin: 0; padding: 0; background-color: #f6f6f6;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td align="center" style="padding: 40px 10px;">
                            <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                                <tr>
                                    <td style="padding: 40px 40px 20px; text-align: center;">
                                        <h1 style="margin: 0; color: #8F56E8;">Genresume.io</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 40px 20px; text-align: center;">
                                        <h2 style="margin: 0 0 10px; font-size: 20px; color: #333333;">Welcome aboard, {name}!</h2>
                                        <p style="margin: 0; font-size: 16px; color: #555555;">We’re excited to have you on the beta version of vokely.io. Click the button below to start using our AI Career tools.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 30px 40px; text-align: center;">
                                        <a href="https://vokely.io/create-account" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #8F56E8; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px;">Start your Journey</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 40px 30px; text-align: center;">
                                        <p style="font-size: 14px; color: #777777;">If you have any questions or need help, feel free to reach out to us anytime.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 40px 10px; text-align: center;">
                                        <p style="font-size: 14px; color: #aaa;">Need help? Contact us at <a href="mailto:support@vokely.io" style="color: #8F56E8; text-decoration: none;">support@vokely.io</a></p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 0 20px; text-align: center; background-color:#8F56E8; height:150px;overflow:hidden;">
                                        <img src="https://storage.googleapis.com/genresume_bucket/public/images/email-footer.png" alt="Genresume Logo" width="100%" height="100%" style="margin-top: 10px;" />
                                    </td>
                                </tr>
                                </tr>
                                <tr>
                                    <td style="padding: 0 40px 30px; text-align: center; background-color: #f0f0f0; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                                        <p style="font-size: 12px; color: #999;">© 2025 Genresume.io. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
    """
    
def contact_confirmation_template(name):
    """Email template for auto-reply to users who submit the contact form"""
    return f"""
        <!DOCTYPE html>
        <html lang="en" style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f6f6;">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Genresume.io - Contact Confirmation</title>
        </head>
            <body style="margin: 0; padding: 0; background-color: #f6f6f6;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td align="center" style="padding: 40px 10px;">
                            <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                                <tr>
                                    <td style="padding: 40px 40px 20px; text-align: center;">
                                        <h1 style="margin: 0; color: #8F56E8;">Genresume.io</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 40px 20px; text-align: center;">
                                        <h2 style="margin: 0 0 10px; font-size: 20px; color: #333333;">Thank you for reaching out, {name}!</h2>
                                        <p style="margin: 0; font-size: 16px; color: #555555;">We've received your message and our team will get back to you as soon as possible, typically within 24-48 hours.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 40px; text-align: center;">
                                        <p style="font-size: 16px; color: #555555;">In the meantime, you might find answers to common questions in our <a href="https://vokely.io/faq" style="color: #8F56E8; text-decoration: none;">FAQ section</a>.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 40px 30px; text-align: center;">
                                        <a href="https://vokely.io" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #8F56E8; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px;">Visit Our Website</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 40px 10px; text-align: center;">
                                        <p style="font-size: 14px; color: #aaa;">Need immediate help? Contact us at <a href="mailto:support@vokely.io" style="color: #8F56E8; text-decoration: none;">support@vokely.io</a></p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 0 20px; text-align: center; background-color:#8F56E8; height:150px;overflow:hidden;">
                                        <img src="https://storage.googleapis.com/genresume_bucket/public/images/email-footer.png" alt="Genresume Logo" width="100%" height="100%" style="margin-top: 10px;" />
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 40px 30px; text-align: center; background-color: #f0f0f0; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                                        <p style="font-size: 12px; color: #999;">© 2025 Genresume.io. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
    """

def support_notification_template(fullName, email, phoneNumber, subject, message):
    """Email template for notifying support about a new contact form submission"""
    phone_display = phoneNumber if phoneNumber else "Not provided"
    
    return f"""
        <!DOCTYPE html>
        <html lang="en" style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f6f6;">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>New Contact Form Submission</title>
        </head>
            <body style="margin: 0; padding: 0; background-color: #f6f6f6;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td align="center" style="padding: 40px 10px;">
                            <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                                <tr>
                                    <td style="padding: 40px 40px 20px; text-align: center;">
                                        <h1 style="margin: 0; color: #8F56E8;">New Contact Form Submission</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 40px 20px;">
                                        <h2 style="margin: 0 0 20px; font-size: 20px; color: #333333;">Contact Details:</h2>
                                        
                                        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
                                            <tr>
                                                <td style="border-bottom: 1px solid #eee; width: 120px;"><strong>Name:</strong></td>
                                                <td style="border-bottom: 1px solid #eee;">{fullName}</td>
                                            </tr>
                                            <tr>
                                                <td style="border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                                                <td style="border-bottom: 1px solid #eee;"><a href="mailto:{email}" style="color: #8F56E8; text-decoration: none;">{email}</a></td>
                                            </tr>
                                            <tr>
                                                <td style="border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
                                                <td style="border-bottom: 1px solid #eee;">{phone_display}</td>
                                            </tr>
                                            <tr>
                                                <td style="border-bottom: 1px solid #eee;"><strong>Subject:</strong></td>
                                                <td style="border-bottom: 1px solid #eee;">{subject}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 40px 30px;">
                                        <h3 style="margin: 0 0 10px; font-size: 18px; color: #333333;">Message:</h3>
                                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; border-left: 4px solid #8F56E8;">
                                            <p style="margin: 0; font-size: 16px; color: #555555; white-space: pre-line;">{message}</p>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 40px 30px; text-align: center;">
                                        <a href="mailto:{email}?subject=Re: {subject}" style="display: inline-block; padding: 14px 28px; background-color: #8F56E8; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px;">Reply to {fullName}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 40px 30px; text-align: center; background-color: #f0f0f0; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                                        <p style="font-size: 12px; color: #999;">© 2025 Genresume.io. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
    """