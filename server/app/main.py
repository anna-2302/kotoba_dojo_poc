"""
Main FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import decks, cards, tags, settings as settings_api, import_api, stats

# Import review API from root level (will be refactored to app.api later)
import sys
import os
# Add parent directory to path to import root-level modules
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

try:
    from api_review import router as review_router
except ImportError as e:
    print(f"⚠️  Warning: Could not import review API: {e}")
    print(f"   Review endpoints will not be available.")
    review_router = None

# Create FastAPI app
app = FastAPI(
    title="Kotoba Dojo API",
    description="Spaced-repetition flashcard app for Japanese learning",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "Kotoba Dojo API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    """Health check for monitoring."""
    return {"status": "healthy"}


# Include API routers
app.include_router(decks.router, prefix="/api/decks", tags=["decks"])
app.include_router(cards.router, prefix="/api/cards", tags=["cards"])
app.include_router(tags.router, prefix="/api/tags", tags=["tags"])
app.include_router(settings_api.router, prefix="/api/settings", tags=["settings"])
app.include_router(import_api.router, prefix="/api/import", tags=["import"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])

# Include review router if successfully imported
if review_router is not None:
    app.include_router(review_router, prefix="/api/review", tags=["review"])
