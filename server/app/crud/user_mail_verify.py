from fastapi import HTTPException
from typing import List
from models.user_verification import UserVerification
import random

class VerificationCRUD:
    def __init__(self, db):
        self.db = db
        self.collection = self.db["mail_verify"]

    async def generate_verification_code(self):
        return str(random.randint(100000, 999999))  # 6-digit code

    async def create_verification_entry(self, user: UserVerification):
        existing_user = await self.collection.find_one({"email": user.email})
        verification_code = await self.generate_verification_code()
        
        if existing_user:
            await self.collection.update_one(
                {"email": user.email}, 
                {"$set": {"generated_code": verification_code, "verified": False}}
            )
        else:
            user_data = user.dict()
            user_data["generated_code"] = verification_code
            await self.collection.insert_one(user_data)
        
        return verification_code

    async def verify_code(self, email: str, code: str):
        user = await self.collection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.get("generated_code") == code:
            await self.collection.update_one({"email": email}, {"$set": {"verified": True}})
            return {"message": "Email verified successfully"}
        
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    async def is_email_verified(self, email: str):
        user = await self.collection.find_one({"email": email})
        if not user:
            return {"exists": False, "verified": False}
        
        return {"exists": True, "verified": user.get("verified", False)}
