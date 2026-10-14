import time

from .db import SessionLocal
from .models import Analysis


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
    """STUB. The real clone and feature extraction come in Part 3."""
    try:
        _update(analysis_id, status="running", progress=0.1, stage="Stub: starting")
        time.sleep(2)
        _update(analysis_id, progress=0.5, stage="Stub: pretending to work")
        time.sleep(2)
        _update(
            analysis_id,
            status="failed",
            progress=None,
            stage="Stub finished",
            error="Real analysis is not implemented yet (stub job).",
        )
    except Exception as exc:  # never leave a job stuck in "running"
        _update(analysis_id, status="failed", error=f"Unexpected error: {exc}")