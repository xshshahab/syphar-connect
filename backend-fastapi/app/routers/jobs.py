import re
import uuid
from typing import Any

from fastapi import APIRouter, Body, Depends, Query
from sqlalchemy import and_, func, or_, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.orm.attributes import set_committed_value

from ..db import get_session
from ..errors import ApiError
from ..helpers import falsy, parse_uuid, to_number
from ..models import Application, Job, SavedJob
from ..sanitize import sanitize_rich_text, strip_tags
from ..security import current_user_id
from ..serializers import job_out

router = APIRouter(prefix="/api/job", tags=["job"])


@router.post("/create-job", status_code=201)
async def post_job(
    body: dict[str, Any] = Body(...),
    user_id: uuid.UUID = Depends(current_user_id),
    session: AsyncSession = Depends(get_session),
):
    title = body.get("title")
    requirements = body.get("requirements")
    salary = body.get("salary")
    location = body.get("location")
    job_type = body.get("jobType")
    experience = body.get("experience")
    position = body.get("position")
    company_id = body.get("companyId")

    # Validate required fields (experience may legitimately be 0 for freshers)
    has_experience = experience is not None and experience != ""
    safe_description = sanitize_rich_text(body.get("description"))
    if (
        falsy(title)
        or not strip_tags(safe_description)
        or falsy(requirements)
        or falsy(salary)
        or falsy(location)
        or falsy(job_type)
        or not has_experience
        or falsy(position)
        or falsy(company_id)
    ):
        raise ApiError(400, "Missing required fields.")

    # Handle requirements (string or array)
    if isinstance(requirements, str):
        formatted = [r.strip() for r in requirements.split(",") if r.strip()]
    elif isinstance(requirements, list):
        formatted = [str(r).strip() for r in requirements if str(r).strip()]
    else:
        raise ApiError(
            400,
            "Invalid format for requirements. Use array or comma-separated string.",
        )
    if not formatted:
        raise ApiError(400, "Add at least one requirement.")

    numeric_salary = to_number(salary)
    if numeric_salary is None:
        raise ApiError(400, "Salary must be a number.")

    numeric_experience = to_number(experience)
    if numeric_experience is None or numeric_experience < 0:
        raise ApiError(400, "Experience must be a number of years (0 or more).")

    numeric_position = to_number(position)
    if numeric_position is None or numeric_position < 1 or not numeric_position.is_integer():
        raise ApiError(400, "Position must be a whole number of openings.")

    company_uuid = parse_uuid(str(company_id))
    if company_uuid is None:
        raise ApiError(400, "Invalid company id.")

    job = Job(
        title=str(title),
        description=safe_description,
        requirements=formatted,
        salary=numeric_salary,
        location=str(location),
        job_type=str(job_type),
        experience_level=numeric_experience,
        position=int(numeric_position),
        company_id=company_uuid,
        created_by=user_id,
    )
    session.add(job)
    await session.commit()
    set_committed_value(job, "applications", [])  # a new job has none; avoids a lazy load
    return {
        "message": "New job created successfully!",
        "job": job_out(job),
        "success": True,
    }


# ----- search filters --------------------------------------------------------


def _escape_regex(value: object) -> str:
    return re.sub(r"([.*+?^${}()|\[\]\\])", r"\\\1", str(value))


# Filter values are matched with these patterns (instead of exact text) so
# "Delhi NCR" finds Gurgaon/Noida jobs and "Banglore" finds "Bengaluru".
LOCATION_ALIASES = {
    "delhi ncr": "delhi|noida|gurgaon|gurugram|ghaziabad|faridabad",
    "bengaluru": "bengaluru|bangalore|banglore",
    "banglore": "bengaluru|bangalore|banglore",
    "gurugram": "gurugram|gurgaon",
    "gurgaon": "gurugram|gurgaon",
    "chennai": "chennai|madras",
    "kolkata": "kolkata|calcutta",
}
INDUSTRY_ALIASES = {
    "frontend developer": "front[- ]?end",
    "backend developer": "back[- ]?end",
    "fullstack developer": "full[- ]?stack",
    "data science": "data (scien|analy)|machine learning",
    "devops engineer": "dev[- ]?ops",
    "graphic designer": "graphic|ui[ /-]?ux|designer",
}


def _matches(column, pattern: str):
    """Case-insensitive regular expression match (PostgreSQL ~*)."""
    return column.op("~*")(pattern)


def _role_condition(role: str):
    """A known role uses its pattern. Anything else the user typed matches
    titles that contain every word, so "react developer" finds
    "React Front-End Developer"."""
    alias = INDUSTRY_ALIASES.get(role.lower())
    if alias:
        return _matches(Job.title, alias)

    words = [w for w in re.split(r"\s+", role) if len(w) > 1][:6]
    if not words:
        return _matches(Job.title, _escape_regex(role))
    return and_(*[_matches(Job.title, _escape_regex(w)) for w in words])


def _salary_range(value: str):
    """"6-10" -> 6 <= salary < 10, "20+" -> salary >= 20 (salary is in LPA)."""
    if m := re.fullmatch(r"(\d+(?:\.\d+)?)\+", value):
        return Job.salary >= float(m.group(1))
    if m := re.fullmatch(r"(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)", value):
        return and_(Job.salary >= float(m.group(1)), Job.salary < float(m.group(2)))
    return None


@router.get("/all-job")
async def get_all_job(
    keyword: str = "",
    location: list[str] = Query(default=[]),
    industry: list[str] = Query(default=[]),
    jobType: list[str] = Query(default=[]),
    salary: list[str] = Query(default=[]),
    experience: str = "",
    _: uuid.UUID = Depends(current_user_id),
    session: AsyncSession = Depends(get_session),
):
    # groups are combined with AND, the choices inside a group with OR
    conditions = []
    if keyword:
        conditions.append(
            or_(Job.title.icontains(keyword, autoescape=True),
                Job.description.icontains(keyword, autoescape=True))
        )
    if location:
        conditions.append(
            or_(*[
                _matches(Job.location, LOCATION_ALIASES.get(v.lower(), _escape_regex(v)))
                for v in location
            ])
        )
    if industry:
        conditions.append(or_(*[_role_condition(v) for v in industry]))
    if jobType:
        conditions.append(or_(*[func.lower(Job.job_type) == v.lower() for v in jobType]))
    salary_conditions = [c for c in map(_salary_range, salary) if c is not None]
    if salary_conditions:
        conditions.append(or_(*salary_conditions))
    # candidate's years of experience: jobs asking for that much or less
    years = to_number(experience) if experience != "" else None
    if years is not None and years >= 0:
        conditions.append(Job.experience_level <= years)

    jobs = (
        await session.scalars(
            select(Job)
            .where(*conditions)
            .options(selectinload(Job.company), selectinload(Job.applications))
            .order_by(Job.created_at.desc())
        )
    ).all()
    return {
        "message": "All Jobs retrieved successfully.",
        "jobs": [job_out(j, populate_company=True) for j in jobs],
        "success": True,
    }


@router.get("/fetch-by-id/{id}")
async def get_job_by_id(
    id: str,
    _: uuid.UUID = Depends(current_user_id),
    session: AsyncSession = Depends(get_session),
):
    job_id = parse_uuid(id)
    job = (
        await session.scalar(
            select(Job)
            .where(Job.id == job_id)
            .options(selectinload(Job.applications), selectinload(Job.company))
        )
        if job_id
        else None
    )
    if not job:
        raise ApiError(404, "Job not found!")
    return {
        "message": f"Job retrieved successfully by id: {id}",
        # the company is included in full, so the job page can show its details
        "job": job_out(job, populate_company=True, applications="objects"),
        "success": True,
    }


@router.get("/admin-job")
async def get_job_by_logged_in_user(
    user_id: uuid.UUID = Depends(current_user_id),
    session: AsyncSession = Depends(get_session),
):
    jobs = (
        await session.scalars(
            select(Job)
            .where(Job.created_by == user_id)
            .options(selectinload(Job.company), selectinload(Job.applications))
            .order_by(Job.created_at)
        )
    ).all()

    # applications still waiting for a decision, per job
    pending = dict(
        (
            await session.execute(
                select(Application.job_id, func.count())
                .where(
                    Application.job_id.in_([j.id for j in jobs]),
                    Application.status == "PENDING",
                )
                .group_by(Application.job_id)
            )
        ).tuples().all()
    )

    return {
        "message": "Jobs retrieved by logged in user",
        "jobs": [
            {**job_out(j, populate_company=True), "pendingApplications": pending.get(j.id, 0)}
            for j in jobs
        ],
        "success": True,
    }


# ----- "Save for later" bookmarks -------------------------------------------


@router.post("/save/{id}")
async def save_job(
    id: str,
    user_id: uuid.UUID = Depends(current_user_id),
    session: AsyncSession = Depends(get_session),
):
    job_id = parse_uuid(id)
    if job_id is None:
        raise ApiError(400, "Invalid job id.")
    if not await session.scalar(select(Job.id).where(Job.id == job_id)):
        raise ApiError(404, "Job not found!")

    await session.execute(
        pg_insert(SavedJob)
        .values(user_id=user_id, job_id=job_id)
        .on_conflict_do_nothing()
    )
    await session.commit()
    return {"message": "Job saved for later.", "success": True}


@router.delete("/save/{id}")
async def remove_saved_job(
    id: str,
    user_id: uuid.UUID = Depends(current_user_id),
    session: AsyncSession = Depends(get_session),
):
    job_id = parse_uuid(id)
    if job_id is None:
        raise ApiError(400, "Invalid job id.")

    await session.execute(
        SavedJob.__table__.delete().where(
            SavedJob.user_id == user_id, SavedJob.job_id == job_id
        )
    )
    await session.commit()
    return {"message": "Removed from saved jobs.", "success": True}


@router.get("/saved")
async def get_saved_jobs(
    user_id: uuid.UUID = Depends(current_user_id),
    session: AsyncSession = Depends(get_session),
):
    # newest saved first; jobs deleted since being saved are gone with their row
    jobs = (
        await session.scalars(
            select(Job)
            .join(SavedJob, SavedJob.job_id == Job.id)
            .where(SavedJob.user_id == user_id)
            .options(selectinload(Job.company), selectinload(Job.applications))
            .order_by(SavedJob.saved_at.desc())
        )
    ).all()
    return {
        "message": "Saved jobs retrieved successfully.",
        "jobs": [job_out(j, populate_company=True) for j in jobs],
        "success": True,
    }
