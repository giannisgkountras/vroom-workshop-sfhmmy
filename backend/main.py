from fastapi import FastAPI, HTTPException, Depends, status, Security
from fastapi.responses import JSONResponse
from pydantic import BaseModel, constr
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os
from models import Team, Base
from database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all domains
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

load_dotenv()
API_KEY = os.getenv("API_KEY")
api_keys = [API_KEY]
api_key_header = APIKeyHeader(name="X-API-Key")


def get_api_key(api_key_header: str = Security(api_key_header)) -> str:
    if api_key_header in api_keys:
        return api_key_header
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing API Key"
    )


class RegisterRequest(BaseModel):
    teamName: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.post("/register")
def register_team(
    req: RegisterRequest,
    db: Session = Depends(get_db),
    api_key: str = Security(get_api_key),
):
    # Check if team with the same name already exists
    existing_team = db.query(Team).filter(Team.name == req.teamName).first()
    if existing_team:
        return JSONResponse(
            status_code=409,  # Conflict
            content={"status": "error", "message": "Team name already exists!"},
        )

    new_team = Team(name=req.teamName)
    db.add(new_team)
    db.commit()
    db.refresh(new_team)

    return {
        "message": "Team created successfully",
        "team_name": new_team.name,
        "team_id": new_team.id,
        "status": "success",
    }


@app.post("/join")
def join_team(
    req: RegisterRequest,
    db: Session = Depends(get_db),
    api_key: str = Security(get_api_key),
):
    # check if the team exists
    existing_team = db.query(Team).filter(Team.name == req.teamName).first()
    if not existing_team:
        return JSONResponse(
            status_code=409,  # Conflict
            content={"status": "error", "message": "Team does not exist!"},
        )

    return {
        "message": "You have joined the team successfully",
        "team_name": existing_team.name,
        "team_id": existing_team.id,
        "status": "success",
    }
