import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base
from app.models.issue import IssueStatus


class IssueStatusHistory(Base):
    __tablename__ = "issue_status_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    issue_id: Mapped[str] = mapped_column(String(36), ForeignKey("issues.id", ondelete="CASCADE"), nullable=False)
    old_status: Mapped[IssueStatus] = mapped_column(SQLEnum(IssueStatus), nullable=True)
    new_status: Mapped[IssueStatus] = mapped_column(SQLEnum(IssueStatus), nullable=False)
    changed_by_user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    issue = relationship("Issue", back_populates="status_history", lazy="selectin")
    changed_by = relationship("User", lazy="selectin")
