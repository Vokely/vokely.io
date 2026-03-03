from fastapi import FastAPI, Depends, Request, status 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi.errors import RateLimitExceeded

import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager

#utils
from db.config import get_database, init_db
from services.redis_client import RedisClient
from utils.logger import logger
from starlette.exceptions import HTTPException as StarletteHTTPException
#routers
from routers import resume_generator, user_router, ai_interviewer, resume_router, profile_router, password_router, roadmap_router
from routers import external_links, public_router, onboard_router, skillgap_router, ratings_router, ats_checker, token_usage_router
#services
from services.session_service import SessionService
#middlwares
from middleware.authorize import verify_token, verify_admin_access 
from middleware.verify_csrf import VerifyCSRFMiddleware
from middleware.set_cookie import SetAuthCookieMiddleware

allowed_origins = ["http://localhost:3000","https://app.vokely.io","https://www.vokely.io","https://vokely.io","https://app.staging.vokely.io","https://staging.vokely.io"]
load_dotenv()

API_VERSION = os.getenv("CURRENT_API_VERSION")
app = FastAPI()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect MongoDB
    app.mongodb = await get_database()
    await init_db(app)
    logger.info("Connected to MongoDB Atlas!")

    # Connect Redis
    app.redis = RedisClient()
    await app.redis.connect()
    app.session_service = SessionService(app.redis)

    yield
    # Cleanup on shutdown
    app.mongodb.client.close()
    logger.info("MongoDB connection closed!")

    await app.redis.disconnect()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(VerifyCSRFMiddleware)
app.add_middleware(SetAuthCookieMiddleware)

# Include user_router **without authentication**
app.include_router(user_router.router, prefix="/app/api/auth",tags=["Authentication"])
app.include_router(public_router.router, prefix="/app/api/public",tags=["Public routes"])
app.include_router(password_router.router, prefix="/app/api/password", tags=["Password Reset"])

#Admin Routes
app.include_router(token_usage_router.router, prefix="/app/api/internal/token-usage", dependencies=[Depends(verify_admin_access)],tags=["Token Usage"])

#Protected Routes
app.include_router(onboard_router.router, prefix="/app/api/onboard", dependencies=[Depends(verify_token)],tags=["OnBoarding"])
app.include_router(profile_router.router, prefix="/app/api", dependencies=[Depends(verify_token)],tags=["Profile"])
app.include_router(resume_generator.router, prefix="/app/api", dependencies=[Depends(verify_token)])
app.include_router(ai_interviewer.router, prefix="/app/api/interview", dependencies=[Depends(verify_token)],tags=["Interview"])
app.include_router(resume_router.router, prefix="/app/api/resumes", dependencies=[Depends(verify_token)],tags=["Resume CRUD"])
app.include_router(external_links.router, prefix="/app/api/external-links",dependencies=[Depends(verify_token)],tags=["External Links"])
app.include_router(roadmap_router.router, prefix="/app/api/roadmap", dependencies=[Depends(verify_token)],tags=["Roadmap"])
app.include_router(skillgap_router.router, prefix="/app/api/skillgap", dependencies=[Depends(verify_token)],tags=["Skill Gap Analysis"])
app.include_router(ats_checker.router, prefix="/app/api/ats-checker", dependencies=[Depends(verify_token)],tags=["ATS Checker"])
app.include_router(ratings_router.router, prefix="/app/api/rating", dependencies=[Depends(verify_token)],tags=["User Rating"])

@app.get("/app/api")
def read_root():
    """Root endpoint."""
    return {"message": "Welcome to the Vokely API"}
