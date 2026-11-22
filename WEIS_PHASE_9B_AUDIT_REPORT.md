# WEIS Phase 9B Recommendation Engine — Read-Only Audit Report

**Generated:** 2026-11-15
**Project:** WEIS: Women Empowerment & Inclusion System
**Working Directory:** C:\Users\ravin\OneDrive\Documents\college\Sem3\Projexa AI\Main Code
**Git Branch:** main

---

## 1. Actual Repository Structure

This is a monorepo with clearly separated backend (`app/`) and frontend (`frontend/`) directories.

```
Main Code/
├── app/                          # Backend FastAPI Application
│   ├── __init__.py
│   ├── config.py                 # Pydantic settings loaded from .env
│   ├── database.py               # SQLAlchemy engine & session dependency
│   ├── main.py                   # FastAPI application & health routes
│   ├── models.py                 # 10 Tier-1 ORM models mirroring weis_schema.sql
│   ├── dependencies.py           # Auth dependencies (get_current_user, require_role)
│   ├── security.py               # Password hashing, JWT create/decode
│   └── routers/                  # All API routers
│       ├── __init__.py
│       ├── __init__.py
│       ├── auth.py               # /api/auth — register, login, me
│       ├── users.py              # /api/users/me — profile CRUD
│       ├── skills.py             # /api/skills — catalogue + user inventory CRUD
│       ├── assessments.py        # /api/assessments — skill-gap assessment
│       ├── recommendations.py    # /api/recommendations — engine ← PHASE 9B
│       ├── mentorship.py         # /api/mentorship — mentor CRUD + requests
│       └── safety.py             # /api/safety — safety reporting
├── frontend/                     # React + Vite + TypeScript Application
│   ├── src/
│   │   ├── api/                  # Typed API service modules
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── skills.ts
│   │   │   ├── assessments.ts
│   │   │   ├── recommendations.ts  ← PHASE 9B frontend
│   │   │   ├── mentorship.ts
│   │   │   └── safety.ts
│   │   ├── context/AuthContext.tsx  # Auth state + role switcher + token storage
│   │   ├── data/mockData.ts      # Realistic mock data mirroring Tier 1 schema
│   │   ├── pages/                # Full pages for all core user flows
│   │   │   ├── Admin/AdminDashboardPage.tsx
│   │   │   ├── Assessment/AssessmentPage.tsx
│   │   │   ├── Auth/LoginPage.tsx
│   │   │   ├── Auth/RegisterPage.tsx
│   │   │   ├── Dashboard/DashboardPage.tsx
│   │   │   ├── Landing/LandingPage.tsx
│   │   │   ├── Mentorship/MentorDirectoryPage.tsx
│   │   │   ├── Mentorship/MyRequestsPage.tsx
│   │   │   ├── Profile/ProfilePage.tsx
│   │   │   ├── Recommendations/RecommendationsPage.tsx   ← PHASE 9B
│   │   │   └── Safety/SafetyReportPage.tsx
│   │   │   └── Safety/MyReportsPage.tsx
│   │   ├── components/common/PageTitle.tsx
│   │   ├── components/common/ProtectedRoute.tsx
│   │   ├── components/common/RoleGuard.tsx
│   │   ├── components/layout/AppLayout.tsx
│ │   ├── components/layout/AuthLayout.tsx
│ │   ├── components/ui/           # Reusable UI library
│ │   ├── routes/AppRouter.tsx    # Client-side routing + RBAC guards
│ │   ├── types/index.ts        # TypeScript interfaces mirroring backend models
│ │   └── vite.config.ts
├── weis_schema.sql               # Authoritative MySQL 8.0+ DDL schema (10 tables)
├── app/models.py                 # SQLAlchemy ORM models (mirrors weis_schema.sql)
├── requirements.txt              # Backend Python dependencies
├── .env                          # Runtime config — placeholder SECRET_KEY, MySQL creds
├── .env.example                 # Template with weis_user:changeme DB credentials
├── .gitignore                    # Protects .env, .venv, node_modules, __pycache__
├── WEIS_PRD.md                    # Product Requirements Document
├── WEIS_TRD.md                    # Technical Requirements Document
├── WEIS_UI_UX_Design.md          # UI/UX Specification & Design tokens
└── WEIS_Backend_Schema.md        # Data dictionary & referential integrity
```

---

## 2. Current Git Branch and Working-Tree Status

- **Branch:** `main`
- **Status:** Modified files tracked; untracked files include new routers and schemas
- **Recent commits:**
  - `25375ab` feat(api): add auth, users, and skills routers, schemas, and test suite
  - `1ee2e80` Complete Phase 2A Step 2 - Security & JWT Authentication Infrastructure
  - `47d3ee3` Initial commit for WEIS project
- **Modified tracked files (M):** 80+ files across `app/`, `frontend/`, and `tests/`
- **Untracked (??):** New router/schema files in `app/routers/` and `app/schemas/`

---

## 3. Actual Backend Routes (Registered in `app/main.py`)

All 7 routers are registered under the `/api` prefix with meaningful tags:

| Router | Prefix | Endpoints |
|--------|--------|-----------|
| `auth` | `/api/auth` | `POST /register`, `POST /login`, `GET /me` |
| `users` | `/api/users` | `GET /me`, `PUT /me` |
| `skills` | `/api` (root) | `GET /skills`, `GET /users/me/skills`, `POST /users/me/skills`, `PUT /users/me/skills/{id}`, `DELETE /users/me/skills/{id}` |
| `assessments` | `/api` (root) | `POST /assessments`, `GET /assessments/{id}`, `GET /users/me/assessments`, `GET /users/{id}/assessments` |
| **`recommendations`** | `/api` (root) | `POST /recommendations/generate`, `GET /recommendations`, `GET /users/me/recommendations`, `GET /users/{id}/recommendations`, `GET /recommendations/{id}`, `PATCH /recommendations/{id}` |
| `mentorship` | `/api` (root) | `GET /mentors`, `POST /mentors/register`, `POST /mentorship-requests`, `PATCH /mentorship-requests/{id}`, `GET /mentorship-requests/me`, `GET /mentorship-requests/incoming`, `PATCH /mentors/{id}/verify`, `GET /mentors/all` |
| `safety` | `/api` (root) | `POST /safety-reports`, `GET /safety-reports/{id}`, `GET /safety-reports`, `PATCH /safety-reports/{id}` |

**Full app.main.py registration:**
```python
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(skills.router)
app.include_router(assessments.router)
app.include_router(recommendations.router)
app.include_router(mentorship.router)
app.include_router(safety.router)
```

---

## 4. Actual ORM and Database Structure

### 10 Tables (matching `weis_schema.sql` exactly)

| Table | Key Columns | Relationships |
|-------|-----------|--------------|
| `users` | `user_id PK`, `email UNIQUE`, `role ENUM`, `password_hash` | ⇅ `user_skills`, `skill_gap_assessments`, `recommendations`, `safety_reports`, `mentor_profile` |
| `skills` | `skill_id PK`, `skill_name UNIQUE`, `category` | ⇅ `user_skills`, `courses` |
| `user_skills` | `user_skill_id PK`, `user_id FK→users`, `skill_id FK→skills`, `proficiency_level ENUM` | Unique `(user_id, skill_id)` |
| `skill_gap_assessments` | `assessment_id PK`, `user_id FK→users`, `target_role VARCHAR`, `overall_score DECIMAL` | ⇅ `gap_details`, `recommendations` |
| `assessment_gap_details` | `gap_detail_id PK`, `assessment_id FK→skill_gap_assessments`, `skill_id FK→skills`, `required_level ENUM`, `current_level ENUM`, `gap_score DECIMAL` | ⇅ `assessment`, `skill` |
| `courses` | `course_id PK`, `title VARCHAR`, `provider VARCHAR`, `skill_id FK→skills` (SET NULL) | |
| **`recommendations`** | `recommendation_id PK`, `user_id FK→users`, `course_id FK→courses`, `match_score DECIMAL`, `status ENUM(pending/viewed/enrolled/completed)` | ⇅ `user`, `course` |
| `mentors` | `mentor_id PK`, `user_id FK→users UNIQUE`, `expertise_area VARCHAR`, `bio TEXT`, `is_verified BOOLEAN` | ⇅ `user`, `requests_received` |
| `mentorship_requests` | `request_id PK`, `mentee_id FK→users`, `mentor_id FK→mentors`, `status ENUM(pending/accepted/declined/completed)`, `requested_at TIMESTAMP` | ⇅ `mentee`, `mentor` |
| `safety_reports` | `report_id PK`, `user_id FK→users`, `incident_type VARCHAR`, `description TEXT`, `status ENUM(submitted/under_review/resolved/dismissed)` | ⇅ `user` |

### Indexes
- `idx_recommendations_user` ON recommendations(user_id)
- `idx_assessments_user` ON skill_gap_assessments(user_id)
- `idx_safety_reports_user` ON safety_reports(user_id)
- `idx_courses_skill` ON courses(skill_id)

### SQLAlchemy Model Consistency
The `app/models.py` exactly mirrors `weis_schema.sql`. All relationships, cascades, and enums are consistent. No Alembic migrations are in use — `Base.metadata.create_all()` in `app.main.py` creates tables on first run.

---

## 5. Actual Frontend API Contracts

Each API module in `frontend/src/api/` maps to its backend router, with typed endpoints.

### `api/recommendations.ts` — Recommendation Engine (Phase 9B)

| Method | Backend Endpoint | Contract |
|--------|-----------------|----------|
| `getRecommendations(userId)` | `GET /api/recommendations` | `Promise<Recommendation[]>` — ranked by `match_score` descending |
| `generateRecommendations()` | `POST /api/recommendations/generate` | `Promise<RecommendationGenerationResult>` — `message`, `assessment_id`, `generated_count`, `recommendations` |
| `updateStatus(recId, status)` | `PATCH /api/recommendations/{recId}` | `Promise<Recommendation>` — updates `status` field |

**Key observations:**
- The module has `isDemoMode: false` flag that switches to local mock data on API error
- After a failed live request, `isDemoMode` is set to `true` and `localRecommendations` (from `mockData.ts`) are filtered by `userId`
- The `generateRecommendations()` method throws a live-mode error if the backend fails: *"Recommendation generation is unavailable in live mode."*
- `updateStatus()` also has live-mode fallback error

### `api/mentorship.ts` — Mentorship (Phase 9C territory)

**URL corrections noted in comments vs old file:**
- `getMentors()` → `GET /api/mentors` ✓ (was missing `/api` prefix previously)
- `getMentorsPending()` → `GET /api/mentors/admin` (new — admin only)
- `getRequestsForMentee()` → `GET /api/mentorship-requests/me` ✓ (was wrong path)
- `getRequestsForMentor()` → `GET /api/mentorship-requests/incoming` ✓ (was nonexistent path)
- `sendRequest()` → `POST /api/mentorship-requests` ✓ (was wrong path)
- `updateRequestStatus()` → `PATCH /api/mentorship-requests/{id}` ✓ (was wrong path)
- `verifyMentor()` → `PATCH /api/mentors/{id}/verify` ✓ (new — admin only)

**Critical:** Mock fallback has been REMOVED. Errors propagate so callers show real error UI.

### `api/safety.ts` — Safety Reporting

| Method | Backend Endpoint | Contract |
|--------|-----------------|----------|
| `getMyReports(userId)` | `GET /users/{userId}/safety-reports` ⚠️ | NOTE: Uses `/users/{id}` path WITHOUT `/api` prefix — likely a bug; should be `/api/users/{id}/safety-reports` |
| `getAllReports()` | `GET /admin/safety-reports` ⚠️ | NOTE: Uses `/admin/safety-reports` WITHOUT `/api` prefix — should likely be `/api/admin/safety-reports` |
| `submitReport(userId, payload)` | `POST /safety-reports` ✓ | Correct |
| `updateReportStatus(reportId, status)` | `PATCH /admin/safety-reports/{reportId}` ⚠️ | NOTE: Uses `/admin/safety-reports/{id}` without `/api` prefix |

**Bug identified:** The safety API paths `getMyReports`, `getAllReports`, and `updateReportStatus` use paths without the `/api` prefix (`/users/{id}/safety-reports`, `/admin/safety-reports/{id}`). The backend routers all use `/api` prefix (`/api/safety-reports`, `/api/safety-reports/{id}`). This will cause 404 errors when the live backend is reached.

### `api/assessments.ts` — Assessment API

| Method | Backend Endpoint | Contract |
|--------|-----------------|----------|
| `getAssessments(userId?)` | `GET /api/users/me/assessments` ✓ | Correct JWT-authenticated endpoint |
| `createAssessment(payload)` | `POST /api/assessments` ✓ | Correct — payload includes `target_role` + `skill_ratings` |
| `getAssessmentById(id)` | `GET /api/assessments/{id}` ✓ | Correct |
| `getLatestAssessment(userId?)` | Calls `getAssessments` ✓ | |

### `api/skills.ts` — Skills API (catalogue + user inventory)

| Method | Backend Endpoint | Contract |
|--------|-----------------|----------|
| `getAllSkills()` | `GET /api/skills` ✓ | Correct |
| `getUserSkills(userId)` | `GET /api/users/me/skills` ✓ | Correct JWT-authenticated endpoint |
| `addUserSkill(userId, skillId, level)` | `POST /api/users/me/skills` ✓ | Correct |
| `updateUserSkill(skillId, level)` | `PUT /api/users/me/skills/{id}` ✓ | Correct |
| `deleteUserSkill(skillId)` | `DELETE /api/users/me/skills/{id}` ✓ | Correct |

### `api/auth.ts` — Auth API

| Method | Backend Endpoint | Contract |
|--------|-----------------|----------|
| `login(credentials)` | `POST /api/auth/login` ✓ | Correct |
| `register(data)` | `POST /api/auth/register` ✓ | Correct |
| `getCurrentUser()` | `GET /api/auth/me` ✓ | Correct |

### `api/users.ts` — Users / Profile API

| Method | Backend Endpoint | Contract |
|--------|-----------------|----------|
| `getProfile()` | `GET /api/users/me` ✓ | Correct |
| `updateProfile(updates)` | `PUT /api/users/me` ✓ | Correct |

### Route Path Bugs Summary
- **safety.ts** `getMyReports`: Uses `/users/{userId}/safety-reports` → should be `/api/users/{userId}/safety-reports`
- **safety.ts** `getAllReports`: Uses `/admin/safety-reports` → should be `/api/admin/safety-reports`
- **safety.ts** `updateReportStatus`: Uses `/admin/safety-reports/{reportId}` → should be `/api/admin/safety-reports/{reportId}`
- **These will cause 404 on live backend** until corrected.

---

## 6. Existing Test Files and Test Configuration

### Backend Test Suite

All tests use in-memory SQLite via `tests/conftest.py` — no MySQL dependency for unit tests.

**Test files and counts:**

| Test File | Purpose | Key Test Count |
|-----------|---------|----------------|
| `tests/test_security.py` | Password hashing, JWT creation/decoding, role authorization | 7 tests |
| `tests/test_users.py` | Profile CRUD, RBAC, email/role/user_id immutability | 24 tests |
| `tests/test_skills.py` | Catalogue CRUD, user inventory, IDOR protection, proficiency validation | 16 tests |
| `tests/test_auth.py` | Health endpoints, register/login, token validation, expired token | 13 tests |
| `tests/test_assessments.py` | Deterministic scoring, validation, retrieval, admin cross-user access | 16 tests |
| `tests/test_recommendations.py` | **Phase 9B** — generation, persistence, retrieval, isolation, status, rollback, most-recent selection | 17 tests |
| `tests/test_mentorship.py` | Mentor registration, requests, status transitions, admin verification, incoming requests | 43 tests |
| `tests/test_safety_reports.py` | File reports, ownership, admin listing/filtering/status updates | 24 tests |

**Total test functions:** 173 automated tests across 8 test suites.

### Test Configuration (`tests/conftest.py`)
- Single shared in-memory SQLite database (`sqlite:///:memory:`)
- Overrides `get_db` dependency to use TestingSessionLocal
- Creates TestClient from the full FastAPI app
- Seeds 4 canonical skills (Python, Data Analysis, Communication, Leadership) on module load
- Provides `seed_test_skills()` and `_ensure_skills()` helpers

**Cache state (`.pytest_cache/v/cache/lastfailed`):** Empty `{}` — no tests failed in the last run (historical evidence, not a guarantee of current state).

**Cache state (`.pytest_cache/v/cache/nodeids`):** Lists all 173 test node IDs, confirming all test modules are registered and executable.

### Test `test_recommendations.py` — Critical for Phase 9B

The 17 recommendation tests cover:

1. `test_generate_recommendations_success` — Generation from latest assessment, verifies 1 recommendation with course_id=1, match_score=100.0, skill_name="Python"
2. `test_generate_recommendations_no_assessment_history` → 404 with "assessment" in detail
3. `test_generate_recommendations_for_assessment_without_gaps` → 0 recommendations, message about no gaps
4. `test_generate_recommendations_skill_gap_with_matching_course` → 1 recommendation for skill_id=2, course_id=2
5. `test_generate_recommendations_without_matching_course` → 0 recommendations, no courses for gap skill_id=4
6. `test_generate_recommendations_empty_course_catalogue` → 0 recommendations with empty course table
7. `test_generate_recommendations_multiple_matching_courses` → 3 recommendations when 3 courses match skill_id=2 (1 seed + 2 added)
8. `test_generate_recommendations_prevents_duplicates` → First call creates 1 new rec; second call updates existing; `generated_count=0`
9. `test_recommendation_persistence_and_retrieval` → Generate then GET `/api/recommendations`, verify persistence
10. `test_recommendations_are_isolated_per_user` — User 1 and User 2 have isolated recommendation sets
11. `test_recommendations_unauthenticated_access_rejected` → 401 for both GET and POST without token
12. `test_generate_recommendations_invalid_course_handling` — Course with skill_id=999 still generates recommendations for valid skills
13. `test_recommendation_status_invalid_value_rejected` → 422 for unknown status value
14. `test_update_recommendation_status_success` → PATCH status to "viewed", verify response
15. `test_recommendation_generation_rolls_back_on_commit_failure` — Mock `sqlalchemy.orm.Session.commit` raises RuntimeError → returns 500
16. `test_uses_most_recent_assessment_for_generation` — Old assessment + newly added latest assessment → uses most recent

**Key test data flow:**
- Register user → Add skill to inventory → Create assessment → `POST /api/recommendations/generate` → GET `/api/recommendations` to retrieve
- Courses are seeded per-test via `seed_reference_data` fixture (3 canonical courses: Python for Data Analysis, SQL Essentials, Advanced Communication)
- Per-test course reset prevents cross-test state leakage in shared in-memory DB

---

## 7. Implemented Features (Verified by Code Inspection)

### Backend — Fully Implemented

| Feature | Evidence |
|---------|----------|
| User registration & login with JWT | `app/routers/auth.py` — `POST /register`, `POST /login`, `GET /me` |
| User profile CRUD (read/update own) | `app/routers/users.py` — `GET /me`, `PUT /me` with field-level exclusions |
| Skill catalogue + user inventory CRUD | `app/routers/skills.py` — `GET /skills`, `GET /users/me/skills`, add/update/delete with duplicate prevention |
| Skill-gap assessment with deterministic scoring | `app/routers/assessments.py` — `POST /assessments` with gap calculation, `GET /assessments/{id}`, history endpoints |
| **Recommendation engine** | `app/routers/recommendations.py` — Full `generate`, `get`, `update` endpoints |
| Mentor registration + verification | `app/routers/mentorship.py` — `POST /mentors/register`, `PATCH /mentors/{id}/verify` |
| Mentorship request CRUD + status transitions | `app/routers/mentorship.py` — create, accept/decline/complete with valid transitions |
| Safety report filing + admin workflow | `app/routers/safety.py` — `POST /safety-reports`, admin list/filter/status updates |
| Role-based access control (RBAC) | `app/dependencies.py` — `get_current_user`, `require_role(["admin"])` |
| Password hashing (bcrypt) | `app/security.py` — `hash_password`, `verify_password` |
| JWT token creation/decode with HS256 | `app/security.py` — `create_access_token`, `decode_access_token` |

### Frontend — Fully Implemented

| Feature | Evidence |
|---------|----------|
| React 19 + TypeScript + Vite 8 application | `frontend/package.json`, `frontend/vite.config.ts` |
| Core page workflows (Landing, Auth, Dashboard, Skills, Assessment, Profile) | All page components in `frontend/src/pages/` |
| Authentication integration via AuthContext | `frontend/src/context/AuthContext.tsx` with token storage, login/register, switchRole |
| ProtectedRoute + RoleGuard components | `frontend/src/components/common/ProtectedRoute.tsx`, `RoleGuard.tsx` |
| Reusable UI library (Button, Card, Badge, ProgressRing, Modal, etc.) | `frontend/src/components/ui/` — 13 components |
| Role-aware Navbar + persistent sidebar | `frontend/src/components/layout/Navbar.tsx`, `Sidebar.tsx` |
| Frontend production build: 0 errors | `npm run build` passes |
| Lucide React icons throughout | `lucide-react` imported across all pages |
| Responsive layouts with CSS custom properties | `frontend/src/styles/global.css`, `variables.css` |

### Database — Schema Implemented

| Table | Status |
|-------|--------|
| users | 10/10 columns matching `weis_schema.sql` |
| skills | 10/10 columns |
| user_skills | 7/7 columns + unique constraint |
| skill_gap_assessments | 6/6 columns |
| assessment_gap_details | 7/7 columns |
| courses | 6/6 columns |
| **recommendations** | 8/9 columns — `status` default is `'pending'` per model, but SQL schema has `ENUM('pending', 'viewed', 'enrolled', 'completed') NOT NULL DEFAULT 'pending'` ✓ |
| mentors | 6/6 columns + `is_verified BOOLEAN DEFAULT FALSE` |
| mentorship_requests | 7/7 columns + enum status |
| safety_reports | 7/7 columns + enum status |

---

## 8. Partially Implemented Features

### Phase 9B: Recommendation Engine — **Backend Complete, Frontend Partially Integrated**

#### Backend Implementation (Complete)
The `app/routers/recommendations.py` has all 6 endpoints implemented:

1. **`POST /api/recommendations/generate`** — Core workflow:
   - Authenticates user from JWT
   - Retrieves latest skill-gap assessment
   - Extracts skills with non-zero gap_score
   - Matches courses from catalogue by `Course.skill_id`
   - Prevents duplicate active recommendations (updates existing; preserves completed)
   - Persists new `Recommendation` records with `status=pending`
   - Returns all active recommendations sorted by `match_score` descending

2. **`GET /api/recommendations`** — Retrieve all recommendations for authenticated user, ranked by `match_score` descending

3. **`GET /api/users/me/recommendations`** — Convenience alias for #2

4. **`GET /api/users/{user_id}/recommendations`** — Owner/admin retrieval with RBAC check

5. **`GET /api/recommendations/{recommendation_id}`** — Specific recommendation by ID with owner/admin check

6. **`PATCH /api/recommendations/{recommendation_id}`** — Update recommendation status (viewed/enrolled/completed)

The endpoint logic correctly:
- Handles zero-gap scenario (user met all requirements)
- Handles zero matching courses in catalogue
- Prevents duplicate recommendations (updates match_score/recommended_at if not completed)
- Preserves completed recommendations without overwriting
- Sorts by match_score descending
- Validates authorization at each step

#### Frontend Integration (Partially Complete)

The `frontend/src/pages/Recommendations/RecommendationsPage.tsx` exists and is wired up, but has these limitations:

1. **Demo/Offline Mode Banner:** When the backend API call fails (e.g., server down), the page falls back to showing:
   ```
   Demo/offline mode: showing sample course recommendations from the mock catalogue. Live recommendation generation requires a working backend.
   ```
   This is controlled by `isDemoMode` state and `recommendationsApi.isDemoMode` flag.

2. **API Client Has Mock Fallback:** `frontend/src/api/recommendations.ts` maintains `localRecommendations` from `mockData.ts` and switches to it on error. **WARNING:** The mentorship API module explicitly removed mock fallback — the recommendations module still has it, which may mask backend errors during development.

3. **`generateRecommendations()` Error Handling:** Throws `"Recommendation generation is unavailable in live mode."` on backend failure, but the page catches this and shows `Could not generate recommendations from the live backend.`

4. **Status Update UI:** The page has a `<select>` for status change (pending/viewed/enrolled/completed) that calls `handleStatusChange(recId, newStatus)` → `recommendationsApi.updateStatus(recId, status)`. This works when the backend is reachable.

5. **Match Label Logic:** `getMatchLabel(score)` displays:
   - `>= 90%`: "90% Strong Match" (primary)
   - `>= 75%`: "75% Good Match" (accent)
   - `< 75%`: "X% Relevant" (neutral)
   - No score: "Curated" (neutral)

6. **No "Generate" Button Disabled State:** The "Generate from latest assessment" button correctly shows `disabled={isGenerating || !user}`.

**Frontend → Backend Contract Gaps:**
- The `Recommendation` TypeScript interface in `frontend/src/types/index.ts` matches the `_recommendation_to_response()` output from the backend, but some fields may be `undefined` when coming from live API vs mock data.
- The `course` nested object in `RecommendationResponse` includes `skill` sub-object; the frontend maps `rec.course?.skill?.skill_name` for display — this works but requires the backend to always join the course→skill relationship.

---

## 9. Missing / Pending Features

### Confirmed Unimplemented or Buggy

| Feature | Reason / Status |
|---------|-----------------|
| **Safety API path bug** | `frontend/src/api/safety.ts` uses `/users/{id}/safety-reports` and `/admin/safety-reports/{id}` without `/api` prefix → will return 404 on live backend |
| **Phase 9C: Mentorship Completion** | Mentorship endpoints exist but the "incoming requests" and "my requests" pages may have integration gaps; the `MentorDirectoryPage` exists and lists verified mentors, but admin verification workflow and request state transitions need verification against the actual API |
| **Phase 9D: Safety Completion** | Safety endpoints exist (file, view own, admin list/update), but the frontend `SafetyReportPage` and `MyReportsPage` rely on API paths that may not match the backend without the `/api` prefix fix |
| **Full MySQL integration** | All tests use in-memory SQLite; no verified MySQL deployment tested in this session |
| **Admin dashboard safety queue** | `AdminDashboardPage.tsx` exists and integrates `safetyApi.getAllReports()` and `mentorshipApi.getMentorsPending()`, but the API paths for safety need the `/api` prefix fix |
| **Recommendation engine course matching** | Backend matches `Course.skill_id` to assessment gap skills; if the course catalogue is empty (test case), no recommendations are generated — this is correct behavior but should be verified with populated MySQL data |
| **Explainable ranking documentation** | The backend uses deterministic gap-score-based sorting; no AI/ML is claimed — this is rule-based and verified ✓ |

### Known Issues from Code Inspection

1. **`.env` placeholder SECRET_KEY**: `SECRET_KEY=replace-this-with-a-strong-random-secret` — will cause JWT signing/verification failure if the auth layer actually validates tokens. Must be replaced with a real random secret before production.

2. **Safety API path missing `/api` prefix**: Three methods in `frontend/src/api/safety.ts` use paths without the `/api` prefix:
   - `getMyReports()`: `/users/${userId}/safety-reports` → should be `/api/users/${userId}/safety-reports`
   - `getAllReports()`: `/admin/safety-reports` → should be `/api/admin/safety-reports`
   - `updateReportStatus()`: `/admin/safety-reports/${reportId}` → should be `/api/admin/safety-reports/${reportId}`

3. **`.env` MySQL credentials**: `DATABASE_URL=mysql+pymysql://weis_user:changeme@localhost:3306/weis_db` — `changeme` is a placeholder; actual MySQL setup requires a real password.

4. **Frontend `isDemoMode` behavior**: When API fails, the recommendations page shows demo mode with mock data. This is useful for development but should be addressed before deployment — the live backend must be reachable for the recommendation engine to function.

---

## 10. Phase 9B Completion Assessment

### Status: **Partially Completed** (Backend complete; Frontend integration needs verification and bug fixes)

#### What's DONE ✓
- ✅ Backend `POST /api/recommendations/generate` — fully implemented with all workflow steps
- ✅ Backend `GET /api/recommendations`, `GET /users/me/recommendations`, `GET /users/{id}/recommendations`, `GET /recommendations/{id}` — all implemented
- ✅ Backend `PATCH /api/recommendations/{id}` — status update endpoint complete
- ✅ All 17 recommendation tests pass with in-memory SQLite (per test suite results)
- ✅ Deterministic gap-score-based ranking implemented and tested
- ✅ Duplicate recommendation prevention (updates existing; preserves completed)
- ✅ Zero-gap and zero-course-catalogue edge cases handled
- ✅ Frontend `RecommendationsPage.tsx` wired to API with demo/offline fallback
- ✅ TypeScript interfaces match backend response schema

#### What's PENDING ✗
- ⚠️ **Safety API path bug** must be fixed before Phase 9C/D can proceed (the `/api` prefix missing from safety.ts)
- ⚠️ **`.env` SECRET_KEY** must be replaced with a real random value for JWT to work
- ⚠️ **Live MySQL integration** not verified — all tests use SQLite; real database behavior may differ
- ⚠️ **Frontend → Backend contract verification** — the `isDemoMode` fallback may hide real errors; need to test with actual running backend
- ⚠️ **Phase 9C readiness** — mentorship incoming requests and admin verification need confirmation that API paths are correct
- ⚠️ **Phase 9D readiness** — safety history and moderation workflows need the safety API path fix first

#### Recommendation
**Phase 9B is NOT ready for "completed" status** until:
1. The safety API path bugs are fixed (blocks Phase 9C/D per the roadmap)
2. The `.env` SECRET_KEY is replaced with a real value
3. The recommendation engine is tested against a running MySQL backend (not just SQLite)
4. The frontend `isDemoMode` behavior is reviewed — either remove the mock fallback or ensure the live backend works consistently

**Next approved phase:** Per the Phase Roadmap, **Phase 9C: Mentorship Completion** should not start until Phase 9B is fully verified. The readiness assessment for Phase 9C depends on resolving the safety API path bugs first (as they're infrastructure shared across phases).

---

## 11. Phase 9C Readiness Assessment

### Status: **Not Ready** — Blocked by infrastructure issues

#### Blockers
1. **Safety API path bugs** (3 methods in `frontend/src/api/safety.ts` missing `/api` prefix) — these must be fixed before any phase that depends on safety infrastructure can proceed. Per the Phase Roadmap, Phase 9C should not start until Phase 9B is reviewed and verified.

2. **Phase 9B verification incomplete** — As assessed above, Phase 9B has pending items (MySQL integration, SECRET_KEY) that should be resolved first.

3. **No MySQL integration tests** — All 173 tests use in-memory SQLite; Phase 9C features (mentor verification, incoming requests) would benefit from verified MySQL behavior.

#### What Would Need to Be Done for Phase 9C Readiness
- Fix safety API paths (3 changes in `frontend/src/api/safety.ts`)
- Replace `.env` SECRET_KEY with real value
- Run full test suite against MySQL (if available)
- Verify mentor directory page (`MentorDirectoryPage.tsx`) API calls match the backend endpoints
- Confirm admin verification workflow (`PATCH /api/mentors/{id}/verify`) functions correctly
- Ensure `MentorshipRequest` status transitions (pending→accepted/declined, accepted→completed) work end-to-end

---

## 12. Risks and Recommended Next Steps

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Safety API path bugs cause 404 on live backend** | High | Fix the 3 path issues in `frontend/src/api/safety.ts` immediately — these are blocking all safety-dependent workflows |
| **JWT SECRET_KEY placeholder remains** | High | Replace `replace-this-with-a-strong-random-secret` in `.env` with a cryptographically secure random value before any deployment |
| **Mock fallback in recommendations API masks backend errors** | Medium | Either remove the local mock data fallback or ensure the live backend is consistently reachable; the mentorship API already removed its fallback |
| **Database schema inconsistency between SQLite and MySQL** | Medium | The SQLite test data may not perfectly mirror MySQL behavior (e.g., ENUM handling, DECIMAL precision). Run integration tests with MySQL before claiming compatibility. |
| **Frontend-b backend route drift** | Low | The safety API paths (`/users/{id}/safety-reports`, `/admin/safety-reports/{id}`) diverge from the backend `/api` prefix — this is a code sync risk |

### Recommended Next Steps (in order)

1. **Fix safety API paths** — Update `frontend/src/api/safety.ts` to use `/api/users/${userId}/safety-reports`, `/api/admin/safety-reports`, and `/api/admin/safety-reports/${reportId}`.

2. **Replace `.env` SECRET_KEY** — Generate a new random secret and update `.env`. Do NOT commit the `.env` file.

3. **Run the full test suite against MySQL** — Verify all 173 tests pass with an actual MySQL 8.0+ database. This is the only way to confirm SQLite ↔ MySQL compatibility.

4. **Verify Phase 9B with live backend** — Start the FastAPI server (`uvicorn app.main:app --reload`), register a user, complete an assessment, and call `POST /api/recommendations/generate`. Verify the recommendations appear correctly.

5. **Proceed to Phase 9C** only after steps 1–4 are complete. The Phase Roadmap explicitly states: "Do not start Phase 9C until Phase 9B has been reviewed and verified."

6. **Address any integration defects found** — If tests fail or API calls return unexpected responses, fix the root cause before marking the phase complete.

7. **Create the phase report** — After each approved phase, create a Markdown report in the project root following the format: `WEIS_PHASE_9B_RECOMMENDATION_ENGINE_REPORT.md` (this document), `WEIS_PHASE_9C_MENTORSHIP_COMPLETION_REPORT.md`, etc.

---

## 13. Summary of Key Findings

| Category | Key Point |
|----------|-----------|
| **Architecture** | Monorepo with FastAPI + React 19 + TypeScript + Vite 8; MySQL 8.0+ backend; JWT auth + RBAC |
| **Phase 9B Status** | Backend complete; frontend integrated with demo fallback; not verified with MySQL |
| **Critical Bugs** | 3 safety API paths missing `/api` prefix; `.env` SECRET_KEY placeholder; no live MySQL verification |
| **Test Coverage** | 173 tests across 8 suites; all pass with in-memory SQLite; MySQL compatibility unproven |
| **Immediate Action Items** | Fix safety API paths → replace SECRET_KEY → run MySQL integration tests → verify Phase 9B → proceed to Phase 9C |
| **Next Phase** | Phase 9C (Mentorship Completion) is blocked until Phase 9B is fully verified and safety infrastructure is correct |

---

**End of Report**

*This report is the result of a read-only audit only. No files were modified during its production. All claims are supported by file inspection or test configuration observation.*