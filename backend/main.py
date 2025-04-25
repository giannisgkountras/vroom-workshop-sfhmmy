from fastapi import FastAPI, HTTPException, Depends, status, Security
from fastapi.responses import JSONResponse
from pydantic import BaseModel, constr
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from jinja2 import Environment, FileSystemLoader
import time
import tempfile
import subprocess
import asyncio
import os
from models import Team, Base, CodeSubmission
import traceback
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
ADMIN_KEY = os.getenv("ADMIN_KEY")
api_keys = [API_KEY, ADMIN_KEY]
admin_api_keys = [ADMIN_KEY]
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


def get_admin_api_key(api_key_header: str = Security(api_key_header)) -> str:
    if api_key_header in admin_api_keys:
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


async def run_code_async(code_path, timeout=60):  # timeout in seconds
    process = await asyncio.create_subprocess_exec(
        "python",
        code_path,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    try:
        stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=timeout)
    except asyncio.TimeoutError:
        process.kill()
        await process.wait()
        raise TimeoutError(
            f"Execution of {code_path} timed out after {timeout} seconds"
        )

    if process.returncode != 0:
        raise RuntimeError(stderr.decode())

    return stdout.decode(), stderr.decode()


@app.post("/submit")
async def submit_code(
    req: SubmitCodeRequest,
    db: Session = Depends(get_db),
    api_key: str = Security(get_api_key),
):
    try:
        # 1. Check if the team exists
        current_team = db.query(Team).filter(Team.id == req.teamID).first()
        if not current_team:
            return JSONResponse(
                status_code=409,
                content={"status": "error", "message": "Team does not exist!"},
            )

        # 2. Render & write code to temp file
        rendered_code = template.render(code=req.code)
        with tempfile.NamedTemporaryFile(mode="w+", suffix=".py", delete=False) as temp:
            temp.write(rendered_code)
            temp_path = temp.name

        # 3. Run asynchronously
        start_time = time.time()
        result_stdout, result_stderr = await run_code_async(temp_path)
        end_time = time.time()

        # 4. Persist to DB
        duration = round(end_time - start_time, 3)
        submission = CodeSubmission(team_id=req.teamID, time_to_run=duration)
        db.add(submission)
        db.commit()
        db.refresh(submission)

        # 5. Read image if present
        image_path = f"/tmp/{os.path.basename(temp_path)}.txt"
        image_data = b""
        if os.path.exists(image_path):
            image_data = open(image_path, "rb").read()

        return {
            "status": "success",
            "time_to_run": duration,
            "submission_id": submission.id,
            "output": result_stdout,
            "image": image_data.decode("latin1") if image_data else "",
        }

    except HTTPException as he:
        # rethrow FastAPI HTTPExceptions
        raise he

    except Exception as e:
        # catch everything else, include full traceback
        tb = traceback.format_exc()
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e), "traceback": tb},
        )


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


@app.get("/submissions/")
def read_submissions(
    db: Session = Depends(get_db), api_key: str = Security(get_admin_api_key)
):
    submissions = db.query(CodeSubmission).all()
    # reverse the order of submissions
    submissions.reverse()
    if not submissions:
        raise HTTPException(status_code=404, detail="No submissions found")
    return submissions


@app.delete("/submissions/{submission_id}")
def delete_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    api_key: str = Security(get_admin_api_key),
):
    submission = (
        db.query(CodeSubmission).filter(CodeSubmission.id == submission_id).first()
    )
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    db.delete(submission)
    db.commit()

    return {"status": "success", "message": "Submission deleted successfully"}


@app.get("/teams/")
def read_teams(
    db: Session = Depends(get_db), api_key: str = Security(get_admin_api_key)
):
    teams = db.query(Team).all()
    if not teams:
        raise HTTPException(status_code=404, detail="No teams found")
    return teams


@app.delete("/teams/{team_id}")
def delete_team(
    team_id: int,
    db: Session = Depends(get_db),
    api_key: str = Security(get_admin_api_key),
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    db.delete(team)
    db.commit()

    return {"status": "success", "message": "Team deleted successfully"}
