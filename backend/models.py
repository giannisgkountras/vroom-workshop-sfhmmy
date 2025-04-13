from sqlalchemy import Column, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Team(Base):
    __tablename__ = "teams"
    secret_key = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=True)
