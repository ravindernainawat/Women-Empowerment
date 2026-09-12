# Product Requirements Document (PRD)
## Women Empowerment & Inclusion System (WEIS)

| | |
|---|---|
| **Version** | 1.0 |
| **Status** | Draft — Tier 1 scope |
| **Project type** | 4-person B.Tech semester project (4 months) |
| **Repository** | https://github.com/ravindernainawat/Women-Empowerment.git |

---

## 1. Purpose & Vision

WEIS is an integrated platform that helps women identify skill gaps against
target career roles, receive personalized learning recommendations to close
those gaps, connect with mentors, and access a safety-reporting channel — all
within a single system, rather than as disconnected tools.

The long-term vision (beyond this semester's scope) is a full 39-table
blueprint covering community, jobs, funding, and events. This PRD covers only
the **Tier 1 core** slice the team has committed to building this semester.

## 2. Problem Statement

Women re-entering the workforce, switching careers, or upskilling often face
three separate frictions:
1. They don't have a clear, structured picture of *which* skills they're
   missing for a target role.
2. Generic course catalogs don't map back to that specific gap.
3. Mentorship and safety concerns are handled (if at all) through channels
   disconnected from the learning journey itself.

WEIS addresses all three within one product surface.

## 3. Goals & Objectives

- **G1 — Skill clarity:** Let a user assess their current skills against a
  target role and see a quantified gap.
- **G2 — Actionable learning:** Turn that gap into a ranked list of courses,
  not just a diagnosis.
- **G3 — Human support:** Let users request mentorship from verified mentors
  in relevant expertise areas.
- **G4 — Safety:** Give users a structured, trackable way to report safety
  incidents on the platform or in a program.
- **G5 — Ship a working core in one semester:** Tier 1 scope must be
  demo-able end-to-end (signup → assessment → recommendation → mentor
  request → safety report) by the end of the 4-month window.

## 4. Target Users & Personas

| Persona | Description | Primary need |
|---|---|---|
| **Aditi, 27 — Career switcher** | Marketing background, wants to move into data analytics | Structured gap analysis + course path |
| **Rekha, 34 — Returning to work** | 5-year career break, unsure what's changed in her field | Low-friction skill refresh + mentor guidance |
| **Sana, 22 — Recent graduate** | Entry-level job seeker | Role-targeted skill benchmarking |
| **Meera — Mentor** | Mid/senior professional volunteering time | Simple way to accept/manage mentee requests |
| **Admin** | Program coordinator | Visibility into safety reports and platform health |

## 5. Scope

### 5.1 In scope (Tier 1 — this semester)
- User registration/authentication, role-based accounts (mentee, mentor, admin)
- Skill inventory management
- Skill-gap assessment against a target role
- Course catalog and a rules/score-based recommendation engine
- Mentor directory and mentorship request workflow
- Safety incident reporting and status tracking

### 5.2 Out of scope (future tiers)
- Job board / employer integrations
- Funding & grants module
- Community forums / events
- Payments or paid course integrations
- ML-based (vs. rules-based) recommendation engine
- Mobile native apps (web-first for this semester)

## 6. Core Features

### 6.1 Authentication & Profiles
- Email/password signup and login
- Role assignment: mentee, mentor, admin
- Profile fields: name, email, phone, location

### 6.2 Skill Gap Pipeline
- User records current skills + proficiency (beginner/intermediate/advanced)
- User selects a target role and runs an assessment
- System computes a per-skill gap score and an overall readiness score
- Assessment history is retained for progress tracking

### 6.3 Recommendation Engine
- Courses are tagged by the skill they teach
- Engine matches a user's largest gaps to relevant courses and ranks them
  by a match score
- User can mark a recommendation as viewed / enrolled / completed

### 6.4 Mentorship
- Verified mentors list an expertise area and bio
- Mentees send mentorship requests to mentors
- Mentors accept/decline; status is tracked through completion

### 6.5 Safety Reporting
- Any user can file a safety report with an incident type and description
- Reports move through submitted → under_review → resolved/dismissed
- Admin-only visibility into report status changes

## 7. Key User Stories

- *As a mentee*, I want to see which skills I'm missing for "Data Analyst"
  so I know what to learn next.
- *As a mentee*, I want course suggestions ranked by how much they close my
  specific gaps, not a generic catalog.
- *As a mentee*, I want to request a mentor with relevant expertise and
  track whether they've accepted.
- *As a user*, I want to file a safety report confidentially and see that
  it's being reviewed.
- *As an admin*, I want to see all open safety reports in one place.

## 8. Success Metrics (for this semester's demo/evaluation)

| Metric | Target |
|---|---|
| End-to-end flow completes without manual DB edits | 100% of demo scenarios |
| Assessment → recommendation latency | < 2s on local/dev environment |
| Core tables with enforced FK integrity | 10/10 |
| Critical user stories demoable | All 5 listed in Section 7 |

## 9. Assumptions & Constraints

- MySQL is the database engine (team decision, not open for reconsideration
  this semester).
- Team size is 4; scope is deliberately limited to Tier 1 to fit a 4-month
  timeline without overengineering.
- Web-first; no native mobile app this semester.
- Recommendation engine is rules/score-based, not ML, given the timeline.

## 10. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Scope creep toward the full 39-table blueprint | Misses deadline | Tier 1 lock-in, documented in this PRD |
| Safety report data sensitivity | Trust/privacy issue | Access-controlled by role, audit fields on status changes |
| Small team, 4-month window | Feature slippage | Milestone-based delivery (below) |

## 11. Indicative Timeline (4 months)

| Month | Milestone |
|---|---|
| 1 | Requirements, schema, architecture finalized (this document set) |
| 2 | Backend core (auth, skills, assessments) + DB integration |
| 3 | Recommendation engine, mentorship, safety reporting; frontend build-out |
| 4 | Integration testing, UI polish, deployment, demo prep |

## 12. Stakeholders

- 4-person B.Tech project team (engineering)
- Course/project supervisor (evaluator)
- End users represented by personas in Section 4
