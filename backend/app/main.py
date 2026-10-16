import re
from datetime import datetime, timezone

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from . import models
from .agents import run_agents
from .config import CORS_ORIGINS
from .db import Base, engine, get_db
from .jobs import run_analysis
from .scoring import LABEL_METHOD, PREDICTION_TARGET, score_files

Base.metadata.create_all(engine)

app = FastAPI(title="Maintenance Copilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

GITHUB_URL = re.compile(r"^https://github\.com/[\w.-]+/[\w.-]+?(\.git)?/?$")
HIGH_RISK_THRESHOLD = 0.7


class CreateAnalysis(BaseModel):
    repo_url: str


def iso(dt: datetime) -> str:
    if dt.tzinfo is None:  # SQLite returns naive datetimes
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


def heuristic_score(value):
    return {
        "value": value,
        "method": "heuristic",
        "validated": False,
        "evaluation_ref": None,
        "confidence": None,
        "confidence_kind": None,
    }


def _finished_analysis(db: Session, analysis_id: str) -> models.Analysis:
    row = db.get(models.Analysis, analysis_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    if row.status not in ("completed", "partial"):
        raise HTTPException(status_code=409, detail=f"Analysis is not finished (status: {row.status}).")
    return row


def _scored_files(db: Session, analysis_id: str):
    rows = db.query(models.FileMetric).filter(models.FileMetric.analysis_id == analysis_id).all()
    return rows, score_files(rows)


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
        "agents": [],  # per-agent live progress is not tracked; empty is honest
        "error": row.error,
    }


@app.get("/api/analyses/{analysis_id}/summary")
def get_summary(analysis_id: str, db: Session = Depends(get_db)):
    row = _finished_analysis(db, analysis_id)
    files, scores = _scored_files(db, analysis_id)
    avg = round(sum(scores) / len(scores), 4) if scores else None
    return {
        "analysis_id": row.id,
        "status": row.status,
        "data_source": "live",
        "generated_at": iso(datetime.now(timezone.utc)),
        "provenance": {
            "repo": row.repo_url,
            "commit_sha": row.commit_sha or "unknown",
            "analyzed_at": iso(row.created_at),
            "counts": {
                "files": len(files),
                "modules": None,
                "commits": row.total_commits,
                "issues": None,
                "contributors": None,
            },
            "unavailable": {
                "modules": "not_computed",
                "issues": "not_collected",
                "contributors": "repo_total_not_computed",
            },
            "prediction_target": PREDICTION_TARGET,
            "label_method": LABEL_METHOD,
            "split": None,
        },
        "high_risk_files": sum(1 for s in scores if s >= HIGH_RISK_THRESHOLD),
        "avg_bug_risk": heuristic_score(avg),
        "avg_debt": None,
    }


@app.get("/api/analyses/{analysis_id}/files")
def get_files(analysis_id: str, db: Session = Depends(get_db)):
    _finished_analysis(db, analysis_id)
    files, scores = _scored_files(db, analysis_id)
    items = [
        {
            "path": f.path,
            "commits": f.commits,
            "churn": f.churn,
            "contributors": f.contributors,
            "bugfix_commits": f.bugfix_commits,
            "last_modified": iso(f.last_modified) if f.last_modified else None,
            "bug_risk": heuristic_score(s),
        }
        for f, s in zip(files, scores)
    ]
    items.sort(key=lambda x: x["bug_risk"]["value"], reverse=True)
    return {"analysis_id": analysis_id, "data_source": "live", "total": len(items), "items": items}


@app.get("/api/analyses/{analysis_id}/agents")
def get_agents(analysis_id: str, db: Session = Depends(get_db)):
    _finished_analysis(db, analysis_id)
    files, scores = _scored_files(db, analysis_id)
    return {
        "analysis_id": analysis_id,
        "data_source": "live",
        "generated_at": iso(datetime.now(timezone.utc)),
        **run_agents(files, scores),
    }