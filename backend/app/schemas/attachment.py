from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserResponse


class AttachmentCreate(BaseModel):
    file_url: str
    file_type: str = "image/jpeg"
    stage: str = "REPORTED"


class AttachmentResponse(BaseModel):
    id: str
    issue_id: str
    user_id: str
    file_url: str
    file_type: str
    stage: str
    created_at: datetime
    uploaded_by: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
