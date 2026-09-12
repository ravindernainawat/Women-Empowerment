# WEIS: Women Empowerment & Inclusion System

Backend & Frontend monorepo for the **Women Empowerment & Inclusion System (WEIS)**.
Tier 1 core scope: users, skills inventory, skill-gap pipeline, course recommendation engine, verified mentorship directory, and confidential safety incident reporting.

Aligning with **UN Sustainable Development Goals (SDG 5: Gender Equality & SDG 8: Decent Work & Economic Growth)**.

---

## 1. Project Layout

```
Main Code/
├── app/                           # Backend FastAPI Application
│   ├── __init__.py
│   ├── config.py                  # Pydantic settings loaded from .env
│   ├── database.py                # SQLAlchemy engine & session dependency
│   ├── models.py                  # 10 Tier-1 ORM models mirroring weis_schema.sql
│   └── main.py                    # FastAPI application & health routes
├── frontend/                      # Frontend Application (React + Vite + TypeScript)
│   ├── src/
│   │   ├── api/                   # Typed API service modules (auth, skills, mentorship, etc.)
│   │   ├── components/            # Reusable UI & Layout components
│   │   │   ├── common/            # PageTitle, ProtectedRoute, RoleGuard
│   │   │   ├── layout/            # Navbar, Sidebar, AppLayout, AuthLayout, Footer
│   │   │   └── ui/                # Button, Card, Badge, ProgressRing, Modal, etc.
│   │   ├── context/               # AuthContext (state, role switcher, token storage)
│   │   ├── data/                  # Realistic domain mock data
│   │   ├── pages/                 # Full pages for all 9+ core user flows
│   │   │   ├── Admin/             # Admin moderation & report queue
│   │   │   ├── Assessment/        # Skill-gap evaluation & readiness ring
│   │   │   ├── Auth/              # Login & Registration with mentor onboarding
│   │   │   ├── Dashboard/         # Role-branched dashboard (Mentee / Mentor / Admin)
│   │   │   ├── Landing/           # Public landing with 4 pillars & SDG alignment
│   │   │   ├── Mentorship/        # Verified mentor directory & request tracking
│   │   │   ├── Profile/           # User identity & contact management
│   │   │   ├── Recommendations/   # Course recommendations & status updater
│   │   │   └── Safety/            # Confidential safety reporting & tracking
│   │   ├── routes/                # Declarative client-side routing (AppRouter)
│   │   ├── styles/                # CSS custom property tokens & global styles
│   │   └── types/                 # TypeScript interfaces matching backend models
│   ├── package.json
│   └── vite.config.ts
├── requirements.txt               # Backend Python dependencies
├── .env.example                   # Backend environment template
├── .gitignore                     # Git protection for secrets & virtualenvs
├── weis_schema.sql                # Authoritative MySQL 8.0+ DDL schema (10 tables)
├── weis_er_diagram.mermaid        # Visual entity-relationship diagram
├── WEIS_PRD.md                    # Product Requirements Document
├── WEIS_TRD.md                    # Technical Requirements Document
├── WEIS_UI_UX_Design.md           # UI/UX Specification & Design tokens
└── WEIS_Backend_Schema.md         # Data dictionary & referential integrity
```

---

## 2. Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- Python 3.10+
- MySQL 8.0+ (running locally)

---

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.
5. **Interactive Demo Roles:** Use the "Demo Role" dropdown in the top navbar to instantly switch between **Mentee**, **Mentor**, and **Admin** personas.

---

### Running the Backend

1. Create and activate a virtual environment in the project root:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate      # Windows
   # source .venv/bin/activate # macOS/Linux
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create your `.env` configuration:
   ```bash
   cp .env.example .env
   ```
4. Configure your MySQL credentials in `.env`:
   ```ini
   DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/weis_db
   ```
5. Apply the MySQL schema:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS weis_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   mysql -u root -p weis_db < weis_schema.sql
   ```
6. Start the API server:
   ```bash
   uvicorn app.main:app --reload
   ```
7. Verify endpoints:
   - Root Health: `http://localhost:8000/`
   - Database Health: `http://localhost:8000/health/db`
   - Swagger OpenAPI Docs: `http://localhost:8000/docs`

---

## 3. Phase 1 Accomplishments

- [x] **Project Scaffolding:** Clean monorepo structure with backend and frontend cleanly separated.
- [x] **Domain Types:** Centralized TypeScript definitions mirroring all 10 Tier-1 database entities and enums.
- [x] **Design Tokens:** Deep teal primary palette, calm blue safety accent, accessible Inter typography, WCAG AA compliance.
- [x] **Reusable Component Library:** Button, Card, Badge, ProgressRing, Modal, Input, Select, Textarea, Spinner, EmptyState, ErrorState.
- [x] **Application Layout:** Role-aware Navbar, persistent sidebar with calm safety entry point, and footer with SDG 5/8 links.
- [x] **Pages Implemented:**
  - Public Landing Page with hero, four pillars, and journey roadmap
  - Authentication UI (Login & Role-branched Register)
  - Mentee & Mentor Dashboard with readiness progress ring
  - Skill Inventory manager with proficiency level updates
  - Skill-Gap Assessment workflow with gap calculation
  - Curated Course Recommendations catalog
  - Verified Mentor Directory & Mentorship Request tracking
  - Confidential Safety Concern reporting form & private report tracker
  - Administrative Portal with mentor approval and safety incident queue
- [x] **Centralized API Client:** Decoupled service layer ready for real FastAPI endpoints.
- [x] **Verified Build:** Frontend builds with 0 errors via `npm run build`.
