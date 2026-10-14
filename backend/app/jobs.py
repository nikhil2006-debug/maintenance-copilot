import shutil

from .analyzer import clone_repo, extract_features
from .db import SessionLocal
from .models import Analysis, FileMetric


def _update(analysis_id: str, **fields) -> None:
    db = SessionLocal()
    try:
        row = db.get(Analysis, analysis_id)
        if row is None:
            return
        for key, value in fields.items():
            setattr(row, key, value)
        db.commit()
    finally:
        db.close()


def run_analysis(analysis_id: str) -> None:
    tmp = None
    try:
        db = SessionLocal()
        url = db.get(Analysis, analysis_id).repo_url
        db.close()

        _update(analysis_id, status="running", progress=0.1, stage="Cloning repository")
        repo, tmp = clone_repo(url)

        _update(analysis_id, progress=0.4, stage="Reading commit history")
        total, stats = extract_features(repo)
        if total == 0 or not stats:
            raise RuntimeError("Repository has no analyzable commit history.")

        _update(analysis_id, progress=0.8, stage="Saving file metrics")
        db = SessionLocal()
        try:
            db.add_all(
                FileMetric(
                    analysis_id=analysis_id,
                    path=path,
                    commits=s["commits"],
                    churn=s["churn"],
                    contributors=len(s["authors"]),
                    bugfix_commits=s["bugfix"],
                    last_modified=s["last"],
                )
                for path, s in stats.items()
            )
            row = db.get(Analysis, analysis_id)
            row.commit_sha = repo.head.commit.hexsha
            row.total_commits = total
            db.commit()
        finally:
            db.close()

        _update(analysis_id, status="completed", progress=1.0, stage="Features extracted")
    except Exception as exc:
        _update(analysis_id, status="failed", progress=None, stage="Failed", error=f"{type(exc).__name__}: {exc}")
    finally:
        if tmp:
            shutil.rmtree(tmp, ignore_errors=True)