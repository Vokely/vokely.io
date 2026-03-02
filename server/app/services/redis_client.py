# utils/redis_client.py
from redis.asyncio import Redis
from typing import Optional, Any, List, Union
from utils.logger import logger

class RedisClient:
    def __init__(self, host: str = "localhost", port: int = 6379, db: int = 0):
        self._host = host
        self._port = port
        self._db = db
        self._redis: Optional[Redis] = None

    async def connect(self):
        """Establish connection to Redis."""
        self._redis = Redis(host=self._host, port=self._port, db=self._db, decode_responses=True)
        try:
            await self._redis.ping()
            logger.info("Connected to Redis.")
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")
            self._redis = None

    async def disconnect(self):
        """Close the Redis connection."""
        if self._redis:
            await self._redis.close()
            logger.info("Redis connection closed.")

    async def set_value(self, key: str, value: Any, expire_seconds: Optional[int] = None) -> bool:
        """Set a key with optional expiration."""
        self._ensure_connection()
        return await self._redis.set(name=key, value=value, ex=expire_seconds)

    async def get_value(self, key: str) -> Optional[str]:
        """Get value of a key."""
        self._ensure_connection()
        return await self._redis.get(name=key)

    async def delete_key(self, key: str) -> int:
        """Delete a key."""
        self._ensure_connection()
        return await self._redis.delete(key)

    async def key_exists(self, key: str) -> bool:
        """Check if a key exists."""
        self._ensure_connection()
        return bool(await self._redis.exists(key))

    async def set_expiration(self, key: str, seconds: int) -> bool:
        """Set expiration for a key."""
        self._ensure_connection()
        return await self._redis.expire(name=key, time=seconds)

    # --------------------- SET OPERATIONS --------------------- #

    async def add_to_set(self, key: str, *values: Any) -> int:
        """Add one or more values to a Redis set."""
        self._ensure_connection()
        return await self._redis.sadd(key, *values)

    async def get_set_members(self, key: str) -> List[str]:
        """Get all members of a Redis set."""
        self._ensure_connection()
        return list(await self._redis.smembers(key))

    async def is_member_of_set(self, key: str, value: Any) -> bool:
        """Check if a value is in a set."""
        self._ensure_connection()
        return await self._redis.sismember(key, value)
        
    async def remove_from_set(self, key: str, *values: Any) -> int:
        self._ensure_connection()
        return await self._redis.srem(key, *values)

    # --------------------- LIST OPERATIONS --------------------- #

    async def push_to_list(self, key: str, *values: Any, left: bool = True) -> int:
        """Push one or more values to a Redis list (left or right)."""
        self._ensure_connection()
        if left:
            return await self._redis.lpush(key, *values)
        return await self._redis.rpush(key, *values)

    async def pop_from_list(self, key: str, left: bool = True) -> Optional[str]:
        """Pop a value from a Redis list (left or right)."""
        self._ensure_connection()
        return await (self._redis.lpop(key) if left else self._redis.rpop(key))

    async def get_list_range(self, key: str, start: int = 0, end: int = -1) -> List[str]:
        """Get a range of elements from a Redis list."""
        self._ensure_connection()
        return await self._redis.lrange(key, start, end)

    # --------------------- HELPER --------------------- #

    def _ensure_connection(self):
        if not self._redis:
            raise RuntimeError("Redis connection is not initialized.")
