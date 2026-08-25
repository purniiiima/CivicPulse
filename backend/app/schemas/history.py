from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.issue import IssueStatus
from app.schemas.user import UserResponse


class StatusUpdateRequest(BaseModel):
    new_status: IssueStatus
    notes: Optional[str] = None
    resolution_notes: Optional[str] = None


class StatusHistoryResponse(BaseModel):
    id: str
    issue_id: str
    old_status: Optional[IssueStatus] = None
    new_status: IssueStatus
    changed_by_user_id: str
    notes: Optional[str] = None
    created_at: datetime
    changed_by: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
