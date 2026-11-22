"""
Phase 10: Full End-to-End User Journey Integration Test.
Walks through the complete Tier 1 lifecycle as defined in WEIS PRD & TRD:
1. User Registration & Authentication (Mentee, Mentor, Admin)
2. Skill Inventory Management (Add & update proficiencies)
3. Skill-Gap Assessment against a target role
4. Course Recommendations Generation & Status Lifecycle (pending -> enrolled)
5. Mentorship Matching Workflow (Mentee requests -> Mentor views & accepts)
6. Safety Incident Reporting & Admin Resolution
"""

import pytest
from tests.conftest import client, TestingSessionLocal
from app.models import Skill, Course, RoleEnum, Mentor
from app.security import hash_password


def test_full_e2e_user_journey():
    # -------------------------------------------------------------
    # 0. Setup: Ensure Skills & Course Catalog Exist in Test DB
    # -------------------------------------------------------------
    db = TestingSessionLocal()
    
    # Skills
    python_skill = db.query(Skill).filter(Skill.skill_name == "Python Programming").first()
    if not python_skill:
        python_skill = Skill(skill_name="Python Programming", category="Technical")
        db.add(python_skill)
        db.commit()
        db.refresh(python_skill)

    data_skill = db.query(Skill).filter(Skill.skill_name == "Data Analysis (Pandas/SQL)").first()
    if not data_skill:
        data_skill = Skill(skill_name="Data Analysis (Pandas/SQL)", category="Technical")
        db.add(data_skill)
        db.commit()
        db.refresh(data_skill)

    # Course
    course = db.query(Course).filter(Course.title == "Data Analytics Masterclass").first()
    if not course:
        course = Course(
            title="Data Analytics Masterclass",
            provider="Coursera",
            skill_id=data_skill.skill_id,
            duration_hours=25,
            url="https://coursera.org/learn/data-analytics",
        )
        db.add(course)
        python_skill_id = python_skill.skill_id
        data_skill_id = data_skill.skill_id
    else:
        python_skill_id = python_skill.skill_id
        data_skill_id = data_skill.skill_id

    # -------------------------------------------------------------
    # 1. User Registration & Auth
    # -------------------------------------------------------------
    # 1a. Register Mentee
    mentee_resp = client.post("/api/auth/register", json={
        "full_name": "E2E Mentee",
        "email": "e2e_mentee@example.com",
        "password": "password123",
        "role": "mentee",
        "phone": "+91 99999 11111",
        "location": "Bengaluru",
    })
    assert mentee_resp.status_code == 201, mentee_resp.text
    mentee_id = mentee_resp.json()["user_id"]

    # Login Mentee
    mentee_login = client.post("/api/auth/login", json={
        "email": "e2e_mentee@example.com",
        "password": "password123",
    })
    assert mentee_login.status_code == 200
    mentee_token = mentee_login.json()["access_token"]
    mentee_headers = {"Authorization": f"Bearer {mentee_token}"}

    # 1b. Register Mentor
    mentor_resp = client.post("/api/auth/register", json={
        "full_name": "E2E Mentor",
        "email": "e2e_mentor@example.com",
        "password": "password123",
        "role": "mentor",
        "phone": "+91 99999 22222",
        "location": "Mumbai",
    })
    assert mentor_resp.status_code == 201
    mentor_id = mentor_resp.json()["user_id"]

    # Login Mentor
    mentor_login = client.post("/api/auth/login", json={
        "email": "e2e_mentor@example.com",
        "password": "password123",
    })
    assert mentor_login.status_code == 200
    mentor_token = mentor_login.json()["access_token"]
    mentor_headers = {"Authorization": f"Bearer {mentor_token}"}

    # Register Mentor Profile & verify
    mentor_prof_resp = client.post("/api/mentors/register", json={
        "expertise_area": "Data Science",
        "bio": "Experienced data mentor",
    }, headers=mentor_headers)
    assert mentor_prof_resp.status_code == 201
    mentor_profile_id = mentor_prof_resp.json()["mentor_id"]

    # Mark mentor verified in DB
    mentor_record = db.query(Mentor).filter(Mentor.mentor_id == mentor_profile_id).first()
    mentor_record.is_verified = True
    db.commit()

    # 1c. Create dedicated E2E Admin in DB
    from app.models import User
    from app.security import create_access_token
    import time
    e2e_admin = User(
        full_name="E2E Admin",
        email=f"e2e_admin_{time.time()}@weis.org",
        password_hash=hash_password("admin123"),
        role=RoleEnum.admin,
    )
    db.add(e2e_admin)
    db.commit()
    db.refresh(e2e_admin)
    admin_token = create_access_token(data={"sub": str(e2e_admin.user_id)})
    db.close()
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # -------------------------------------------------------------
    # 2. Skill Inventory Management
    # -------------------------------------------------------------
    # Add Python (intermediate)
    add_skill_resp = client.post("/api/users/me/skills", json={
        "skill_id": python_skill_id,
        "proficiency_level": "intermediate",
    }, headers=mentee_headers)
    assert add_skill_resp.status_code == 201

    # Check inventory
    my_skills = client.get("/api/users/me/skills", headers=mentee_headers)
    assert my_skills.status_code == 200
    assert len(my_skills.json()) >= 1

    # -------------------------------------------------------------
    # 3. Skill-Gap Assessment against target role
    # -------------------------------------------------------------
    assess_resp = client.post("/api/assessments", json={
        "target_role": "Junior Data Analyst",
        "skill_ratings": [
            {
                "skill_id": python_skill_id,
                "required_level": "advanced",
                "current_level": "intermediate",
            },
            {
                "skill_id": data_skill_id,
                "required_level": "advanced",
                "current_level": "beginner",
            },
        ],
    }, headers=mentee_headers)
    assert assess_resp.status_code == 201, assess_resp.text
    assessment_data = assess_resp.json()
    assert assessment_data["target_role"] == "Junior Data Analyst"
    assert len(assessment_data["gap_details"]) == 2

    # -------------------------------------------------------------
    # 4. Recommendations Generation & Status Updates
    # -------------------------------------------------------------
    rec_gen_resp = client.post("/api/recommendations/generate", headers=mentee_headers)
    assert rec_gen_resp.status_code == 200
    gen_data = rec_gen_resp.json()
    assert gen_data["generated_count"] >= 1
    rec_id = gen_data["recommendations"][0]["recommendation_id"]

    # Update recommendation status to enrolled
    patch_rec = client.patch(f"/api/recommendations/{rec_id}", json={
        "status": "enrolled",
    }, headers=mentee_headers)
    assert patch_rec.status_code == 200
    assert patch_rec.json()["status"] == "enrolled"

    # -------------------------------------------------------------
    # 5. Mentorship Matching & Request Workflow
    # -------------------------------------------------------------
    # Mentee views verified mentors
    mentors_list = client.get("/api/mentors", headers=mentee_headers)
    assert mentors_list.status_code == 200
    assert any(m["mentor_id"] == mentor_profile_id for m in mentors_list.json())

    # Mentee sends request to mentor
    req_resp = client.post("/api/mentorship-requests", json={
        "mentor_id": mentor_profile_id,
    }, headers=mentee_headers)
    assert req_resp.status_code == 201
    request_id = req_resp.json()["request_id"]

    # Mentor views incoming requests
    inc_resp = client.get("/api/mentorship-requests/incoming", headers=mentor_headers)
    assert inc_resp.status_code == 200
    assert any(r["request_id"] == request_id for r in inc_resp.json())

    # Mentor accepts request
    accept_resp = client.patch(f"/api/mentorship-requests/{request_id}", json={
        "status": "accepted",
    }, headers=mentor_headers)
    assert accept_resp.status_code == 200
    assert accept_resp.json()["status"] == "accepted"

    # -------------------------------------------------------------
    # 6. Safety Reporting & Admin Review
    # -------------------------------------------------------------
    # Mentee files safety report
    safety_resp = client.post("/api/safety-reports", json={
        "incident_type": "inappropriate_behavior",
        "description": "Encountered inappropriate behavior during an external forum link.",
    }, headers=mentee_headers)
    assert safety_resp.status_code == 201
    report_id = safety_resp.json()["report_id"]

    # Mentee views own reports
    my_reports = client.get("/api/safety-reports/me", headers=mentee_headers)
    assert my_reports.status_code == 200
    assert any(r["report_id"] == report_id for r in my_reports.json())

    # Admin lists all safety reports
    admin_reports = client.get("/api/safety-reports", headers=admin_headers)
    assert admin_reports.status_code == 200

    # Admin updates report status to resolved
    admin_update = client.patch(f"/api/safety-reports/{report_id}", json={
        "status": "resolved",
    }, headers=admin_headers)
    assert admin_update.status_code == 200
    assert admin_update.json()["status"] == "resolved"

    print("\n✅ Full E2E User Journey Passed Successfully!")
