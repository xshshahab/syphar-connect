import uuid

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_session
from ..errors import ApiError
from ..helpers import parse_uuid
from ..models import Company
from ..security import current_user_id
from ..serializers import company_out
from ..uploads import UploadSession, file_url

router = APIRouter(prefix="/api/v1", tags=["company"])


class RegisterCompanyBody(BaseModel):
    companyName: str | None = None
    description: str | None = None
    website: str | None = None
    location: str | None = None
    logo: str | None = None


@router.post("/register-company", status_code=201)
async def register_company(
    body: RegisterCompanyBody,
    user_id: uuid.UUID = Depends(current_user_id),
    session: AsyncSession = Depends(get_session),
):
    if not body.companyName:
        raise ApiError(400, "Company name is required")

    name = body.companyName.strip()
    if await session.scalar(select(Company.id).where(Company.name == name)):
        raise ApiError(400, "You can't register the same company again")

    website = (body.website or "").strip()
    if website and await session.scalar(
        select(Company.id).where(Company.website == website)
    ):
        raise ApiError(400, "This website is already registered for another company")

    company = Company(
        name=name,
        description=(body.description or "").strip(),
        website=website or None,
        location=(body.location or "").strip(),
        logo=body.logo or "",
        user_id=user_id,
    )
    session.add(company)
    try:
        await session.commit()
    except IntegrityError:  # two requests with the same name at once
        await session.rollback()
        raise ApiError(400, "You can't register the same company again")

    return {
        "message": "Company registered successfully.",
        "company": company_out(company),
        "success": True,
    }


@router.get("/companies")
async def get_all_company(
    user_id: uuid.UUID = Depends(current_user_id),
    session: AsyncSession = Depends(get_session),
):
    companies = (
        await session.scalars(
            select(Company).where(Company.user_id == user_id).order_by(Company.created_at)
        )
    ).all()
    if not companies:
        raise ApiError(404, "No companies found for this user.")
    return {
        "message": "All companies retrieved successfully.",
        "companies": [company_out(c) for c in companies],
        "success": True,
    }


@router.get("/company/{id}")
async def get_company_by_id(
    id: str,
    user_id: uuid.UUID = Depends(current_user_id),
    session: AsyncSession = Depends(get_session),
):
    company_id = parse_uuid(id)
    company = await session.get(Company, company_id) if company_id else None
    if not company:
        raise ApiError(404, "Company not found!")
    # only the recruiter who registered the company may open it
    if company.user_id != user_id:
        raise ApiError(403, "Not allowed to access this company")
    return {
        "message": f"Company found by id: {id}",
        "company": company_out(company),
        "success": True,
    }


@router.put("/company/update-company/{id}")
async def update_company(
    id: str,
    request: Request,
    name: str | None = Form(None),
    description: str | None = Form(None),
    website: str | None = Form(None),
    location: str | None = Form(None),
    file: UploadFile | None = File(None),
    user_id: uuid.UUID = Depends(current_user_id),
    session: AsyncSession = Depends(get_session),
):
    async with UploadSession() as uploads:
        logo = await uploads.save(file)

        company_id = parse_uuid(id)
        company = await session.get(Company, company_id) if company_id else None
        # only the owner can change a company
        if not company or company.user_id != user_id:
            raise ApiError(404, "Company not found!")

        if name is not None:
            company.name = name
        if description is not None:
            company.description = description
        if website is not None:
            company.website = website
        if location is not None:
            company.location = location
        if logo:
            company.logo = file_url(request, logo)

        try:
            await session.commit()
        except IntegrityError:
            await session.rollback()
            raise ApiError(400, "A company with that name already exists")

    return {"message": "Company Information updated", "success": True}


@router.delete("/company/delete/{id}")
async def delete_company(
    id: str,
    user_id: uuid.UUID = Depends(current_user_id),
    session: AsyncSession = Depends(get_session),
):
    company_id = parse_uuid(id)
    company = await session.get(Company, company_id) if company_id else None
    if not company or company.user_id != user_id:
        raise ApiError(404, "Company not found!")

    await session.delete(company)
    await session.commit()
    return {"message": "Company deleted successfully", "success": True}
