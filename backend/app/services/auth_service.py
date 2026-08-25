from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.exceptions import UnauthorizedException, ValidationException
from app.models.user import User, UserRole
from app.models.worker import Worker, WorkerStatus
from app.repositories.user_repository import UserRepository
from app.repositories.worker_repository import WorkerRepository
from app.repositories.organization_repository import OrganizationRepository
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    CitizenRegisterRequest,
    WorkerRegisterRequest,
    Token,
)


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.worker_repo = WorkerRepository(db)
        self.org_repo = OrganizationRepository(db)

    async def authenticate_user(self, login_data: LoginRequest) -> Token:
        user = await self.user_repo.get_by_email(login_data.email)
        if not user or not verify_password(login_data.password, user.hashed_password):
            raise UnauthorizedException("Invalid email address or password.")
        
        if not user.is_active:
            raise UnauthorizedException("Account is currently disabled. Please contact administrator.")

        token = create_access_token(
            subject=user.id,
            role=user.role.value,
            organization_id=user.organization_id
        )

        return Token(
            access_token=token,
            token_type="bearer",
            expires_in=86400,
            user_id=user.id,
            role=user.role,
            full_name=user.full_name,
            email=user.email
        )

    async def register_citizen(self, reg_data: CitizenRegisterRequest) -> Token:
        existing = await self.user_repo.get_by_email(reg_data.email)
        if existing:
            raise ValidationException(f"An account with email '{reg_data.email}' already exists.")

        user = User(
            email=reg_data.email.lower().strip(),
            hashed_password=get_password_hash(reg_data.password),
            full_name=reg_data.full_name.strip(),
            phone=reg_data.phone,
            role=UserRole.CITIZEN,  # Strictly enforce CITIZEN role
        )
        created_user = await self.user_repo.create(user)

        token = create_access_token(
            subject=created_user.id,
            role=created_user.role.value,
            organization_id=created_user.organization_id
        )

        return Token(
            access_token=token,
            token_type="bearer",
            expires_in=86400,
            user_id=created_user.id,
            role=created_user.role,
            full_name=created_user.full_name,
            email=created_user.email
        )

    async def register_worker(self, reg_data: WorkerRegisterRequest) -> Token:
        existing = await self.user_repo.get_by_email(reg_data.email)
        if existing:
            raise ValidationException(f"An account with email '{reg_data.email}' already exists.")

        org_id = reg_data.organization_id
        if not org_id:
            orgs = await self.org_repo.get_all(limit=1)
            if orgs:
                org_id = orgs[0].id

        user = User(
            email=reg_data.email.lower().strip(),
            hashed_password=get_password_hash(reg_data.password),
            full_name=reg_data.full_name.strip(),
            phone=reg_data.phone or "",
            role=UserRole.WORKER,
            organization_id=org_id
        )
        created_user = await self.user_repo.create(user)

        emp_code = f"WK-{int(datetime.now(timezone.utc).timestamp()) % 100000:05d}"
        spec = reg_data.specialization or "Municipal Field Specialist"
        dept = spec

        worker = Worker(
            user_id=created_user.id,
            organization_id=org_id or created_user.id,
            employee_code=emp_code,
            specialization=spec,
            department=dept,
            phone=reg_data.phone or "",
            status=WorkerStatus.AVAILABLE,
            rating=5.0,
            completed_jobs=0,
            active_issues_count=0
        )
        await self.worker_repo.create(worker)

        token = create_access_token(
            subject=created_user.id,
            role=created_user.role.value,
            organization_id=created_user.organization_id
        )

        return Token(
            access_token=token,
            token_type="bearer",
            expires_in=86400,
            user_id=created_user.id,
            role=created_user.role,
            full_name=created_user.full_name,
            email=created_user.email
        )

    async def register_user(self, reg_data: RegisterRequest) -> Token:
        # Default public register falls back to citizen
        return await self.register_citizen(
            CitizenRegisterRequest(
                email=reg_data.email,
                password=reg_data.password,
                full_name=reg_data.full_name,
                phone=reg_data.phone,
            )
        )
