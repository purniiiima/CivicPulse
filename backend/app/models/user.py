import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base
import enum


class UserRole(str, enum.Enum):
    CITIZEN = "CITIZEN"
    WORKER = "WORKER"
    ORGANIZATION_ADMIN = "ORGANIZATION_ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=True)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.CITIZEN, nullable=False)
    avatar_url: Mapped[str] = mapped_column(String(500), nullable=True)
    points: Mapped[int] = mapped_column(Integer, default=50)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization", back_populates="users", lazy="selectin")
    worker_profile = relationship("Worker", back_populates="user", uselist=False, lazy="selectin")
    reported_issues = relationship("Issue", foreign_keys="Issue.reporter_id", back_populates="reporter", lazy="selectin")
    comments = relationship("IssueComment", back_populates="user", lazy="selectin")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
