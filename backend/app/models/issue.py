import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import String, Text, Float, Integer, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class IssueStatus(str, enum.Enum):
    REPORTED = "REPORTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class IssuePriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Issue(Base):
    __tablename__ = "issues"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tracking_number: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category_id: Mapped[str] = mapped_column(String(36), ForeignKey("issue_categories.id"), nullable=False)
    priority: Mapped[IssuePriority] = mapped_column(SQLEnum(IssuePriority), default=IssuePriority.MEDIUM, nullable=False)
    status: Mapped[IssueStatus] = mapped_column(SQLEnum(IssueStatus), default=IssueStatus.REPORTED, nullable=False)
    
    # Location
    address: Mapped[str] = mapped_column(String(300), nullable=False)
    landmark: Mapped[str] = mapped_column(String(150), nullable=True)
    ward: Mapped[str] = mapped_column(String(50), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Ownership & Organization
    reporter_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    assigned_worker_id: Mapped[str] = mapped_column(String(36), ForeignKey("workers.id", ondelete="SET NULL"), nullable=True)

    # Resolution & Verification
    resolution_notes: Mapped[str] = mapped_column(Text, nullable=True)
    resolution_rating: Mapped[int] = mapped_column(Integer, nullable=True)
    resolution_feedback: Mapped[str] = mapped_column(Text, nullable=True)
    upvotes_count: Mapped[int] = mapped_column(Integer, default=0)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    resolved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reported_issues", lazy="selectin")
    category = relationship("IssueCategory", back_populates="issues", lazy="selectin")
    organization = relationship("Organization", back_populates="issues", lazy="selectin")
    assigned_worker = relationship("Worker", back_populates="assigned_issues", lazy="selectin")
    
    assignments = relationship("IssueAssignment", back_populates="issue", cascade="all, delete-orphan", lazy="selectin")
    status_history = relationship("IssueStatusHistory", back_populates="issue", cascade="all, delete-orphan", order_by="IssueStatusHistory.created_at", lazy="selectin")
    comments = relationship("IssueComment", back_populates="issue", cascade="all, delete-orphan", order_by="IssueComment.created_at", lazy="selectin")
    attachments = relationship("IssueAttachment", back_populates="issue", cascade="all, delete-orphan", lazy="selectin")
    notifications = relationship("Notification", back_populates="issue", cascade="all, delete-orphan", lazy="selectin")
