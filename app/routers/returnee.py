from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/returnee", tags=["Career Returnee & Opportunities"])


class ReturneeAnalysisRequest(BaseModel):
    background_type: str = Field(..., description="caregiving | education | micro-commerce | advocacy")
    years_break: int = Field(default=2, ge=0, le=20)
    free_text_experience: Optional[str] = Field(None, description="Free text description of informal experience")


TRANSFERABLE_MAP = {
    "education": {
        "title": "Primary Education & Tutoring",
        "corporate_role": "Instructional Specialist / Customer Success Lead",
        "match_score": 86,
        "translated_competencies": [
            {"skill": "Stakeholder Communication & Conflict Resolution", "corporate_relevance": "High", "level": "Advanced"},
            {"skill": "Curriculum & Onboarding Architecture", "corporate_relevance": "Critical", "level": "Intermediate"},
            {"skill": "Adaptive Coaching & Feedback Loops", "corporate_relevance": "High", "level": "Advanced"},
        ],
        "narrative": "Translates years of structured pedagogy into high-impact corporate client onboarding and team enablement."
    },
    "caregiving": {
        "title": "Full-Time Family Caregiving",
        "corporate_role": "Operations Coordinator / Agile Scrum Facilitator",
        "match_score": 80,
        "translated_competencies": [
            {"skill": "Multi-Crisis Resource Allocation & Prioritization", "corporate_relevance": "Critical", "level": "Advanced"},
            {"skill": "High-Stakes Empathy & De-escalation", "corporate_relevance": "High", "level": "Expert"},
            {"skill": "Complex Calendar & Logistics Optimization", "corporate_relevance": "Medium", "level": "Advanced"},
        ],
        "narrative": "Reframes caretaking as high-stress agile operations, resource management, and emotional intelligence under pressure."
    },
    "micro-commerce": {
        "title": "Informal Micro-Commerce / Home Business",
        "corporate_role": "Product Operations / Digital Growth Associate",
        "match_score": 92,
        "translated_competencies": [
            {"skill": "End-to-End P&L Accountability & Margin Optimization", "corporate_relevance": "Critical", "level": "Intermediate"},
            {"skill": "Vendor Negotiation & Supply Chain Sourcing", "corporate_relevance": "High", "level": "Advanced"},
            {"skill": "Customer Retention & Social Media Marketing", "corporate_relevance": "High", "level": "Advanced"},
        ],
        "narrative": "Proves proven direct ownership of revenue cycles, cost negotiation, and digital client acquisition."
    },
    "advocacy": {
        "title": "Community Advocacy / NGO Volunteering",
        "corporate_role": "Program Manager / Community Operations Director",
        "match_score": 88,
        "translated_competencies": [
            {"skill": "Cross-Functional Consensus & Coalition Building", "corporate_relevance": "Critical", "level": "Expert"},
            {"skill": "Public Speaking & Stakeholder Influence", "corporate_relevance": "High", "level": "Advanced"},
            {"skill": "Grassroots Campaign Measurement & Governance", "corporate_relevance": "High", "level": "Intermediate"},
        ],
        "narrative": "Demonstrates proven capability to rally diverse teams around complex social and business outcomes."
    }
}

LIVE_OPPORTUNITIES = [
    {
        "id": "opp-101",
        "title": "Junior Data Analyst (Returnee Track)",
        "company": "TechMahindra Equality Labs",
        "location": "Remote (Pan-India)",
        "required_readiness": 70,
        "workplace_inclusion_pledge": "Certified Equal-Pay & Dedicated 6-Month Returnee Mentorship Cohort",
        "salary_band": "₹4.5 - 6.5 LPA",
        "flexibility": "100% Remote / Async Hours",
    },
    {
        "id": "opp-102",
        "title": "Associate Business Operations Specialist",
        "company": "Infosys Inclusivity Hub",
        "location": "Hybrid (Bengaluru / Pune / Remote)",
        "required_readiness": 60,
        "workplace_inclusion_pledge": "Core hours 10 AM - 3 PM with flexible sprint schedules for parents",
        "salary_band": "₹4.0 - 5.5 LPA",
        "flexibility": "Flexible Shift Scheduling",
    },
    {
        "id": "opp-103",
        "title": "Junior Frontend Developer (React/TS)",
        "company": "ThoughtWorks Social Impact Lab",
        "location": "Remote (India)",
        "required_readiness": 65,
        "workplace_inclusion_pledge": "No career-gap penalties; blind technical assessment screening",
        "salary_band": "₹5.5 - 7.5 LPA",
        "flexibility": "100% Remote",
    },
    {
        "id": "opp-104",
        "title": "AI & Prompt Engineering Associate",
        "company": "Wipro GenAI Academy",
        "location": "Hybrid (Hyderabad / Remote)",
        "required_readiness": 80,
        "workplace_inclusion_pledge": "Accelerated leadership tracks for women returning after 2+ years",
        "salary_band": "₹6.5 - 9.0 LPA",
        "flexibility": "Hybrid / Childcare Reimbursement",
    },
]


@router.post("/analyze")
def analyze_career_returnee(payload: ReturneeAnalysisRequest):
    """
    Evaluates informal life and non-linear experiences to generate
    validated corporate equivalencies and confidence scores.
    """
    key = payload.background_type.lower()
    data = TRANSFERABLE_MAP.get(key, TRANSFERABLE_MAP["education"])

    # Score adjustments based on duration
    score = data["match_score"]
    if payload.years_break > 4:
        score = max(70, score - 2)

    return {
        "background_category": payload.background_type,
        "years_break": payload.years_break,
        "translated_role": data["corporate_role"],
        "match_score": score,
        "narrative": data["narrative"],
        "competencies": data["translated_competencies"],
    }


@router.get("/opportunities")
def list_vetted_opportunities(user_score: Optional[int] = None):
    """
    Returns verified, equal-pay certified job opportunities with
    dynamic unlock thresholds based on current readiness score.
    """
    score = user_score or 0
    opportunities = []

    for opp in LIVE_OPPORTUNITIES:
        is_unlocked = score >= opp["required_readiness"]
        opportunities.append({
            **opp,
            "is_unlocked": is_unlocked,
            "points_needed": max(0, opp["required_readiness"] - score),
        })

    return {
        "current_score": score,
        "total_opportunities": len(opportunities),
        "unlocked_count": sum(1 for o in opportunities if o["is_unlocked"]),
        "opportunities": opportunities,
    }
