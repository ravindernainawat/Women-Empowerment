# WEIS: Women Empowerment & Inclusion System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg?logo=typescript)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB.svg?logo=python)](https://www.python.org)
[![Tests](https://img.shields.io/badge/Tests-123%20Passing-brightgreen.svg)](#6-running-automated-tests)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An integrated digital platform aligning with **UN Sustainable Development Goals (SDG 5: Gender Equality & SDG 8: Decent Work & Economic Growth)**.

WEIS helps women identify skill gaps against target roles, receive personalized course recommendations to close those gaps, connect with verified mentors, access a confidential safety-incident reporting channel — and now includes five unique innovation features designed specifically for women in India and emerging markets.

---

## 1. System Architecture

```
┌─────────────────────────┐               HTTPS / JSON               ┌──────────────────────────────┐
│  React 19 + TypeScript  │ ───────────────────────────────────────▶ │       FastAPI Backend        │
│    (Vite Web Client)    │ ◀─────────────────────────────────────── │      (JWT Auth + RBAC)       │
└─────────────────────────┘                                          └──────────────────────────────┘
             │                                                                      │
             ▼                                                                      ▼
    Vanilla CSS Design Tokens                                           SQLAlchemy 2.0 ORM
   (Custom Properties + Themes)                                        (10 Tier-1 Core Models)
                                                                                    │
                                                                                    ▼
                                                                        ┌───────────────────────┐
                                                                        │  SQLite / MySQL 8.0+  │
                                                                        │    (weis_db schema)   │
                                                                        └───────────────────────┘
```

---

## 2. Core Platform Features (Tier 1)

1. **Authentication & RBAC**:
   - Secure registration and login with bcrypt password hashing and JWT bearer tokens.
   - Distinct role authorization: `mentee`, `mentor`, and `admin`.
   - Token validation on mount via `/api/users/me`; auto-redirect to `/login` on 401.
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

## 3. Innovation Features (Tier 2 — Unique to WEIS)

### 🛡️ Feature 1: Stealth / Quick-Mask Emergency Safety Mode
**Problem**: Women accessing career development tools may face surveillance in restrictive home or social environments.

**Solution**: A persistent floating button (bottom-right corner, every page) that instantly disguises the entire app as benign "Developer Documentation & Reference Notes" in under 50ms.

- **Trigger**: Press `Escape` twice rapidly, or click the "Quick Mask (2x Esc)" button.
- **Disguise**: Shows realistic JavaScript async/event-loop study notes with code examples.
- **Exit**: Click "Restore Workspace" to return to WEIS seamlessly.
- **Implementation**: `frontend/src/components/common/QuickMaskModal.tsx` — integrated globally via `AppLayout.tsx`.

---

### 🔄 Feature 2: Break-to-Career Transferable Skills Transformer
**Problem**: Women returning from career breaks (caretaking, micro-business, NGO work, tutoring) are told their experience "doesn't count."

**Solution**: Select your non-traditional background and immediately see how your real-world experience maps — with verified transfer ratings — to high-demand corporate competencies.

- **Profiles**: Education & Tutoring, Family Caretaking, Micro-Enterprise, Community Advocacy/NGO
- **Outputs**: 3 skill mappings with percentage alignment score + corporate role equivalents + strategic 30-day runway recommendation
- **Access**: Assessment page → "🔄 Break-to-Career Transformer" tab
- **Implementation**: `frontend/src/components/assessment/CareerReturneeAnalyzer.tsx`

---

### 👭 Feature 3: Sisterhood Learning Pods & Micro-Mentorship Circles
**Problem**: Solo learning has poor completion rates; women need community accountability and peer support.

**Solution**: Peer pods of 4–5 women on the same skill path with bi-weekly 15-minute "Flash AMA" sessions with an expert mentor.

- **Pods available**: Data Pioneers Circle, Frontend Architect Sisters, Returnee Runway Pod
- **State tracking**: Members count, available/full status, next flash session time
- **Join flow**: One-click join with real-time member count update and "Joined Member" confirmation
- **Access**: Mentor Directory page (top section above mentor listings)
- **Implementation**: `frontend/src/components/mentorship/SisterhoodPods.tsx`

---

### 📡 Feature 4: Live Opportunity Radar & Inclusive Hiring Matches
**Problem**: Women don't see the direct link between completing a course and actual job opportunities.

**Solution**: A real-time radar that maps your current readiness score to 4 curated inclusive-employer job listings, showing which are "unlocked" and which require further skill bridging.

- **Scoring**: Job cards lock/unlock based on your readiness percentage vs. each role's minimum threshold
- **Inclusion badges**: Equal Pay Certified, Maternity Care, Flexible Hours, Career Returnee Friendly, etc.
- **Action**: "Direct Refer" (unlocked) or "Unlock Goal" with alert for networking when you reach threshold
- **Access**: Recommendations page (top section above course listings)
- **Implementation**: `frontend/src/components/recommendations/OpportunityRadar.tsx`

---

### 🔊 Feature 5: Vernacular Voice Guidance (Audio Read-Aloud)
**Problem**: Women with lower literacy levels or those accessing in screen-reader contexts face barriers on text-heavy platforms.

**Solution**: A lightweight audio button on every major page that reads the page description aloud using the browser's built-in Web Speech API — no external service required, works offline.

- **Button**: Inline pill with volume icon; toggles between "Read Aloud" and "Stop Reading"
- **Coverage**: Assessment page, Recommendations page, Mentor Directory page
- **Tech**: `SpeechSynthesisUtterance` (rate 0.95, natural pitch) with error/end handlers
- **Implementation**: `frontend/src/components/common/VoiceGuidanceButton.tsx`

---

## 4. Project Directory Structure

```
Women-Empowerment/
├── app/                           # Backend FastAPI application
│   ├── config.py                  # Pydantic configuration & environment settings
│   ├── database.py                # SQLAlchemy engine (SQLite + MySQL dialect detection)
│   ├── dependencies.py            # JWT verification & RBAC authorization guards
│   ├── main.py                    # Application entrypoint & router registration
│   ├── models.py                  # SQLAlchemy models (mirrors weis_schema.sql)
│   ├── security.py                # Bcrypt password hashing & JWT create/decode
│   ├── routers/                   # API Routers
│   │   ├── auth.py                # /api/auth — register, login, me
│   │   ├── users.py               # /api/users — profile management
│   │   ├── skills.py              # /api/skills & /api/users/me/skills
│   │   ├── assessments.py         # /api/assessments — skill-gap evaluation engine
│   │   ├── recommendations.py     # /api/recommendations — course match engine
│   │   ├── mentorship.py          # /api/mentors & /api/mentorship-requests
│   │   └── safety.py              # /api/safety-reports — confidential incident reports
│   └── schemas/                   # Pydantic request/response validation schemas
├── frontend/                      # React 19 + TypeScript + Vite web client
│   ├── src/
│   │   ├── api/                   # Strongly-typed Axios service modules
│   │   ├── components/
│   │   │   ├── assessment/
│   │   │   │   └── CareerReturneeAnalyzer.tsx   # Feature 2: Break-to-Career Transformer
│   │   │   ├── common/
│   │   │   │   ├── QuickMaskModal.tsx           # Feature 1: Stealth Safety Mode
│   │   │   │   └── VoiceGuidanceButton.tsx      # Feature 5: Voice Guidance
│   │   │   ├── mentorship/
│   │   │   │   └── SisterhoodPods.tsx           # Feature 3: Sisterhood Learning Pods
│   │   │   ├── recommendations/
│   │   │   │   └── OpportunityRadar.tsx         # Feature 4: Opportunity Radar
│   │   │   ├── layout/                          # AppLayout (global QuickMask integration)
│   │   │   └── ui/                              # Design system: Button, Card, Badge, Modal...
│   │   ├── context/               # AuthContext (token validation, role-switcher)
│   │   ├── pages/                 # Full pages for all core workflows
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
├── seed_db.py                     # Database seeding utility for demo data
├── weis_schema.sql                # Authoritative MySQL 8.0+ DDL schema (10 tables)
├── requirements.txt               # Backend Python dependencies
├── .env.example                   # Environment configuration template
└── README.md
```

---

## 5. Quickstart Guide

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

The default `.env` uses SQLite (`sqlite:///./weis_dev.db`) for immediate development with no external database needed.

---

### Step 2: Set Up Backend & Seed Database

```bash
# Create & activate a virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Seed skills catalogue, courses, and demo users
python seed_db.py

# Launch the FastAPI backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **API Base URL**: `http://localhost:8000`
- **OpenAPI Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health/db`

---

### Step 3: Set Up & Run Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

- **Web Client**: `http://localhost:5173`

---

## 6. Demo Accounts & Walkthrough

The database seeder creates four pre-configured accounts:

| Role | Email | Password | Intended Workflow |
|------|-------|----------|-------------------|
| **Mentee** | `mentee@weis.org` | `password123` | Take gap assessment, use Returnee Transformer, view Opportunity Radar, enroll in courses, send mentorship request, join Sisterhood Pod |
| **Mentor 1** | `mentor@weis.org` | `password123` | View incoming mentee requests, accept/decline (Data Science expertise) |
| **Mentor 2** | `priya@weis.org` | `password123` | Cloud Architecture mentor profile |
| **Admin** | `admin@weis.org` | `admin123` | Verify mentor applications, review and resolve safety reports |

### Live Feature Demo Steps

1. **Quick Mask**: Press `Esc` twice rapidly on any page → instantly see study notes disguise. Click "Restore Workspace" to return.
2. **Break-to-Career Transformer**: Login as mentee → Assessment page → Click "🔄 Break-to-Career Transformer" tab → Select "Family Caretaking & Household Management" → See your skills mapped.
3. **Opportunity Radar**: Assessment → Recommendations page → See 4 jobs with lock/unlock status based on your readiness score.
4. **Sisterhood Pods**: Mentor Directory page → See 3 pods at top → Click "Join Sisterhood Pod" on any card.
5. **Voice Guidance**: Any major page → Click the 🔊 volume pill button in the page header to hear a description read aloud.

---

## 7. Running Automated Tests

WEIS features a comprehensive **123-test** automated test suite covering all routers, security policies, and an end-to-end pipeline test.

```bash
# Run full backend test suite
pytest -v

# Run the end-to-end integration test only
pytest tests/test_e2e_pipeline.py -v

# Run frontend TypeScript type check + production build
cd frontend && npm run build
```

Expected results:
```
123 passed in ~18s
✓ built in 947ms (0 TypeScript errors)
```

---

## 8. Environment Configuration

| Variable | Development (SQLite) | Production (MySQL) |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./weis_dev.db` | `mysql+pymysql://user:pass@host/db` |
| `SECRET_KEY` | Any 32+ char string | Strong random secret |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | `60` |
| `ENV` | `development` | `production` |

The backend auto-detects the database dialect from `DATABASE_URL` and applies the correct engine arguments (SQLite uses `check_same_thread=False`; MySQL uses `pool_pre_ping=True`, `pool_recycle=3600`).

---

## 9. License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

**SDG Alignment**: WEIS directly supports [UN SDG 5 (Gender Equality)](https://sdgs.un.org/goals/goal5) and [SDG 8 (Decent Work & Economic Growth)](https://sdgs.un.org/goals/goal8).
