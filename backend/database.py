import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Use persistent database path if running in Docker, otherwise local
if os.path.exists("/app/db"):
    DATABASE_URL = "sqlite:////app/db/maps.db"
else:
    DATABASE_URL = "sqlite:///./maps.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()