from fastapi import FastAPI, HTTPException, Depends, status, Security
from pydantic import BaseModel, constr
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os
from models import Team
from database import SessionLocal
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
    secretKey: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/register")
def register_team(
    req: RegisterRequest,
    db: Session = Depends(get_db),
    api_key: str = Security(get_api_key),
):
    team = db.query(Team).filter(Team.secret_key == req.secretKey).first()
    if not team:
        raise HTTPException(
            status_code=404, detail="Team with the provided secret key was not found"
        )

    team.name = req.teamName
    db.commit()
    db.refresh(team)
    return {
        "message": "Team name updated successfully",
        "status": "success",
    }
