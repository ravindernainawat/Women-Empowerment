from datetime import datetime
import pytest
from app.models import User, SkillGapAssessment, AssessmentGapDetail, Skill, ProficiencyEnum, RoleEnum
from tests.conftest import client, TestingSessionLocal


def _create_admin_token() -> str:
    from app.security import hash_password, create_access_token
    db = TestingSessionLocal()
    ts = datetime.utcnow().timestamp()
    admin = User(
        email=f"admin_{ts}@weis.org",
        password_hash=hash_password("adminpass"),
        full_name="Admin Auditor",
        role=RoleEnum.admin,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    token = create_access_token({"sub": str(admin.user_id), "role": "admin"})
    db.close()
    return token


# 1. Credential Verification
def test_verify_credential_success():
    db = TestingSessionLocal()
    user = User(email=f"scholar_{datetime.utcnow().timestamp()}@weis.org", password_hash="pass", full_name="Amina Rao", role="mentee")
    db.add(user)
    db.commit()
    assessment = SkillGapAssessment(user_id=user.user_id, target_role="Junior Data Analyst", overall_score=75)
    db.add(assessment)
    db.commit()
    cert_id = f"WEIS-V{assessment.assessment_id:04d}-{int((75 * 12345) % 90000 + 10000)}"
    db.close()

    res = client.get(f"/api/verify/{cert_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["target_role"] == "Junior Data Analyst"
    assert data["readiness_score"] == 75
    assert "Amina" in data["recipient_name"]


def test_verify_credential_invalid_checksum():
    res = client.get("/api/verify/WEIS-V0001-99999")
    assert res.status_code in (400, 404)


# 2. Anonymous Safety Reporting & Tracking
def test_anonymous_safety_reporting_and_tracking():
    # Submit anonymous report with urgent keyword
    res = client.post("/api/safety-reports/anonymous", json={
        "incident_type": "Workplace Stalking & Threat",
        "description": "Continuous harassment and physical stalking following me home.",
    })
    assert res.status_code == 201
    data = res.json()
    assert "tracking_token" in data
    assert data["urgency"] == "urgent"
    token = data["tracking_token"]

    # Public tracking endpoint
    track_res = client.get(f"/api/safety-reports/track/{token}")
    assert track_res.status_code == 200
    track_data = track_res.json()
    assert track_data["tracking_token"] == token
    assert track_data["urgency"] == "urgent"
    assert track_data["status"] == "submitted"


# 3. Government Scheme Finder
def test_government_schemes_catalog():
    res = client.get("/api/schemes")
    assert res.status_code == 200
    data = res.json()
    assert data["total_schemes"] >= 5
    names = [s["name"] for s in data["schemes"]]
    assert any("Mudra" in n for n in names)
    assert any("Stand-Up" in n for n in names)

    # Search filter
    filter_res = client.get("/api/schemes?keyword=mudra")
    assert filter_res.status_code == 200
    assert filter_res.json()["total_schemes"] >= 1


# 4. Emergency Resources & Helplines
def test_sanctuary_helplines_directory():
    res = client.get("/api/resources/helplines")
    assert res.status_code == 200
    data = res.json()
    assert len(data["helplines"]) >= 5
    numbers = [h["number"] for h in data["helplines"]]
    assert "112" in numbers
    assert "181" in numbers


# 5. Career Returnee Analyzer API
def test_career_returnee_analysis_api():
    res = client.post("/api/returnee/analyze", json={
        "background_type": "caregiving",
        "years_break": 3,
        "free_text_experience": "Managed family healthcare logistics and daily operations.",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["match_score"] >= 75
    assert len(data["competencies"]) >= 3
    assert "Agile" in data["translated_role"] or "Operations" in data["translated_role"]


# 6. Live Opportunities Radar API
def test_live_opportunities_radar_api():
    res = client.get("/api/returnee/opportunities?user_score=72")
    assert res.status_code == 200
    data = res.json()
    assert data["current_score"] == 72
    assert data["total_opportunities"] >= 4
    # With 72% score, roles requiring 60%, 65%, 70% should be unlocked
    assert data["unlocked_count"] >= 3


# 7. Semantic Skill Extractor API
def test_semantic_skill_extractor():
    sample_text = (
        "I have 3 years of experience writing Python scripts, performing data analysis using SQL and Pandas, "
        "managing sprint timelines with Agile Scrum, and building responsive React components."
    )
    res = client.post("/api/skills/extract", json={"text": sample_text})
    assert res.status_code == 200
    data = res.json()
    assert data["total_extracted"] >= 3
    extracted_names = [s["skill_name"] for s in data["skills"]]
    assert "Python Programming" in extracted_names
    assert "Data Analysis (Pandas/SQL)" in extracted_names
    assert "Project Management & Agile" in extracted_names


# 8. Algorithmic Fairness Audit API
def test_fairness_audit_dashboard_api():
    token = _create_admin_token()
    res = client.get("/api/admin/fairness", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["demographic_parity_ratio"] >= 0.8
    assert "age_bands" in data["demographics"]
    assert "career_break_duration" in data["demographics"]
    assert "regional_inclusivity" in data["demographics"]
