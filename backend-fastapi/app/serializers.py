"""Turns database rows into the JSON the React client already expects:
Mongo-style `_id`, camelCase keys, ISO timestamps, and "populated" nested
objects where the Node API populated them."""

import uuid
from datetime import datetime, timezone
from typing import Any

from .models import Application, Company, Job, User


def iso(value: datetime) -> str:
    value = value.astimezone(timezone.utc)
    return value.strftime("%Y-%m-%dT%H:%M:%S.") + f"{value.microsecond // 1000:03d}Z"


def _id(value: uuid.UUID | None) -> str | None:
    return str(value) if value is not None else None


def _number(value: float) -> int | float:
    return int(value) if float(value).is_integer() else value


def profile_out(user: User) -> dict[str, Any]:
    return {
        "bio": user.bio,
        "skills": list(user.skills or []),
        "resume": user.resume,
        "resumeOriginalName": user.resume_original_name,
        "profilePhoto": user.profile_photo,
    }


def user_brief(user: User) -> dict[str, Any]:
    """What login and profile update return."""
    return {
        "_id": _id(user.id),
        "fullName": user.full_name,
        "email": user.email,
        "phoneNumber": user.phone_number,
        "role": user.role,
        "profile": profile_out(user),
    }


def user_full(user: User, *, saved_jobs: bool = True) -> dict[str, Any]:
    """A user without the password hash."""
    data = user_brief(user)
    if saved_jobs:
        data["savedJobs"] = [_id(link.job_id) for link in user.saved_links]
    data["createdAt"] = iso(user.created_at)
    data["updatedAt"] = iso(user.updated_at)
    return data


def company_out(company: Company) -> dict[str, Any]:
    return {
        "_id": _id(company.id),
        "name": company.name,
        "description": company.description,
        "website": company.website,
        "location": company.location,
        "logo": company.logo,
        "userId": _id(company.user_id),
        "createdAt": iso(company.created_at),
        "updatedAt": iso(company.updated_at),
    }


def job_out(
    job: Job,
    *,
    populate_company: bool = False,
    applications: str = "ids",  # "ids" | "objects" | "with_applicant"
) -> dict[str, Any]:
    """`populate_company` needs job.company loaded; `applications` other than
    "ids" needs job.applications (and their applicants) loaded."""
    if populate_company:
        company = company_out(job.company) if job.company else None
    else:
        company = _id(job.company_id)

    if applications == "ids":
        apps: list[Any] = [_id(a.id) for a in job.applications]
    else:
        apps = [
            application_out(a, populate_applicant=applications == "with_applicant")
            for a in job.applications
        ]

    return {
        "_id": _id(job.id),
        "title": job.title,
        "description": job.description,
        "requirements": list(job.requirements or []),
        "salary": _number(job.salary),
        "location": job.location,
        "jobType": job.job_type,
        "position": job.position,
        "experienceLevel": _number(job.experience_level),
        "company": company,
        "created_by": _id(job.created_by),
        "applications": apps,
        "createdAt": iso(job.created_at),
        "updatedAt": iso(job.updated_at),
    }


def application_out(
    application: Application,
    *,
    populate_applicant: bool = False,
    job: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "_id": _id(application.id),
        "job": job if job is not None else _id(application.job_id),
        "applicant": (
            user_full(application.applicant, saved_jobs=False)
            if populate_applicant
            else _id(application.applicant_id)
        ),
        "status": application.status,
        "createdAt": iso(application.created_at),
        "updatedAt": iso(application.updated_at),
    }
