import uuid

from fastapi import APIRouter, Depends, File, Form, Query, Request, Response, UploadFile
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..db import get_session
from ..errors import ApiError
from ..models import ROLES, User
from ..security import (
    clear_login_cookie,
    create_token,
    current_user_id,
    hash_password,
    set_login_cookie,
    verify_password,
)
from ..serializers import user_brief, user_full
from ..uploads import UploadSession, file_url

router = APIRouter(prefix="/api/auth/user", tags=["user"])


def _blank(value: str | None) -> bool:
    return value is None or not value.strip()


@router.post("/register", status_code=201)
async def register(
    request: Request,
    fullName: str | None = Form(None),
    email: str | None = Form(None),
    phoneNumber: str | None = Form(None),
    password: str | None = Form(None),
    role: str | None = Form(None),
    file: UploadFile | None = File(None),
    session: AsyncSession = Depends(get_session),
):
    async with UploadSession() as uploads:
        photo = await uploads.save(file)

        if any(_blank(v) for v in (fullName, email, phoneNumber, password, role)):
            raise ApiError(400, "Missing: Required fields")
        if role not in ROLES:
            raise ApiError(400, "Role must be student or recruiter")

        existing = await session.scalar(select(User.id).where(User.email == email))
        if existing:
            raise ApiError(400, "User already exist")

        user = User(
            full_name=fullName,
            email=email,
            password=await hash_password(password),
            phone_number=phoneNumber,
            role=role,
        )
        if photo:
            user.profile_photo = file_url(request, photo)
        session.add(user)
        try:
            await session.commit()
        except IntegrityError:  # two signups with the same email at once
            await session.rollback()
            raise ApiError(400, "User already exist")

    return {"message": "Account created successfully!", "success": True}


class LoginBody(BaseModel):
    email: str | None = None
    password: str | None = None


@router.post("/login")
async def login(
    body: LoginBody,
    response: Response,
    session: AsyncSession = Depends(get_session),
):
    # the role is stored on the account at signup, so login does not ask for it
    if _blank(body.email) or _blank(body.password):
        raise ApiError(400, "Missing: Required fields")

    user = await session.scalar(select(User).where(User.email == body.email))
    if not user or not await verify_password(body.password, user.password):
        raise ApiError(400, "Incorect email or password.")

    set_login_cookie(response, create_token(user.id))
    return {
        "message": f"Welcome back {user.full_name}",
        "user": user_brief(user),
        "success": True,
    }


@router.get("/logout")
async def logout(response: Response):
    clear_login_cookie(response)
    return {"message": "User logged out successfully", "success": True}


@router.put("/profile/update-profile/{id}")
async def update_profile(
    id: str,
    request: Request,
    fullName: str | None = Form(None),
    email: str | None = Form(None),
    phoneNumber: str | None = Form(None),
    bio: str | None = Form(None),
    skills: str | None = Form(None),
    file: UploadFile | None = File(None),  # the resume
    profilePhoto: UploadFile | None = File(None),
    user_id: uuid.UUID = Depends(current_user_id),
    session: AsyncSession = Depends(get_session),
):
    async with UploadSession() as uploads:
        resume = await uploads.save(file)
        photo = await uploads.save(profilePhoto)

        # users may only edit their own profile
        if id != str(user_id):
            raise ApiError(403, "Not allowed to edit this profile")

        user = await session.get(User, user_id)
        if not user:
            raise ApiError(404, "User not found!")

        if fullName:
            user.full_name = fullName
        if email:
            user.email = email
        if phoneNumber:
            user.phone_number = phoneNumber
        if bio:
            user.bio = bio
        if skills:
            user.skills = [s.strip() for s in skills.split(",")]
        if resume:
            user.resume = file_url(request, resume)
            user.resume_original_name = resume.original_name
        if photo:
            user.profile_photo = file_url(request, photo)

        try:
            await session.commit()
        except IntegrityError:
            await session.rollback()
            raise ApiError(400, "That email is already in use")

    return {
        "message": "Profile updated successfully",
        "user": user_brief(user),
        "success": True,
    }


@router.get("/fetch-all-users")
async def get_all_users(
    role: str | None = Query(None),
    _: uuid.UUID = Depends(current_user_id),
    session: AsyncSession = Depends(get_session),
):
    query = select(User).options(selectinload(User.saved_links)).order_by(User.created_at)
    if role:
        query = query.where(User.role == role)
    users = (await session.scalars(query)).all()
    return {
        "message": "Users fetched successfully",
        "users": [user_full(u) for u in users],
        "success": True,
    }
