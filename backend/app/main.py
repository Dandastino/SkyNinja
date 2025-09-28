from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging
import structlog
from .config import settings
from .database import test_connection, engine, Base
from .models import * # Import all models to ensure they're registered
from .api import auth, flights, bookings, notifications

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting SkyNinja API")
    
    # Test database connection (already correctly awaited)
    if await test_connection():
        logger.info("Database connection successful")
    else:
        logger.error("Database connection failed")
        raise Exception("Database connection failed")
    
    # Create database tables
    try:
        # FIX: Use conn.run_sync() to execute the synchronous schema creation 
        # function (Base.metadata.create_all) on the AsyncEngine.
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        logger.info("Database tables created/verified")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        # The exception is now properly raised from the asynchronous block
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down SkyNinja API")


# Create FastAPI application
app = FastAPI(
    title="SkyNinja API",
    description="AI-powered flight search and booking platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.skyninja.com"]
)

# Include API routers
app.include_router(auth.router)
app.include_router(flights.router)
app.include_router(bookings.router)
app.include_router(notifications.router)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to SkyNinja API",
        "version": "1.0.0",
        "description": "AI-powered flight search and booking platform",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Test database connection - NOTE: This endpoint should ideally use the async version, 
        # but since this is not in the lifespan, it might be tolerable if the sync version 
        # doesn't block the event loop severely, but it's best practice to await it.
        # We will keep the sync call here for now, assuming the test_connection function 
        # is meant to be called asynchronously when it needs to run on the async engine.
        db_status = await test_connection() # 👈 Changed to AWAIT the async function
        
        return {
            "status": "healthy" if db_status else "unhealthy",
            "database": "connected" if db_status else "disconnected",
            "timestamp": "2024-01-01T00:00:00Z"  # Would use actual timestamp
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unavailable")


@app.get("/info")
async def api_info():
    """API information endpoint."""
    return {
        "name": "SkyNinja API",
        "version": "1.0.0",
        "description": "AI-powered flight search and booking platform",
        "features": [
            "Flight search with multi-region pricing",
            "AI-powered price prediction",
            "Real-time price tracking",
            "Secure booking system",
            "User notifications",
            "VPN integration for regional pricing"
        ],
        "endpoints": {
            "authentication": "/auth",
            "flights": "/flights",
            "bookings": "/bookings",
            "notifications": "/notifications"
        }
    }
