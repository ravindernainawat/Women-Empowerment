# UI/UX Design Document
## Women Empowerment & Inclusion System (WEIS)

| | |
|---|---|
| **Version** | 1.0 |
| **Scope** | Tier 1 core screens |
| **Companion docs** | `WEIS_PRD.md`, `WEIS_TRD.md` |

---

## 1. Design Principles

- **Clarity over density.** Users may be re-entering the workforce or new to
  digital platforms — avoid jargon-heavy dashboards; surface one clear next
  action per screen.
- **Progress, not judgment.** Skill-gap results are framed as "what to learn
  next," never as a deficit score presented punitively.
- **Safety is never buried.** The safety-reporting entry point is
  persistently accessible (not nested three menus deep) but never
  intrusive.
- **Trust signals for mentorship.** Verified mentors are visually
  distinguished; mentee requests show clear status at all times.
- **Accessible by default.** WCAG AA color contrast, readable type scale,
  keyboard-navigable forms — not a post-hoc pass.

## 2. User Journeys

### 2.1 Mentee core journey
```
Sign up → Build skill inventory → Pick a target role → Run assessment
   → View gap breakdown → View ranked course recommendations
   → (optional) Request a mentor → Track progress over time
```

### 2.2 Mentor journey
```
Sign up as mentor → Complete expertise profile → Get verified
   → Receive mentorship requests → Accept/decline → Track active mentees
```

### 2.3 Safety-reporting journey (available from any screen)
```
Tap "Report a concern" → Select incident type → Describe → Submit
   → See status (Submitted → Under review → Resolved)
```

## 3. Information Architecture

```
WEIS
├── Auth (Login / Register)
├── Dashboard (role-dependent)
│   ├── Mentee Dashboard
│   ├── Mentor Dashboard
│   └── Admin Dashboard
├── Skills
│   ├── My Skill Inventory
│   └── Skill Gap Assessment
├── Recommendations
├── Mentorship
│   ├── Find a Mentor
│   └── My Requests
├── Safety
│   ├── File a Report
│   └── My Reports (or All Reports, for admin)
└── Profile / Settings
```

## 4. Key Screens

### 4.1 Onboarding / Registration
- Fields: full name, email, password, role selection (mentee/mentor),
  optional phone & location.
- Mentors see an additional step: expertise area + short bio (goes to
  "pending verification" state, admin verifies before listing publicly).

### 4.2 Mentee Dashboard
- **Top:** Welcome header + most recent assessment's overall readiness
  score (visualized as a simple progress ring, not a raw percentage
  alone — paired with plain-language framing, e.g. "70% ready for Data
  Analyst").
- **Middle:** "Continue learning" card — top 3 active recommendations.
- **Bottom:** Quick links — Run new assessment, Find a mentor, Report a
  concern (always visible, low-emphasis styling so it doesn't feel alarming
  but is never hidden).

### 4.3 Skill Inventory
- List/table of skills the user has logged, each with a proficiency
  selector (beginner/intermediate/advanced).
- "Add skill" — searchable dropdown against the skill catalog.
- Empty state guides new users to add at least 3 skills before running an
  assessment.

### 4.4 Skill Gap Assessment
- Step 1: Select target role (dropdown/search).
- Step 2 (results): Per-skill breakdown — required level vs. current level,
  shown as a simple two-point bar per skill, sorted by largest gap first.
- Overall score displayed prominently at top; CTA: "See recommended
  courses for these gaps."

### 4.5 Recommendations
- Card list of courses, each showing: title, provider, duration, which
  skill it addresses, and match score (shown as "Strong match" /
  "Good match" rather than a raw decimal, to stay approachable).
- Status control per card: Viewed / Enrolled / Completed.
- Filter by skill or by status.

### 4.6 Mentor Directory
- Grid/list of verified mentors: name, expertise area, short bio snippet.
- "Verified" badge (from `mentors.is_verified`).
- "Request mentorship" button → confirmation modal → request enters
  `pending` state.

### 4.7 My Mentorship Requests (mentee) / Incoming Requests (mentor)
- Status-tagged list: Pending / Accepted / Declined / Completed.
- Mentor view has Accept/Decline actions inline.

### 4.8 Safety Report Form
- Minimal required fields: incident type (dropdown), description
  (free text).
- Clear, calm confirmation on submit — no dramatic styling, reassures the
  user the report was received and will move to "Under review."
- Reporter can view their own report's status but not others' (per TRD
  Section 7 access rules).

### 4.9 Admin Dashboard
- Table of safety reports with status filters, sortable by date.
- Basic platform stats: user count by role, pending mentor verifications,
  open safety reports.

## 5. Visual Style Guide (starting point)

| Token | Value / Direction |
|---|---|
| **Primary color** | Warm, confidence-oriented tone (e.g., deep teal or plum) — avoid stereotypical pastel-pink defaults |
| **Accent (safety)** | Calm blue/gray, never red/alarm-toned, to avoid making reporting feel high-stakes |
| **Typography** | Clean sans-serif, minimum 16px body text for readability |
| **Spacing** | Generous whitespace; avoid dense dashboard-style layouts |
| **Iconography** | Simple line icons; verified-mentor badge uses a checkmark, not a star (avoid "rating" connotation) |

## 6. Accessibility

- Minimum WCAG AA contrast ratios on all text/background pairs.
- All interactive elements reachable and operable via keyboard.
- Form errors announced via `aria-live` regions, not color alone.
- Safety report form must be fully usable without a mouse and screen
  reader-friendly, given the sensitivity of that flow.

## 7. Responsive Behavior

- Web-first (per PRD Section 5.2), but all core screens (dashboard,
  assessment, recommendations, safety form) must degrade cleanly to a
  single-column mobile-web layout — many target users will access via
  phone browsers rather than desktop.
