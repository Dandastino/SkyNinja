from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

import logging
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://travelease:password@localhost:5434/travelease")
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_connection():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            return True
    except Exception as e:
        logging.error(f"Database connection failed: {e}")

if __name__ == "__main__":
    test_connection()