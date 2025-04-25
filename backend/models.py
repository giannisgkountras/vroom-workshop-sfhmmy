from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)


class CodeSubmission(Base):
    __tablename__ = "code_submissions"
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    time_to_run = Column(Integer, nullable=False)
