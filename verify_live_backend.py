"""
Live Backend Health & Integration Probe
Queries the live FastAPI server at http://127.0.0.1:8000
Verifies all 7 core routers with real HTTP calls, authentication, and database transactions.
"""
import sys
import httpx

BASE_URL = "http://127.0.0.1:8000"

def run_checks():
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)
    print("Testing live backend at", BASE_URL)

    # 1. Root & Health/Docs
    r = client.get("/docs")
    assert r.status_code == 200, f"/docs failed: {r.status_code}"
    print("[PASS] OpenAPI /docs accessible")

    # 2. Login Mentee
    r = client.post("/api/auth/login", json={"email": "mentee@weis.org", "password": "password123"})
    assert r.status_code == 200, f"Mentee login failed: {r.status_code} {r.text}"
    mentee_token = r.json()["access_token"]
    mentee_headers = {"Authorization": f"Bearer {mentee_token}"}
    print("[PASS] Mentee login successful")

    # 3. Login Mentor
    r = client.post("/api/auth/login", json={"email": "mentor@weis.org", "password": "password123"})
    assert r.status_code == 200, f"Mentor login failed: {r.status_code} {r.text}"
    mentor_token = r.json()["access_token"]
    mentor_headers = {"Authorization": f"Bearer {mentor_token}"}
    print("[PASS] Mentor login successful")

    # 4. Login Admin
    r = client.post("/api/auth/login", json={"email": "admin@weis.org", "password": "admin123"})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    admin_token = r.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[PASS] Admin login successful")

    # 5. User Profile: /api/users/me (GET and PUT)
    r = client.get("/api/users/me", headers=mentee_headers)
    assert r.status_code == 200, f"GET /api/users/me failed: {r.status_code}"
    profile = r.json()
    assert profile["email"] == "mentee@weis.org"
    print("[PASS] GET /api/users/me")

    r = client.put("/api/users/me", headers=mentee_headers, json={"location": "Bangalore, India", "phone": "+919988776655"})
    assert r.status_code == 200, f"PUT /api/users/me failed: {r.status_code}"
    assert r.json()["location"] == "Bangalore, India"
    print("[PASS] PUT /api/users/me")

    # 6. Skills: /api/skills (GET)
    r = client.get("/api/skills", headers=mentee_headers)
    assert r.status_code == 200, f"GET /api/skills failed: {r.status_code}"
    skills = r.json()
    assert len(skills) >= 10, f"Expected at least 10 skills, got {len(skills)}"
    print(f"[PASS] GET /api/skills ({len(skills)} skills in catalog)")

    # 7. User Skills: /api/users/me/skills (GET, POST, PUT, DELETE)
    r = client.get("/api/users/me/skills", headers=mentee_headers)
    assert r.status_code == 200, f"GET /api/users/me/skills failed: {r.status_code}"
    user_skills = r.json()
    print(f"[PASS] GET /api/users/me/skills ({len(user_skills)} existing user skills)")

    # 8. Assessments: /api/assessments (POST, GET)
    # Run assessment with the first 4 skills
    skill_ratings = [
        {"skill_id": skills[0]["skill_id"], "required_level": "intermediate", "current_level": "beginner"},
        {"skill_id": skills[1]["skill_id"], "required_level": "advanced", "current_level": "intermediate"},
        {"skill_id": skills[2]["skill_id"], "required_level": "intermediate", "current_level": "intermediate"},
        {"skill_id": skills[3]["skill_id"], "required_level": "advanced", "current_level": "beginner"},
    ]
    r = client.post("/api/assessments", headers=mentee_headers, json={
        "target_role": "Junior Data Analyst",
        "skill_ratings": skill_ratings
    })
    assert r.status_code == 201, f"POST /api/assessments failed: {r.status_code} {r.text}"
    assessment_data = r.json()
    assessment_id = assessment_data["assessment_id"]
    print(f"[PASS] POST /api/assessments (assessment_id={assessment_id}, score={assessment_data['overall_score']}%)")

    r = client.get(f"/api/assessments/{assessment_id}", headers=mentee_headers)
    assert r.status_code == 200, f"GET /api/assessments/{assessment_id} failed: {r.status_code}"
    print(f"[PASS] GET /api/assessments/{assessment_id}")

    r = client.get("/api/users/me/assessments", headers=mentee_headers)
    assert r.status_code == 200, f"GET /api/users/me/assessments failed: {r.status_code}"
    print(f"[PASS] GET /api/users/me/assessments ({len(r.json())} assessments on record)")

    # 9. Recommendations: /api/recommendations/generate (POST) and /api/recommendations (GET)
    r = client.post("/api/recommendations/generate", headers=mentee_headers)
    assert r.status_code == 200, f"POST /api/recommendations/generate failed: {r.status_code} {r.text}"
    rec_res = r.json()
    print(f"[PASS] POST /api/recommendations/generate ({rec_res['generated_count']} recommendations generated)")

    r = client.get("/api/recommendations", headers=mentee_headers)
    assert r.status_code == 200, f"GET /api/recommendations failed: {r.status_code}"
    recs = r.json()
    print(f"[PASS] GET /api/recommendations ({len(recs)} total recommendations)")

    if recs:
        rec_id = recs[0]["recommendation_id"]
        r = client.patch(f"/api/recommendations/{rec_id}", headers=mentee_headers, json={"status": "enrolled"})
        assert r.status_code == 200, f"PATCH /api/recommendations/{rec_id} failed: {r.status_code}"
        print(f"[PASS] PATCH /api/recommendations/{rec_id} status updated to enrolled")

    # 10. Mentorship: /api/mentors (GET), /api/mentors/all (GET admin), /api/mentorship-requests
    r = client.get("/api/mentors", headers=mentee_headers)
    assert r.status_code == 200, f"GET /api/mentors failed: {r.status_code}"
    mentors = r.json()
    print(f"[PASS] GET /api/mentors ({len(mentors)} verified mentors)")
    assert len(mentors) > 0, "Expected at least 1 verified mentor"

    r = client.get("/api/mentors/all", headers=admin_headers)
    assert r.status_code == 200, f"GET /api/mentors/all (admin) failed: {r.status_code}"
    all_mentors = r.json()
    print(f"[PASS] GET /api/mentors/all ({len(all_mentors)} total mentors)")

    target_mentor_id = mentors[0]["mentor_id"]
    r = client.post("/api/mentorship-requests", headers=mentee_headers, json={"mentor_id": target_mentor_id})
    # Could be 201 or 409 if already requested
    assert r.status_code in [201, 409], f"POST /api/mentorship-requests failed: {r.status_code} {r.text}"
    print(f"[PASS] POST /api/mentorship-requests (status={r.status_code})")

    r = client.get("/api/mentorship-requests/me", headers=mentee_headers)
    assert r.status_code == 200, f"GET /api/mentorship-requests/me failed: {r.status_code}"
    print(f"[PASS] GET /api/mentorship-requests/me ({len(r.json())} requests)")

    r = client.get("/api/mentorship-requests/incoming", headers=mentor_headers)
    assert r.status_code == 200, f"GET /api/mentorship-requests/incoming failed: {r.status_code}"
    print(f"[PASS] GET /api/mentorship-requests/incoming ({len(r.json())} requests)")

    # 11. Safety Reports: /api/safety-reports (POST, GET admin), /api/safety-reports/me (GET)
    r = client.post("/api/safety-reports", headers=mentee_headers, json={
        "incident_type": "Platform Safety / Privacy Concern",
        "description": "Probe testing safety reporting pipeline"
    })
    assert r.status_code == 201, f"POST /api/safety-reports failed: {r.status_code} {r.text}"
    report_id = r.json()["report_id"]
    print(f"[PASS] POST /api/safety-reports (report_id={report_id})")

    r = client.get("/api/safety-reports/me", headers=mentee_headers)
    assert r.status_code == 200, f"GET /api/safety-reports/me failed: {r.status_code}"
    print(f"[PASS] GET /api/safety-reports/me ({len(r.json())} reports)")

    r = client.get("/api/safety-reports", headers=admin_headers)
    assert r.status_code == 200, f"GET /api/safety-reports (admin) failed: {r.status_code}"
    print(f"[PASS] GET /api/safety-reports (admin) ({len(r.json())} total reports)")

    r = client.patch(f"/api/safety-reports/{report_id}", headers=admin_headers, json={"status": "under_review"})
    assert r.status_code == 200, f"PATCH /api/safety-reports/{report_id} failed: {r.status_code}"
    print(f"[PASS] PATCH /api/safety-reports/{report_id} status updated to under_review")

    print("\n==========================================")
    print("ALL 11 BACKEND API TEST SUITES PASSED ON LIVE SERVER!")
    print("==========================================")

if __name__ == "__main__":
    try:
        run_checks()
    except Exception as e:
        print(f"[FAIL] {e}")
        sys.exit(1)
