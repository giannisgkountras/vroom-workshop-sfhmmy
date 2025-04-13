from fastapi import FastAPI, HTTPException, Depends, status, Security
from fastapi.responses import JSONResponse
from pydantic import BaseModel, constr
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from jinja2 import Environment, FileSystemLoader
import time
import tempfile
import subprocess
import os
from models import Team, Base, CodeSubmission
from database import SessionLocal, engine
from sqlalchemy import func
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

# Set up Jinja2 environment and load the template from file
template_loader = FileSystemLoader(searchpath="./templates")
template_env = Environment(loader=template_loader)
template = template_env.get_template("template.py.j2")  # template file name


def get_api_key(api_key_header: str = Security(api_key_header)) -> str:
    if api_key_header in api_keys:
        return api_key_header
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing API Key"
    )


class RegisterRequest(BaseModel):
    teamName: str


class SubmitCodeRequest(BaseModel):
    teamID: str
    code: str  # Ensure the code is not empty


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


@app.post("/submit")
def submit_code(
    req: SubmitCodeRequest,
    db: Session = Depends(get_db),
    api_key: str = Security(get_api_key),
):
    # Check if the team exists
    current_team = db.query(Team).filter(Team.id == req.teamID).first()
    if not current_team:
        return JSONResponse(
            status_code=409,  # Conflict
            content={"status": "error", "message": "Team does not exist!"},
        )

    rendered_code = template.render(code=req.code)

    # 3. Save to temporary file
    with tempfile.NamedTemporaryFile(mode="w+", suffix=".py", delete=False) as temp:
        temp.write(rendered_code)
        temp.flush()
        temp_path = temp.name

    # 4. Time and run the script
    try:
        start_time = time.time()
        subprocess.run(
            ["python", temp_path],
            check=True,
            capture_output=True,
            timeout=10,  # seconds, prevent infinite loops
        )
        end_time = time.time()
    except subprocess.CalledProcessError as e:
        return JSONResponse(
            status_code=400,
            content={
                "status": "error",
                "message": f"Code execution failed: {e.stderr.decode()}",
            },
        )
    except subprocess.TimeoutExpired:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": "Code execution timed out"},
        )

    # 5. Save to DB
    duration = round(end_time - start_time, 3)
    # submission = CodeSubmission(team_id=req.teamID, code=req.code, time_to_run=duration)
    submission = CodeSubmission(team_id=req.teamID, time_to_run=duration)

    db.add(submission)
    db.commit()
    db.refresh(submission)

    return {
        "status": "success",
        "message": "Code submitted and executed successfully",
        "time_to_run": duration,
        "submission_id": submission.id,
    }


@app.get("/leaderboard")
def get_leaderboard(
    db: Session = Depends(get_db),
    api_key: str = Security(get_api_key),
):
    # Query for the fastest time for each team
    fastest_times = (
        db.query(
            Team.name.label("team_name"),
            func.min(CodeSubmission.time_to_run).label("fastest_time"),
        )
        .join(CodeSubmission, CodeSubmission.team_id == Team.id)
        .group_by(Team.id)  # Grouping by team_id to get the fastest time for each team
        .order_by("fastest_time")  # Ordering by fastest time (ascending)
        .all()
    )

    if not fastest_times:
        raise HTTPException(status_code=404, detail="No submissions found")

    # Return the result
    return {
        "status": "success",
        "leaderboard": [
            {"team_name": team_name, "fastest_time": fastest_time}
            for team_name, fastest_time in fastest_times
        ],
    }


@app.get("/leaderboard/{team_id}")
def get_team_fastest_time(
    team_id: int,
    db: Session = Depends(get_db),
    api_key: str = Security(get_api_key),
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    fastest_submission = (
        db.query(CodeSubmission)
        .filter(CodeSubmission.team_id == team_id)
        .order_by(CodeSubmission.time_to_run.asc())
        .first()
    )

    if not fastest_submission:
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "team_id": team_id,
                "team_name": team.name,
                "fastest_time": None,
                "message": "No submissions yet for this team.",
            },
        )

    return {
        "status": "success",
        "team_id": team_id,
        "team_name": team.name,
        "fastest_time": fastest_submission.time_to_run,
    }
