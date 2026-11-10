import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    ARRAY,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

DEFAULT_PROFILE_PHOTO = "https://github.com/shadcn.png"

ROLES = ("student", "recruiter")
APPLICATION_STATUSES = ("PENDING", "ACCEPTED", "REJECTED")


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now, server_default=func.now()
    )


def _uuid_pk() -> Mapped[uuid.UUID]:
    return mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = _uuid_pk()
    full_name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True)
    password: Mapped[str] = mapped_column(String)
    phone_number: Mapped[str] = mapped_column(String)
    role: Mapped[str] = mapped_column(
        Enum(*ROLES, name="user_role", native_enum=False, create_constraint=True)
    )

    # profile
    bio: Mapped[str | None] = mapped_column(Text)
    skills: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, server_default="{}"
    )
    resume: Mapped[str | None] = mapped_column(String)
    resume_original_name: Mapped[str | None] = mapped_column(String)
    profile_photo: Mapped[str] = mapped_column(
        String, default=DEFAULT_PROFILE_PHOTO, server_default=DEFAULT_PROFILE_PHOTO
    )

    saved_links: Mapped[list["SavedJob"]] = relationship(
        lazy="raise", cascade="all, delete-orphan", passive_deletes=True
    )


class Company(TimestampMixin, Base):
    __tablename__ = "companies"

    id: Mapped[uuid.UUID] = _uuid_pk()
    name: Mapped[str] = mapped_column(String, unique=True)
    description: Mapped[str | None] = mapped_column(Text)
    website: Mapped[str | None] = mapped_column(String)
    location: Mapped[str | None] = mapped_column(String)
    logo: Mapped[str | None] = mapped_column(String)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )


class Job(TimestampMixin, Base):
    __tablename__ = "jobs"

    id: Mapped[uuid.UUID] = _uuid_pk()
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text)
    requirements: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, server_default="{}"
    )
    salary: Mapped[float] = mapped_column(Float)  # LPA
    location: Mapped[str] = mapped_column(String)
    job_type: Mapped[str] = mapped_column(String)
    position: Mapped[int] = mapped_column(Integer)
    experience_level: Mapped[float] = mapped_column(Float)  # years
    # Deleting a company keeps its jobs, like before; they just lose the company.
    company_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("companies.id", ondelete="SET NULL"), index=True
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    company: Mapped[Company | None] = relationship(lazy="raise")
    applications: Mapped[list["Application"]] = relationship(
        lazy="raise",
        order_by="Application.created_at",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    __table_args__ = (Index("ix_jobs_created_at", "created_at"),)


class Application(TimestampMixin, Base):
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = _uuid_pk()
    job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"), index=True
    )
    applicant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    status: Mapped[str] = mapped_column(
        Enum(
            *APPLICATION_STATUSES,
            name="application_status",
            native_enum=False,
            create_constraint=True,
        ),
        default="PENDING",
        server_default="PENDING",
    )

    job: Mapped[Job] = relationship(lazy="raise", overlaps="applications")
    applicant: Mapped[User] = relationship(lazy="raise")

    # a person can apply to a job only once (also closes the double-click race)
    __table_args__ = (UniqueConstraint("job_id", "applicant_id", name="uq_application_job_applicant"),)


class SavedJob(Base):
    """A job a student bookmarked with "Save for later"."""

    __tablename__ = "saved_jobs"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True
    )
    saved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, server_default=func.now()
    )

    job: Mapped[Job] = relationship(lazy="raise")
