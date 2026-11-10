import uuid
from typing import Any

from fastapi import APIRouter, Body, Depends
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..db import get_session
from ..errors import ApiError
from ..helpers import parse_uuid
from ..models import APPLICATION_STATUSES, Application, Job, User
from ..security import current_user_id
from ..serializers import application_out, job_out

router = APIRouter(prefix="/api/application", tags=["application"])


@router.get("/apply/{id}", status_code=201)
async def apply_job(
    id: str,
    user_id: uuid.UUID = Depends(current_user_id),
    session: AsyncSession = Depends(get_session),
):
    job_id = parse_uuid(id)

    if job_id and await session.scalar(
        select(Application.id).where(
            Application.job_id == job_id, Application.applicant_id == user_id
        )
    ):
        raise ApiError(400, "You've already applied for this job")

    if not job_id or not await session.scalar(select(Job.id).where(Job.id == job_id)):
        raise ApiError(404, "Job not found!")

    # recruiters cannot apply, and a student must have a resume on file
    applicant = await session.get(User, user_id)
    if not applicant or applicant.role != "student":
        raise ApiError(403, "Only job seekers can apply for jobs")
    if not applicant.resume:
        raise ApiError(
            400, "Please upload your resume before applying", needsResume=True
        )

    session.add(Application(job_id=job_id, applicant_id=user_id))
    try:
        await session.commit()
    except IntegrityError:  # double click: the unique constraint caught it
        await session.rollback()
        raise ApiError(400, "You've already applied for this job")

    return {"message": "Job applied successfully!", "success": True}


@router.get("/applied-job")
async def get_applied_jobs(
    user_id: uuid.UUID = Depends(current_user_id),
    session: AsyncSession = Depends(get_session),
):
    applications = (
        await session.scalars(
            select(Application)
            .where(Application.applicant_id == user_id)
            .options(
                selectinload(Application.job).options(
                    selectinload(Job.company), selectinload(Job.applications)
                )
            )
            .order_by(Application.created_at.desc())
        )
    ).all()
    return {
        "message": "Application retreived successfully",
        "application": [
            application_out(a, job=job_out(a.job, populate_company=True))
            for a in applications
        ],
        "success": True,
    }


@router.get("/applicants/{id}")
async def get_applicants(
    id: str,
    user_id: uuid.UUID = Depends(current_user_id),
    session: AsyncSession = Depends(get_session),
):
    job_id = parse_uuid(id)
    job = (
        await session.scalar(
            select(Job)
            .where(Job.id == job_id)
            .options(selectinload(Job.applications).selectinload(Application.applicant))
        )
        if job_id
        else None
    )
    if not job:
        raise ApiError(404, "Job not found")

    # only the recruiter who posted the job may see its applicants
    if job.created_by != user_id:
        raise ApiError(403, "Not allowed to view applicants of this job")

    job.applications.sort(key=lambda a: a.created_at, reverse=True)
    return {
        "message": "Applicants fetched successfully.",
        "job": job_out(job, applications="with_applicant"),
        "success": True,
    }


@router.post("/update-status/{id}")
async def update_status(
    id: str,
    body: dict[str, Any] = Body(default={}),
    user_id: uuid.UUID = Depends(current_user_id),
    session: AsyncSession = Depends(get_session),
):
    status = body.get("status")
    if not status:
        raise ApiError(400, "Status is required")

    new_status = str(status).upper()
    if new_status not in APPLICATION_STATUSES:
        raise ApiError(400, "Invalid status")

    application_id = parse_uuid(id)
    application = (
        await session.scalar(
            select(Application)
            .where(Application.id == application_id)
            .options(selectinload(Application.job))
        )
        if application_id
        else None
    )
    if not application:
        raise ApiError(400, "Application not found")

    # only the recruiter who posted the job may change its applications
    if application.job.created_by != user_id:
        raise ApiError(403, "Not allowed to update this application")

    application.status = new_status
    await session.commit()
    return {"message": "Status updated successsfully!", "success": True}
