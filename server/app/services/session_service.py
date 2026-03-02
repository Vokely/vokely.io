import json
from fastapi import Request, HTTPException
from datetime import datetime
from typing import Optional, Dict, Any, List

from utils.redis.redis_keys import RedisKeys
from utils.auth.jwt import generate_session_id, create_refresh_token
from constants.jwt_constants import REFRESH_TOKEN_EXPIRE_DAYS
from services.redis_client import RedisClient

class SessionService:
    def __init__(self, redis_client: RedisClient):
        self.redis = redis_client
        self.session_expire_seconds = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

    async def create_session(self, request: Request, user_id: str) -> str:
        client_ip = request.client.host
        user_agent = request.headers.get("user-agent", "")
        session_id = generate_session_id()
        refresh_token = create_refresh_token(session_id)

        session_data = {
            "refresh_token": refresh_token,
            "user_id": user_id,
            "ip": client_ip,
            "user_agent": user_agent,
            "created_at": datetime.utcnow().isoformat(),
            "last_accessed": datetime.utcnow().isoformat(),
            "is_valid": True
        }

        session_key = RedisKeys.session_data(session_id)
        user_sessions_key = RedisKeys.user_sessions(user_id)

        # Store session and register it in user sessions set
        await self.redis.set_value(session_key, json.dumps(session_data), expire_seconds=self.session_expire_seconds)
        await self.redis.add_to_set(user_sessions_key, session_id)
        await self.redis.set_expiration(user_sessions_key, self.session_expire_seconds)

        return session_id

    async def get_session(self, session_id: str) -> Dict[str, Any]:
        session_key = RedisKeys.session_data(session_id)
        session_data_str = await self.redis.get_value(session_key)

        if not session_data_str:
            raise HTTPException(status_code=401, detail="Session not found")

        try:
            session_data = json.loads(session_data_str)
        except json.JSONDecodeError:
            raise HTTPException(status_code=401, detail="Corrupted session data")

        if not session_data.get("is_valid", False):
            raise HTTPException(status_code=401, detail="Session is invalid")

        return session_data

    async def update_session_access(self, session_id: str) -> bool:
        try:
            session_data = await self.get_session(session_id)
        except HTTPException:
            return False

        session_data["last_accessed"] = datetime.utcnow().isoformat()

        session_key = RedisKeys.session_data(session_id)
        await self.redis.set_value(session_key, json.dumps(session_data), expire_seconds=self.session_expire_seconds)

        return True

    async def invalidate_session(self, session_id: str) -> bool:
        session_data = await self.get_session(session_id)
        user_id = session_data.get("user_id","")

        session_key = RedisKeys.session_data(session_id)
        await self.redis.delete_key(session_key)
        
        cache_key = RedisKeys.user_onboarding_details(user_id)
        await self.redis.delete_key(cache_key)

        user_sessions_key = RedisKeys.user_sessions(session_data["user_id"])
        await self.redis.remove_from_set(user_sessions_key, session_id)

        return True

    async def invalidate_all_user_sessions(self, user_id: str) -> bool:
        user_sessions_key = RedisKeys.user_sessions(user_id)
        session_ids = await self.redis.get_set_members(user_sessions_key)

        cache_key = RedisKeys.user_onboarding_details(user_id)
        await self.redis.delete_key(cache_key)

        for session_id in session_ids:
            session_key = RedisKeys.session_data(session_id)
            await self.redis.delete_key(session_key)

        await self.redis.delete_key(user_sessions_key)

        return True

    async def get_user_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        user_sessions_key = RedisKeys.user_sessions(user_id)
        session_ids = await self.redis.get_set_members(user_sessions_key)

        sessions = []
        for session_id in session_ids:
            try:
                session_data = await self.get_session(session_id)
                session_data["session_id"] = session_id
                sessions.append(session_data)
            except HTTPException:
                continue  # Skip expired or corrupted session

        return sessions

    async def is_session_valid(self, session_id: str, user_id: str, ip: str) -> bool:
        try:
            error_data= None
            session_data = await self.get_session(session_id)
        except HTTPException:
            return False,error_data

        if user_id and session_data.get("user_id") != user_id:
            error_data = f"Invalid user id session_user_id :{session_data.get('user_id')} Given user_id:{user_id}"
            return False,error_data

        # if ip and session_data.get("ip") != ip:
        #     error_data = f"Invalid user ip Session ip:{session_data.get('ip')} Given ip:{ip}"
        #     return False,error_data

        await self.update_session_access(session_id)
        return True,error_data
