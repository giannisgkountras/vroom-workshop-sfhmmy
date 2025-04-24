from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


DATABASE_URL = "sqlite:///./workshop.db"

engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    pool_recycle=1800,
    max_overflow=30,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()
