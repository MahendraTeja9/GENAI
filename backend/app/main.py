from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import create_tables
from .config import settings
from .api import auth, jobs, applications, companies, users
import os

# Create FastAPI app
app = FastAPI(
    title="GenAI Hiring System",
    description="AI-Powered Candidate Shortlisting System",
    version="1.0.0",
    debug=settings.debug
)

# Configure CORS
origins = [
    settings.react_app_api_url.replace(str(settings.api_port), str(settings.react_app_port)),
    f"http://{settings.react_app_host}:{settings.react_app_port}",
    f"http://127.0.0.1:{settings.react_app_port}",
    f"http://{settings.api_host}:{settings.react_app_port}",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Create upload directory
os.makedirs(settings.upload_dir, exist_ok=True)

# Mount static files for resume uploads
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(companies.router, prefix="/api/companies", tags=["Companies"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "GenAI Hiring System API",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug
    )
