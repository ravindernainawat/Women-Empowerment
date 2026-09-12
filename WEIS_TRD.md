# Technical Requirements Document (TRD)
## Women Empowerment & Inclusion System (WEIS)

| | |
|---|---|
| **Version** | 1.0 |
| **Scope** | Tier 1 core (see PRD Section 5) |
| **Companion docs** | `WEIS_PRD.md`, `WEIS_Backend_Schema.md`, `weis_schema.sql`, `weis_er_diagram.mermaid` |

---

## 1. Overview

This document specifies the technical architecture, stack, API surface, and
non-functional requirements for WEIS Tier 1. It translates the product
requirements in `WEIS_PRD.md` into an implementable system.

## 2. System Architecture

```
┌──────────────┐        HTTPS/JSON        ┌────────────────────┐        SQL        ┌──────────────┐
│   Frontend    │ ───────────────────────▶ │   FastAPI Backend   │ ─────────────────▶ │  MySQL 8.0+   │
│  (Web client) │ ◀─────────────────────── │  (app/ package)     │ ◀───────────────── │  weis_db      │
└──────────────┘                           └────────────────────┘                     └──────────────┘
                                                     │
                                                     ▼
                                            SQLAlchemy ORM
                                          (app/models.py — 1:1
                                           with weis_schema.sql)
```

- **Client → API:** REST over HTTPS, JSON payloads, JWT-based auth (bearer
  token in `Authorization` header).
- **API → DB:** SQLAlchemy ORM over PyMySQL driver, connection pooling with
  `pool_pre_ping` to avoid stale-connection errors.
- **Single source of truth for schema:** `weis_schema.sql`. `app/models.py`
  mirrors it; divergence is a bug until Alembic migrations are introduced.

## 3. Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Backend framework | FastAPI (Python) | Async-capable, auto OpenAPI docs, fast to build with a small team |
| ORM | SQLAlchemy 2.x | Mature MySQL support, explicit relationship modeling |
| Database | MySQL 8.0+ | Team decision (locked constraint), strong relational/FK support |
| DB driver | PyMySQL | Pure-Python, simplest install path for a student team |
| Auth | JWT (python-jose or equivalent) + bcrypt password hashing | Stateless, standard for REST APIs |
| Migrations | Alembic (introduced post-Tier-1 bootstrap) | Versioned schema evolution |
| Frontend | To be finalized by team (React/Vue candidate) | Not fixed in this TRD version |
| Hosting/dev | Local MySQL + Uvicorn for dev; containerization optional | Matches 4-month academic timeline |

## 4. Database Design

Full detail lives in `WEIS_Backend_Schema.md` and `weis_schema.sql`. Summary:

- 10 Tier 1 core tables: `users`, `skills`, `user_skills`,
  `skill_gap_assessments`, `assessment_gap_details`, `courses`,
  `recommendations`, `mentors`, `mentorship_requests`, `safety_reports`.
- All relationships enforced via `FOREIGN KEY` constraints with explicit
  `ON DELETE` behavior (`CASCADE` for dependent records, `SET NULL` for
  optional references like `courses.skill_id`).
- Indexes added on high-traffic FK lookup columns
  (`recommendations.user_id`, `skill_gap_assessments.user_id`,
  `safety_reports.user_id`, `courses.skill_id`).
- ER diagram: `weis_er_diagram.mermaid`.

## 5. API Design

Base path: `/api/v1`. All endpoints below require a valid JWT unless marked
public. Response bodies are JSON; errors follow a consistent
`{ "detail": "..." }` shape (FastAPI default).

### 5.1 Auth
| Method | Path | Description | Access |
|---|---|---|---|
| POST | `/auth/register` | Create a user account | Public |
| POST | `/auth/login` | Exchange credentials for a JWT | Public |
| GET | `/auth/me` | Current user profile | Authenticated |

### 5.2 Skills
| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/skills` | List skill catalog | Authenticated |
| GET | `/users/{user_id}/skills` | Get a user's skill inventory | Owner/Admin |
| POST | `/users/{user_id}/skills` | Add/update a skill + proficiency | Owner |

### 5.3 Skill-Gap Assessments
| Method | Path | Description | Access |
|---|---|---|---|
| POST | `/assessments` | Run a new assessment against a target role | Owner |
| GET | `/assessments/{assessment_id}` | Get assessment + gap details | Owner/Admin |
| GET | `/users/{user_id}/assessments` | List a user's assessment history | Owner/Admin |

### 5.4 Recommendations
| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/users/{user_id}/recommendations` | Get ranked course recommendations | Owner/Admin |
| PATCH | `/recommendations/{recommendation_id}` | Update status (viewed/enrolled/completed) | Owner |

### 5.5 Mentorship
| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/mentors` | List verified mentors (filterable by expertise) | Authenticated |
| POST | `/mentorship-requests` | Send a mentorship request | Mentee |
| PATCH | `/mentorship-requests/{request_id}` | Accept/decline/complete | Mentor |

### 5.6 Safety
| Method | Path | Description | Access |
|---|---|---|---|
| POST | `/safety-reports` | File a safety report | Authenticated |
| GET | `/safety-reports/{report_id}` | Get a single report | Reporter/Admin |
| GET | `/safety-reports` | List all reports | Admin only |
| PATCH | `/safety-reports/{report_id}` | Update status | Admin only |

### 5.7 Health
| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/` | Service status | Public |
| GET | `/health/db` | DB connectivity check | Public |

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | API responses < 500ms for single-record reads on dev hardware; assessment scoring < 2s |
| **Availability** | Not a hard requirement this semester (academic project); graceful error handling required |
| **Scalability** | Design should not preclude horizontal scaling later; no in-memory session state in the API layer |
| **Data integrity** | All relationships enforced at the DB layer via FK constraints, not just application logic |
| **Auditability** | Timestamp fields (`created_at`, `assessed_at`, `reported_at`, etc.) on all activity-generating tables |

## 7. Security & Privacy

- Passwords stored as bcrypt hashes only — never plaintext, never reversible
  encryption.
- JWT secrets and DB credentials sourced from environment variables
  (`.env`, excluded from version control via `.gitignore`), never hardcoded.
- **Safety reports are the most sensitive data in the system.** Access is
  restricted to the reporting user and admin roles only, enforced at the API
  layer (role check) in addition to normal auth.
- Input validation on all write endpoints via Pydantic schemas to prevent
  malformed or malicious payloads.
- SQL injection risk is mitigated by using the SQLAlchemy ORM exclusively
  (no raw string-interpolated SQL).

## 8. Third-Party Integrations

None required for Tier 1. Course data can be seeded manually or via CSV
import; no external LMS/API integration is in scope this semester.

## 9. Deployment & DevOps

- **Dev environment:** local MySQL instance + `uvicorn app.main:app --reload`.
- **Version control:** GitHub repo at
  `https://github.com/ravindernainawat/Women-Empowerment.git`, with `.env`
  excluded and `.env.example` committed as a template.
- **Environments:** `development` now; `staging`/`production` config
  scaffolding exists in `app/config.py` (`ENV` setting) for future use.
- **CI:** Not required for Tier 1; can be added (lint + basic test run on
  push) if time allows in month 4.

## 10. Testing Strategy

| Level | Approach |
|---|---|
| Unit | Test recommendation scoring logic and gap-score calculation in isolation |
| Integration | Test each router against a test MySQL schema (or SQLite for speed, with MySQL-specific features avoided in test-only code paths) |
| Manual/E2E | Walk through the 5 core user stories from the PRD before each milestone demo |

## 11. Technical Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Schema drift between `models.py` and `weis_schema.sql` | Treat the `.sql` file as source of truth until Alembic is introduced; review both together on any change |
| Team members unfamiliar with FastAPI/SQLAlchemy | Keep Tier 1 endpoint count small (Section 5); pair on the first router before splitting up |
| Safety-report access control bugs | Explicit role checks in that router, covered by dedicated tests before demo |
