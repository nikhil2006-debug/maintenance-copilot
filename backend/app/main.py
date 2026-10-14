import re
from datetime import datetime, timezone

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from . import models
from .config import CORS_ORIGINS
from .db import Base, engine, get_db
from .jobs import run_analysis

Base.metadata.create_all(engine)

app = FastAPI(title="Maintenance Copilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

GITHUB_URL = re.compile(r"^https://github\.com/[\w.-]+/[\w.-]+?(\.git)?/?$")


class CreateAnalysis(BaseModel):
    repo_url: str


def iso(dt: datetime) -> str:
    if dt.tzinfo is None:  # SQLite returns naive datetimes
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


@app.get("/api/health")
def health():
    return {"status": "ok", "data_source": "live"}


@app.post("/api/analyses")
def create_analysis(body: CreateAnalysis, tasks: BackgroundTasks, db: Session = Depends(get_db)):
    url = body.repo_url.strip()
    if not GITHUB_URL.match(url):
        raise HTTPException(status_code=422, detail="Only public https://github.com/owner/repo URLs are accepted.")
    row = models.Analysis(repo_url=url, status="queued", progress=0.0, stage="Queued")
    db.add(row)
    db.commit()
    tasks.add_task(run_analysis, row.id)
    return {"analysis_id": row.id, "status": row.status}


@app.get("/api/analyses/{analysis_id}")
def get_analysis(analysis_id: str, db: Session = Depends(get_db)):
    row = db.get(models.Analysis, analysis_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return {
        "analysis_id": row.id,
        "status": row.status,
        "data_source": "live",
        "generated_at": iso(datetime.now(timezone.utc)),
        "repo_url": row.repo_url,
        "progress": row.progress,
        "stage": row.stage,
        "agents": [],  # real agents arrive later; empty is honest
        "error": row.error,
    }