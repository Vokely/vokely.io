from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()
MONGO_URI = os.getenv("MONGODB_URI")
# client = AsyncIOMotorClient(MONGO_URI)
POOL_SIZE = os.getenv("POOL_SIZE")

client = AsyncIOMotorClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000,  # Time to discover if server is reachable
    socketTimeoutMS=5000,  # Time to wait for response before giving up
    retryWrites=True,  # Mimics Atlas auto-retry
    maxPoolSize=POOL_SIZE,  # Connection pool size
)
db = client["genresume_db"]

async def get_database():
    """
    Get the MongoDB database instance.
    """
    global client
    if client is None:
        client = AsyncIOMotorClient(MONGO_URI)
    return db 

async def init_db(app: FastAPI):
    db = await get_database()

    coll_name = "token_usage"
    coll_list = await db.list_collection_names()

    if coll_name not in coll_list:
        try:
            await db.create_collection(
                coll_name,
                timeseries={
                    "timeField": "created_at",
                    "metaField": "meta",
                    "granularity": "seconds",
                },
            )
        except Exception:
            await db.create_collection(coll_name)

    token_usage = db[coll_name]

    # Indexes for fast analytics + summaries
    await token_usage.create_index(
        [("meta.user_id", 1), ("created_at", -1)],
        name="user_time_idx"
    )

    await token_usage.create_index(
        [("meta.module_id", 1)],
        name="module_idx"
    )

    await token_usage.create_index(
        [("meta.model", 1)],
        name="model_idx"
    )

    # Helps with user analytics
    await token_usage.create_index(
        [("created_at", -1)],
        name="created_at_idx"
    )
