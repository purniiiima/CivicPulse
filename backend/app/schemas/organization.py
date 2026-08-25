from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class OrganizationBase(BaseModel):
    name: str
    slug: str
    department_type: str
    contact_email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationResponse(OrganizationBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
