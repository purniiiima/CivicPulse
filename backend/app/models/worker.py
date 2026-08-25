import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Integer, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base
import enum


class WorkerStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ON_JOB = "ON_JOB"
    OFF_DUTY = "OFF_DUTY"
    MAINTENANCE = "MAINTENANCE"


class Worker(Base):
    __tablename__ = "workers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    employee_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    specialization: Mapped[str] = mapped_column(String(150), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=5.0)
    completed_jobs: Mapped[int] = mapped_column(Integer, default=0)
    active_issues_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[WorkerStatus] = mapped_column(SQLEnum(WorkerStatus), default=WorkerStatus.AVAILABLE, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="worker_profile", lazy="selectin")
    organization = relationship("Organization", back_populates="workers", lazy="selectin")
    assigned_issues = relationship("Issue", back_populates="assigned_worker", lazy="selectin")
    assignments = relationship("IssueAssignment", back_populates="worker", lazy="selectin")
