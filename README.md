# WEIS: Women Empowerment & Inclusion System

[![WEIS CI](https://github.com/ravindernainawat/Women-Empowerment/actions/workflows/ci.yml/badge.svg)](https://github.com/ravindernainawat/Women-Empowerment/actions/workflows/ci.yml)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg?logo=typescript)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB.svg?logo=python)](https://www.python.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An integrated digital platform aligning with **UN Sustainable Development Goals (SDG 5: Gender Equality & SDG 8: Decent Work & Economic Growth)**. 

WEIS helps women identify skill gaps against target roles, receive personalized course recommendations to close those gaps, connect with verified mentors, and access a confidential safety-incident reporting channel.

---

## 1. System Architecture

```
┌─────────────────────────┐               HTTPS / JSON               ┌──────────────────────────────┐
│  React 19 + TypeScript  │ ───────────────────────────────────────▶ │       FastAPI Backend        │
│    (Vite Web Client)    │ ◀─────────────────────────────────────── │      (JWT Auth + RBAC)       │
└─────────────────────────┘                                          └──────────────────────────────┘
             │                                                                      │
             ▼                                                                      ▼
    Tailwind/Vanilla CSS                                                      SQLAlchemy 2.0 ORM
   Tokens & Responsive UI                                                    (10 Tier-1 Core Models)
                                                                                    │
                                                                                    ▼
                                                                        ┌───────────────────────┐
                                                                        │  SQLite / MySQL 8.0+  │
                                                                        │    (weis_db schema)   │
                                                                        └───────────────────────┘
```

---

## 2. Core Pillars & Features (Tier 1)

1. **Authentication & RBAC**:
   - Secure registration and login with bcrypt password hashing and JWT bearer tokens.
   - Distinct role authorization: `mentee`, `mentor`, and `admin`.
2. **Skill Inventory Management**:
   - Master skill catalogue with categories (Technical, Soft Skills, Management, Design, Marketing, Finance).
   - User profile inventory tracking with proficiency levels (`beginner`, `intermediate`, `advanced`).
3. **Skill-Gap Assessment Engine**:
   - Evaluate skills against target career roles (e.g., *Junior Data Analyst*).
   - Computes deterministic proficiency gaps, per-skill gap scores, and overall role readiness index.
4. **Targeted Course Recommendations**:
   - Matches identified skill gaps to accredited online courses (Coursera, edX, Google, Udacity, Khan Academy).
   - Status tracking pipeline: `pending` → `viewed` → `enrolled` → `completed`.
5. **Verified Mentorship Directory**:
   - Verified mentor profiles with domain expertise areas and bios.
   - Mentee request lifecycle (`pending` → `accepted` / `declined` → `completed`).
   - Dedicated incoming request inbox for mentors.
6. **Confidential Safety Reporting**:
   - Secure reporting of safety incidents (`harassment`, `threat`, `discrimination`, `inappropriate_behavior`, `other`).
   - Reporter identity derived from JWT token; reports are strictly isolated to reporter and platform administrators.
   - Administrative review and status moderation (`submitted` → `under_review` → `resolved` / `dismissed`).

---

## 3. Project Directory Structure

```
Women-Empowerment/
├── app/                           # Backend FastAPI application
│   ├── config.py                  # Pydantic configuration & environment settings
│   ├── database.py                # SQLAlchemy engine & session management
│   ├── dependencies.py            # JWT verification & RBAC authorization guards
│   ├── main.py                    # Application entrypoint & router registration
│   ├── models.py                  # SQLAlchemy models (mirrors weis_schema.sql)
│   ├── security.py                # Bcrypt password hashing & JWT create/decode
│   ├── routers/                   # API Routers
│   │   ├── auth.py                # /api/auth — register, login, me
│   │   ├── users.py               # /api/users — profile management
│   │   ├── skills.py              # /api/skills & /api/users/me/skills — catalogue & inventory
│   │   ├── assessments.py         # /api/assessments — skill-gap evaluation
│   │   ├── recommendations.py     # /api/recommendations — course match engine
│   │   ├── mentorship.py          # /api/mentors & /api/mentorship-requests
│   │   └── safety.py              # /api/safety-reports — confidential incident reports
│   └── schemas/                   # Pydantic request/response validation schemas
├── frontend/                      # React 19 + TypeScript + Vite web client
│   ├── src/
│   │   ├── api/                   # Strongly-typed Axios service modules
│   │   ├── components/            # UI components (Button, Modal, Card, Badge, etc.)
│   │   ├── context/               # AuthContext (state, tokens, role-switching)
│   │   ├── pages/                 # Full pages for all core workflows
│   │   │   ├── Admin/             # Admin moderation & report management
│   │   │   ├── Assessment/        # Skill-gap evaluation & readiness ring
│   │   │   ├── Auth/              # Login & Registration flows
│   │   │   ├── Dashboard/         # Role-tailored dashboards
│   │   │   ├── Landing/           # Public landing page with SDG alignment
│   │   │   ├── Mentorship/        # Mentor directory & request queues
│   │   │   ├── Profile/           # User profile & contact updates
│   │   │   ├── Recommendations/   # Course recommendations & enrollment
│   │   │   └── Safety/            # Safety reporting & history
│   │   └── types/                 # TypeScript interfaces matching backend models
├── tests/                         # Comprehensive automated test suite (123 tests)
│   ├── conftest.py                # Shared in-memory test DB & test client fixture
│   ├── test_e2e_pipeline.py       # Full end-to-end user journey integration test
│   ├── test_assessments.py        # Assessment scoring & gap tests
│   ├── test_auth.py               # Registration & JWT authentication tests
│   ├── test_mentorship.py         # Mentorship request & verification tests
│   ├── test_recommendations.py    # Recommender mapping & status lifecycle tests
│   ├── test_safety_reports.py     # Incident reporting & moderation tests
│   ├── test_security.py           # Cryptographic security & RBAC tests
│   ├── test_skills.py             # Skill inventory & catalogue tests
│   └── test_users.py              # Profile CRUD & authorization tests
├── .github/workflows/ci.yml       # GitHub Actions continuous integration workflow
├── seed_db.py                     # Database seeding utility for demo data
├── weis_schema.sql                # Authoritative MySQL 8.0+ DDL schema (10 tables)
├── requirements.txt               # Backend Python dependencies
├── .env.example                   # Environment configuration template
└── README.md
```

---

## 4. Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm 9+
- Optional: MySQL 8.0+ (if not using local SQLite dev mode)

---

### Step 1: Clone the Repository & Configure Environment

```bash
git clone https://github.com/ravindernainawat/Women-Empowerment.git
cd Women-Empowerment

# Copy environment template
cp .env.example .env
```

By default, `.env` is configured to use the local SQLite database (`sqlite:///./weis_dev.db`) for immediate out-of-the-box development without requiring external database services.

---

### Step 2: Set Up Backend & Seed Database

```bash
# Create & activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Seed skills catalogue, courses, and demo users
python seed_db.py --sqlite-file weis_dev.db

# Launch the FastAPI backend server
uvicorn app.main:app --reload
```

- API Base URL: `http://localhost:8000`
- Interactive OpenAPI Swagger Docs: `http://localhost:8000/docs`
- Database Health Check: `http://localhost:8000/health/db`

---

### Step 3: Set Up & Run Frontend

In a separate terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

- Web Client: `http://localhost:5173`

---

## 5. Demo Accounts

The database seeder (`seed_db.py`) creates four pre-configured accounts:

| Role | Email | Password | Intended Workflow |
|------|-------|----------|-------------------|
| **Mentee** | `mentee@weis.org` | `password123` | Take gap assessment, view course recommendations, send mentorship request, file safety report |
| **Mentor 1** | `mentor@weis.org` | `password123` | View incoming mentee requests, accept/decline requests (Data Science expertise) |
| **Mentor 2** | `priya@weis.org` | `password123` | Cloud Architecture mentor profile |
| **Admin** | `admin@weis.org` | `admin123` | Verify mentor applications, review and resolve safety reports |

---

## 6. Running Automated Tests

WEIS features a comprehensive 123-test automated test suite covering all routers, security policies, and an end-to-end pipeline test.

```bash
# Run full backend test suite
pytest -v

# Run the end-to-end integration test only
pytest tests/test_e2e_pipeline.py -v

# Run frontend build & type check
cd frontend && npm run build
```

---

## 7. License

This project is licensed under the MIT License.
