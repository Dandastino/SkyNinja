from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession # 👈 NEW: Import async engine and session
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text # To use text() for simple queries
from .config import settings
import logging

# Create database engine
# 👇 CHANGE: Use create_async_engine for async driver
engine = create_async_engine(
    settings.database_url,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=300
)

# Create session factory
# 👇 CHANGE: Use AsyncSession for async operation
AsyncSessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine,
    class_=AsyncSession, # 👈 NEW: Specify the class as AsyncSession
    expire_on_commit=False,
)

# Create base class for models
Base = declarative_base()

# Dependency to get database session
# 👇 CHANGE: Function must be async and yield an AsyncSession
async def get_db():
    db = AsyncSessionLocal()
    try:
        yield db
    finally:
        # 👇 CHANGE: Asynchronous close operation
        await db.close()

# Test database connection
# 👇 CHANGE: Function must be async and use await
async def test_connection():
    try:
        # 👇 CHANGE: Use async with for connection
        async with engine.begin() as conn:
            # Execute a simple query asynchronously
            await conn.execute(text("SELECT 1"))
            logging.info("Database connection successful")
            return True
    except Exception as e:
        # NOTE: SQLAlchemy 2.0 async engines should throw a more helpful error now
        logging.error(f"Database connection failed: {e}")
        return False