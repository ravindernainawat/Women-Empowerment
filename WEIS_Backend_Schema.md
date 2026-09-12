# Backend Schema Reference
## Women Empowerment & Inclusion System (WEIS) — Tier 1

| | |
|---|---|
| **Version** | 1.0 |
| **Engine** | MySQL 8.0+ |
| **Source files** | `weis_schema.sql` (DDL), `weis_er_diagram.mermaid` (ER diagram), `app/models.py` (ORM mirror) |

---

## 1. Scope

10 core tables covering identity, the skill-gap pipeline, the recommendation
engine, mentorship, and safety reporting. This is deliberately a subset of
the full 39-table platform blueprint — see `WEIS_PRD.md` Section 5 for what
is explicitly out of scope this semester.

## 2. Entity Overview

```
users ──┬── user_skills ── skills
        ├── skill_gap_assessments ── assessment_gap_details ── skills
        ├── recommendations ── courses ── skills
        ├── mentors ── mentorship_requests
        └── safety_reports
```

Full visual ER diagram: `weis_er_diagram.mermaid`.

## 3. Data Dictionary

### 3.1 `users`
| Column | Type | Notes |
|---|---|---|
| user_id | INT PK, AUTO_INCREMENT | |
| full_name | VARCHAR(150) | Required |
| email | VARCHAR(150) | Required, unique |
| password_hash | VARCHAR(255) | bcrypt hash only |
| role | ENUM(mentee, mentor, admin) | Default `mentee` |
| phone | VARCHAR(20) | Optional |
| location | VARCHAR(150) | Optional |
| created_at / updated_at | TIMESTAMP | Auto-managed |

### 3.2 `skills`
| Column | Type | Notes |
|---|---|---|
| skill_id | INT PK | |
| skill_name | VARCHAR(100) | Unique |
| category | VARCHAR(100) | e.g. "Technical", "Communication" |

### 3.3 `user_skills`
Join table: a user's current skill inventory.
| Column | Type | Notes |
|---|---|---|
| user_skill_id | INT PK | |
| user_id | INT FK → users | ON DELETE CASCADE |
| skill_id | INT FK → skills | ON DELETE CASCADE |
| proficiency_level | ENUM(beginner, intermediate, advanced) | Default `beginner` |
| — | UNIQUE(user_id, skill_id) | One row per user/skill pair |

### 3.4 `skill_gap_assessments`
One assessment run against a target role.
| Column | Type | Notes |
|---|---|---|
| assessment_id | INT PK | |
| user_id | INT FK → users | ON DELETE CASCADE |
| target_role | VARCHAR(150) | Required |
| overall_score | DECIMAL(5,2) | Computed readiness score |
| assessed_at | TIMESTAMP | Auto-set |

### 3.5 `assessment_gap_details`
Per-skill breakdown of a single assessment.
| Column | Type | Notes |
|---|---|---|
| gap_detail_id | INT PK | |
| assessment_id | INT FK → skill_gap_assessments | ON DELETE CASCADE |
| skill_id | INT FK → skills | ON DELETE CASCADE |
| required_level | ENUM(beginner, intermediate, advanced) | Required |
| current_level | ENUM(beginner, intermediate, advanced) | Default `beginner` |
| gap_score | DECIMAL(5,2) | Computed |

### 3.6 `courses`
Learning content catalog feeding the recommendation engine.
| Column | Type | Notes |
|---|---|---|
| course_id | INT PK | |
| title | VARCHAR(200) | Required |
| provider | VARCHAR(150) | Optional |
| skill_id | INT FK → skills | ON DELETE SET NULL |
| url | VARCHAR(255) | Optional |
| duration_hours | INT | Optional |

### 3.7 `recommendations`
Output of the recommendation engine for a given user.
| Column | Type | Notes |
|---|---|---|
| recommendation_id | INT PK | |
| user_id | INT FK → users | ON DELETE CASCADE |
| course_id | INT FK → courses | ON DELETE CASCADE |
| match_score | DECIMAL(5,2) | |
| recommended_at | TIMESTAMP | Auto-set |
| status | ENUM(pending, viewed, enrolled, completed) | Default `pending` |

### 3.8 `mentors`
Mentor profile extension of a `users` row.
| Column | Type | Notes |
|---|---|---|
| mentor_id | INT PK | |
| user_id | INT FK → users | Unique, ON DELETE CASCADE |
| expertise_area | VARCHAR(150) | |
| bio | TEXT | |
| is_verified | BOOLEAN | Default `FALSE`; admin-gated |

### 3.9 `mentorship_requests`
Mentee ↔ mentor matching workflow.
| Column | Type | Notes |
|---|---|---|
| request_id | INT PK | |
| mentee_id | INT FK → users | ON DELETE CASCADE |
| mentor_id | INT FK → mentors | ON DELETE CASCADE |
| status | ENUM(pending, accepted, declined, completed) | Default `pending` |
| requested_at | TIMESTAMP | Auto-set |

### 3.10 `safety_reports`
Safety-pillar incident reporting. Most access-sensitive table in the system
(see `WEIS_TRD.md` Section 7).
| Column | Type | Notes |
|---|---|---|
| report_id | INT PK | |
| user_id | INT FK → users | ON DELETE CASCADE |
| incident_type | VARCHAR(150) | Required |
| description | TEXT | Required |
| status | ENUM(submitted, under_review, resolved, dismissed) | Default `submitted` |
| reported_at | TIMESTAMP | Auto-set |

## 4. Indexing

| Index | Table | Purpose |
|---|---|---|
| `idx_recommendations_user` | recommendations(user_id) | Fast lookup of a user's recommendation feed |
| `idx_assessments_user` | skill_gap_assessments(user_id) | Fast lookup of assessment history |
| `idx_safety_reports_user` | safety_reports(user_id) | Fast lookup of a user's own reports |
| `idx_courses_skill` | courses(skill_id) | Recommendation engine lookups by skill |

## 5. Referential Integrity Rules

- All foreign keys are enforced at the database level (`FOREIGN_KEY_CHECKS`
  is on) — no orphaned rows are possible even if the application layer has
  a bug.
- `ON DELETE CASCADE` is used where a dependent record has no meaning
  without its parent (e.g. a `user_skills` row without its `user`).
- `ON DELETE SET NULL` is used exactly once, for `courses.skill_id`, since a
  course can remain in the catalog even if its tagged skill is later
  removed.

## 6. Files in This Deliverable Set

| File | Purpose |
|---|---|
| `weis_schema.sql` | Executable MySQL DDL — run this against a fresh database |
| `weis_er_diagram.mermaid` | Visual ER diagram |
| `WEIS_Backend_Schema.md` | This document — human-readable data dictionary |
| `app/models.py` (backend scaffold) | SQLAlchemy ORM mirror of this schema |
