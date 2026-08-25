from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.services.auth_service import AuthService
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    CitizenRegisterRequest,
    WorkerRegisterRequest,
    Token,
)
from app.schemas.user import UserResponse
from app.schemas.common import MessageResponse
from app.core.dependencies import get_current_user, get_optional_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(reg_data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Public self-registration (Strictly creates Citizen accounts)."""
    service = AuthService(db)
    return await service.register_user(reg_data)


@router.post("/register/citizen", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_citizen(reg_data: CitizenRegisterRequest, db: AsyncSession = Depends(get_db)):
    """Public citizen self-registration."""
    service = AuthService(db)
    return await service.register_citizen(reg_data)


@router.post("/register/worker", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_worker(reg_data: WorkerRegisterRequest, db: AsyncSession = Depends(get_db)):
    """Public worker self-registration."""
    service = AuthService(db)
    return await service.register_worker(reg_data)


@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with email and password to receive a verified JWT access token."""
    service = AuthService(db)
    return await service.authenticate_user(login_data)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile and database role."""
    return current_user


@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: Optional[User] = Depends(get_optional_current_user)):
    """Invalidate client session token."""
    return MessageResponse(message="Successfully logged out of CivicPulse.")
