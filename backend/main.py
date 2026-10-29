"""
UniVerse: An Intelligent, Sustainable, and Privacy-Aware Campus Ecosystem
Backend API Server (FastAPI + SQLite)
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from seed import seed_database
from routers.academic import router as academic_router
from routers.activities import router as activities_router
from routers.rides import router as rides_router
from routers.observatory import router as observatory_router
from routers.wellbeing import router as wellbeing_router
from routers.exam import router as exam_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed data idempotently on startup
    init_db()
    seed_database()
    yield

app = FastAPI(
    title="UniVerse Campus Ecosystem API",
    description="Backend services for Academic Hub, Ride-Pooling, Sustainable Computing, Digital Wellbeing, and Exam Monitoring",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(academic_router)
app.include_router(activities_router)
app.include_router(rides_router)
app.include_router(observatory_router)
app.include_router(wellbeing_router)
app.include_router(exam_router)

@app.get("/")
def read_root():
    return {
        "platform": "UniVerse Campus Ecosystem",
        "status": "online",
        "version": "1.0.0",
        "modules": [
            "A: Student Intelligence & Academic Hub (Active)",
            "B: Smart Campus Ride-Pooling (Active)",
            "C: Sustainable Computing Observatory (Active)",
            "D: Privacy-Aware Digital Wellbeing (Active)",
            "E: Responsible Examination Monitoring (Active)",
        ],
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "environment": "development",
        "database": "sqlite_local",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
