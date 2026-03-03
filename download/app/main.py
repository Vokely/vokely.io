from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import job_scraper, downloads
import os
from dotenv import load_dotenv
import uvicorn

allowed_origins = ["http://localhost:3000", "http://localhost:8000"]
load_dotenv()

API_VERSION = os.getenv("CURRENT_API_VERSION") 
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

app.include_router(job_scraper.router, prefix="/app/api")
app.include_router(downloads.router, prefix="/app/api")

@app.get("/app/api/play")
def read_root():
    """Root endpoint."""
    return {"message": "Welcome to the playwright API"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)