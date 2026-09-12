"""
SQLAlchemy ORM models — mirror weis_schema.sql (Tier 1 core tables).
Keep this file as the single source of truth for table structure on
the Python side; any change here should be reflected in the .sql file
(and vice versa) until the project introduces Alembic migrations.
"""

import enum
from datetime import datetime

from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DECIMAL,
    ForeignKey, Enum, TIMESTAMP, UniqueConstraint
)
from sqlalchemy.orm import relationship

from app.database import Base


class RoleEnum(str, enum.Enum):
    mentee = "mentee"
    mentor = "mentor"
    admin = "admin"


class ProficiencyEnum(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class RecommendationStatusEnum(str, enum.Enum):
    pending = "pending"
    viewed = "viewed"
    enrolled = "enrolled"
    completed = "completed"


class MentorshipStatusEnum(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"
    completed = "completed"


class SafetyStatusEnum(str, enum.Enum):
    submitted = "submitted"
    under_review = "under_review"
    resolved = "resolved"
    dismissed = "dismissed"


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.mentee)
    phone = Column(String(20))
    location = Column(String(150))
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)

    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    assessments = relationship("SkillGapAssessment", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    safety_reports = relationship("SafetyReport", back_populates="user", cascade="all, delete-orphan")
    mentor_profile = relationship("Mentor", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    skill_id = Column(Integer, primary_key=True, autoincrement=True)
    skill_name = Column(String(100), nullable=False, unique=True)
    category = Column(String(100))


class UserSkill(Base):
    __tablename__ = "user_skills"
    __table_args__ = (UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),)

    user_skill_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.skill_id", ondelete="CASCADE"), nullable=False)
    proficiency_level = Column(Enum(ProficiencyEnum), nullable=False, default=ProficiencyEnum.beginner)

    user = relationship("User", back_populates="skills")
    skill = relationship("Skill")


class SkillGapAssessment(Base):
    __tablename__ = "skill_gap_assessments"

    assessment_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    target_role = Column(String(150), nullable=False)
    overall_score = Column(DECIMAL(5, 2))
    assessed_at = Column(TIMESTAMP, default=datetime.utcnow)

    user = relationship("User", back_populates="assessments")
    gap_details = relationship("AssessmentGapDetail", back_populates="assessment", cascade="all, delete-orphan")


class AssessmentGapDetail(Base):
    __tablename__ = "assessment_gap_details"

    gap_detail_id = Column(Integer, primary_key=True, autoincrement=True)
    assessment_id = Column(Integer, ForeignKey("skill_gap_assessments.assessment_id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.skill_id", ondelete="CASCADE"), nullable=False)
    required_level = Column(Enum(ProficiencyEnum), nullable=False)
    current_level = Column(Enum(ProficiencyEnum), nullable=False, default=ProficiencyEnum.beginner)
    gap_score = Column(DECIMAL(5, 2))

    assessment = relationship("SkillGapAssessment", back_populates="gap_details")
    skill = relationship("Skill")


class Course(Base):
    __tablename__ = "courses"

    course_id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    provider = Column(String(150))
    skill_id = Column(Integer, ForeignKey("skills.skill_id", ondelete="SET NULL"))
    url = Column(String(255))
    duration_hours = Column(Integer)

    skill = relationship("Skill")


class Recommendation(Base):
    __tablename__ = "recommendations"

    recommendation_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.course_id", ondelete="CASCADE"), nullable=False)
    match_score = Column(DECIMAL(5, 2))
    recommended_at = Column(TIMESTAMP, default=datetime.utcnow)
    status = Column(Enum(RecommendationStatusEnum), nullable=False, default=RecommendationStatusEnum.pending)

    user = relationship("User", back_populates="recommendations")
    course = relationship("Course")


class Mentor(Base):
    __tablename__ = "mentors"

    mentor_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, unique=True)
    expertise_area = Column(String(150))
    bio = Column(Text)
    is_verified = Column(Boolean, nullable=False, default=False)

    user = relationship("User", back_populates="mentor_profile")
    requests_received = relationship("MentorshipRequest", back_populates="mentor", cascade="all, delete-orphan")


class MentorshipRequest(Base):
    __tablename__ = "mentorship_requests"

    request_id = Column(Integer, primary_key=True, autoincrement=True)
    mentee_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    mentor_id = Column(Integer, ForeignKey("mentors.mentor_id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(MentorshipStatusEnum), nullable=False, default=MentorshipStatusEnum.pending)
    requested_at = Column(TIMESTAMP, default=datetime.utcnow)

    mentee = relationship("User")
    mentor = relationship("Mentor", back_populates="requests_received")


class SafetyReport(Base):
    __tablename__ = "safety_reports"

    report_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    incident_type = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(SafetyStatusEnum), nullable=False, default=SafetyStatusEnum.submitted)
    reported_at = Column(TIMESTAMP, default=datetime.utcnow)

    user = relationship("User", back_populates="safety_reports")
