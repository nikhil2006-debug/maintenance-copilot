import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    repo_url: Mapped[str] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(20), default="queued")
    progress: Mapped[float | None] = mapped_column(Float, nullable=True)
    stage: Mapped[str | None] = mapped_column(String(200), nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    commit_sha: Mapped[str | None] = mapped_column(String(64), nullable=True)
    total_commits: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class FileMetric(Base):
    __tablename__ = "file_metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    analysis_id: Mapped[str] = mapped_column(ForeignKey("analyses.id"), index=True)
    path: Mapped[str] = mapped_column(String(1000))
    commits: Mapped[int] = mapped_column(Integer, default=0)
    churn: Mapped[int] = mapped_column(Integer, default=0)  # lines added + deleted
    contributors: Mapped[int] = mapped_column(Integer, default=0)
    bugfix_commits: Mapped[int] = mapped_column(Integer, default=0)
    last_modified: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Feedback(Base):
    __tablename__ = "feedback"
    __table_args__ = (UniqueConstraint("analysis_id", "path", name="uq_feedback_analysis_path"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    analysis_id: Mapped[str] = mapped_column(ForeignKey("analyses.id"), index=True)
    path: Mapped[str] = mapped_column(String(1000))
    verdict: Mapped[str] = mapped_column(String(20))  # "useful" | "not_useful"
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)



class MonthlyActivity(Base):
    __tablename__ = "monthly_activity"
    __table_args__ = (UniqueConstraint("analysis_id", "month", name="uq_monthly_analysis_month"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    analysis_id: Mapped[str] = mapped_column(ForeignKey("analyses.id"), index=True)
    month: Mapped[str] = mapped_column(String(7))  # "YYYY-MM"
    commits: Mapped[int] = mapped_column(Integer, default=0)  # commits touching source files
    bugfix_commits: Mapped[int] = mapped_column(Integer, default=0)