"""
Pydantic schemas for administrative governance and platform telemetry endpoints.
"""

from pydantic import BaseModel


class AdminStatsResponse(BaseModel):
    total_users: int
    total_mentees: int
    total_mentors: int
    verified_mentors: int
    pending_mentors: int
    total_assessments: int
    avg_readiness_score: float
    total_skills_logged: int
    catalog_skills_count: int
    total_safety_reports: int
    open_safety_reports: int
    resolved_safety_reports: int
    total_mentorship_requests: int
    accepted_mentorship_requests: int
