# Technical Architecture: AI-Project-Mentor

## 1. System Overview

**AI-Project-Mentor** is an academic project progress tracking, planning, and mentorship platform designed for undergraduate and graduate computer science/engineering capstone courses. It pairs student self-service onboarding, dynamic milestone scheduling, and interactive AI mentorship with an executive, evidence-based Faculty Mentorship and Cohort Analytics Dashboard.

The system bridges the gap between student self-reported progress and faculty oversight through automated project health scoring, risk assessment, and 9-point executive faculty intervention summaries.

---

## 2. Architectural Topology

```text
                                  ┌────────────────────────────────────────┐
                                  │            Client Tier                 │
                                  │   React 19 + Vite SPA (Vanilla CSS)    │
                                  └───────┬────────────────────────┬───────┘
                                          │                        │
                          Student Workflows (REST)          Faculty Oversight (REST)
                                          │                        │
                                          ▼                        ▼
                                  ┌────────────────────────────────────────┐
                                  │            Application Tier            │
                                  │       Flask Application (WSGI)         │
                                  │   (Flask-CORS, Blueprint Endpoints)    │
                                  └───┬───────┬────────────┬───────────┬───┘
                                      │       │            │           │
                 ┌────────────────────┘       │            │           └────────────────────┐
                 ▼                            ▼            ▼                                ▼
       ┌───────────────────┐        ┌─────────────────┐ ┌────────────────────┐     ┌────────────────┐
       │   Agent Service   │        │ Health Scoring  │ │ Faculty Summary    │     │ Persistence    │
       │     Pipeline      │        │     Engine      │ │    Generator       │     │     Layer      │
       ├───────────────────┤        ├─────────────────┤ ├────────────────────┤     ├────────────────┤
       │ • Feasibility     │        │ • Multi-factor  │ │ • Gemini GenAI     │     │ • MongoDB      │
       │ • Tech Recommender│        │   scoring       │ │ • OpenAI GPT-4o    │     │   (PyMongo)    │
       │ • Timeline Agent  │        │ • Blocker rule  │ │ • Deterministic    │     │ • In-Memory    │
       │ • Risk Assessor   │        │   precedence    │ │   Rule Fallback    │     │   Cohort Sync  │
       │ • AI Chat Mentor  │        │ • Overdue check │ │ • Schema Validator │     └────────────────┘
       │ • Plan Adjuster   │        └─────────────────┘ └────────────────────┘
       │ • Doc Generator   │
       └───────────────────┘
```

---

## 3. Technology Stack Breakdown

| Layer | Technologies | Rationale & Responsibility |
|---|---|---|
| **Frontend** | React 19, Vite, JavaScript (ES6+), Vanilla CSS | Ultra-fast client-side rendering, zero Tailwind lock-in, customized dark/light responsive interface, glassmorphism UI, real-time cohort analytics. |
| **Backend** | Python 3.11+, Flask, Flask-CORS, python-dotenv | Lightweight microservices-compatible REST API server handling request validation, pipeline routing, and cross-origin resource sharing. |
| **Database** | MongoDB (v6+ via PyMongo) with In-Memory Python Fallback | Flexible JSON document storage for dynamic milestone plans and progress histories. In-memory dictionary fallback guarantees zero runtime disruption if MongoDB is unreachable. |
| **AI / LLM** | Google GenAI SDK (`google-genai`), OpenAI API (`openai`), CrewAI | Multi-provider orchestration for milestone planning, risk analysis, conversational mentoring, and executive faculty summaries. |
| **Resilience** | Deterministic Fallback Rule Engines | Every AI service includes a deterministic rule-based fallback ensuring 100% operational uptime, zero empty schedules, and robust schema validation even during provider outages or credential failures. |

---

## 4. Component & Service Architecture

### 4.1 Student Agent Pipeline (`backend/agents/` & `backend/services/`)

The student journey progresses through interconnected specialized agents:
1. **Feasibility Agent (`agents/milestone2_pipeline.py`)**: Analyzes idea complexity, skill requisites, and potential academic hurdles.
2. **Scope Agent (`agents/milestone2_pipeline.py`)**: Defines core functional requirements, user actors, and scope boundaries.
3. **Technology Recommendation Agent (`services/technology_agent.py`)**: Evaluates project keywords (e.g., AI/ML, NLP, Computer Vision, Web, Mobile) and prescribes recommended languages, frameworks, and databases with justification.
4. **Timeline & Milestone Agent (`services/timeline_agent.py`)**: Generates an $N$-week milestone calendar with specific deliverables, required tools, and weekly tasks. Incorporates `generate_fallback_timeline` to prevent empty schedules when external APIs are unavailable.
5. **Risk Assessment Service (`services/risk_service.py`)**: Identifies technical, timeline, and resource risks, categorizing severity (LOW, MEDIUM, HIGH, CRITICAL) and actionable mitigation strategies.
6. **AI Mentorship Service (`services/mentor_service.py`)**: Multi-turn academic coach answering technical queries, debugging questions, and methodology dilemmas.
7. **Plan Adjustment Engine (`services/plan_adjustment.py`)**: Dynamically shifts unfinished milestones into upcoming weeks while preserving historical completion records.
8. **Documentation Service (`services/documentation_service.py`)**: Auto-generates Project Synopsis, Methodology, and IEEE-styled Progress Reports.

### 4.2 Project Health Calculation Engine (`backend/services/health_service.py`)

The health engine executes a deterministic, multi-factor scoring model that guarantees explainability and transparency.

#### Multi-Factor Scoring Formulation
The total score $S \in [0, 100]$ is computed as:
$$S = \max(0, \min(100, S_{\text{progress}} + S_{\text{schedule}} + S_{\text{overdue}} + S_{\text{risk}} + S_{\text{recency}}))$$

Where:
1. **Progress Factor ($S_{\text{progress}} \in [0, 30]$)**:
   $$S_{\text{progress}} = \min(30, \text{progress\_pct} \times 0.3)$$
2. **Schedule Alignment ($S_{\text{schedule}} \in [0, 25]$)**:
   Measures expected progress based on elapsed weeks. If current progress is on or ahead of schedule, awards up to 25 points. If lagging $>25\%$, awards 5 points.
3. **Overdue Penalty ($S_{\text{overdue}} \in [-25, 20]$)**:
   Deducts 15 points per overdue task up to a maximum deduction of 25 points. If zero overdue tasks, awards 20 points.
4. **Risk Severity Factor ($S_{\text{risk}} \in [0, 15]$)**:
   - CRITICAL unresolved risk: 0 points.
   - HIGH unresolved risk: 5 points.
   - MEDIUM risk: 10 points.
   - LOW / No risk: 15 points.
5. **Update Recency ($S_{\text{recency}} \in [0, 10]$)**:
   Awards 10 points if updated within 14 days; awards 5 points if between 15–28 days; 0 points if stale (>28 days).

#### Precedence & Blocker Rules
To prevent critical failures from being masked by a high completion percentage, explicit precedence overrides are enforced:
- **Rule 1 (Critical Blocker)**: If any unresolved risk has `severity == 'CRITICAL'` or if `overdue_tasks >= 3`, `health_status` is strictly forced to **"At Risk"**, regardless of numeric score.
- **Rule 2 (High Risk / Delay)**: If unresolved risks include `HIGH` or `overdue_tasks >= 1` or progress lags schedule by $>20\%$, maximum health status is **"Needs Attention"**.
- **Rule 3 (Completion)**: If `progress_pct >= 100` and `overdue_tasks == 0`, status is **"Completed"**.
- **Rule 4 (Score Thresholds)**:
  - $S \ge 75$: **Healthy**
  - $50 \le S < 75$: **Needs Attention**
  - $S < 50$: **At Risk**
- **Rule 5 (Insufficient Data)**: If no project data or milestones exist, status is classified as **"Unknown"**.

### 4.3 Faculty Mentor Summary Engine (`backend/services/faculty_summary_service.py`)

Generates structured, 9-point executive briefings for academic mentors without hallucinations:
1. **Current Project Status**: State, percentage, and schedule pacing.
2. **Recent Achievements**: Concrete deliverables finished in the latest cycle.
3. **Completed and Pending Milestones**: Accurate task tallies.
4. **Upcoming and Overdue Deadlines**: Imminent and delayed milestone items.
5. **Current Blockers and Unresolved Risks**: Severity and impact analysis.
6. **Key Changes Since Previous Update**: Historical diff or baseline change log.
7. **Recommended Faculty Intervention**: Concrete advising action (e.g., schedule code review, emergency intervention, encourage progress).
8. **Prioritized Next Actions**: Top 3 actionable student deliverables.
9. **Provenance & Timestamps**: Generation time and underlying data timestamp.

Resilience Workflow:
- Level 1: Google GenAI (Gemini 2.5 Flash / Pro).
- Level 2: OpenAI (GPT-4o / GPT-3.5-Turbo).
- Level 3: Deterministic Rule Fallback (Synthesizes facts directly from database records, guaranteeing zero downtime and complete schema compliance).

---

## 5. Persistence & Data Consistency

### 5.1 MongoDB Collection Schema

The primary persistence layer uses MongoDB (`ai_project_mentor` database):
- `projects`: Contains metadata (`id`, `title`, `student_name`, `email`, `mentor`, `domain`, `status`, `health_status`, `progress_percentage`, `created_at`, `updated_at`).
- `timelines`: Dynamic weekly milestone breakdown (`project_id`, `weekly_plan`, `total_weeks`).
- `progress`: Chronological progress submissions (`project_id`, `week`, `completed_tasks`, `pending_tasks`, `progress_percentage`, `problems`, `timestamp`).
- `risks`: Project risk profiles (`project_id`, `overall_risk`, `risks` array).

### 5.2 In-Memory Cohort Sync Engine

When MongoDB is absent or offline (e.g., development environments without local MongoDB daemons), `mongodb.py` activates an in-memory dictionary store.
In `backend/app.py`:
- `IN_MEMORY_PROJECTS`: Maintains initial cohort projects (`proj-001` through `proj-005`).
- Student onboarding dynamically persists new projects to both MongoDB and `IN_MEMORY_PROJECTS` simultaneously via `POST /api/projects`.
- Student progress submissions via `POST /api/progress/track` recalculate health and mutate the corresponding project in both storage layers.
- Prevents split-brain inconsistencies between student sessions and the faculty dashboard.

---

## 6. REST API Specification

### Student Endpoints
- `POST /api/onboarding/submit`: Submits initial student profile and project idea.
- `POST /api/blueprint/generate`: Generates feasibility and scope analysis.
- `POST /api/technology/recommend`: Generates technology stack recommendations.
- `POST /api/timeline/generate`: Generates $N$-week milestone calendar.
- `POST /api/risks/analyze`: Analyzes technical, timeline, and resource risks.
- `POST /api/mentor/chat`: Multi-turn conversational mentorship.
- `POST /api/progress/track`: Submits weekly progress update and updates project health.
- `POST /api/timeline/adjust`: Adjusts timeline based on delays and unfinished tasks.
- `POST /api/docs/synopsis`: Generates project synopsis.
- `POST /api/docs/methodology`: Generates technical methodology.
- `POST /api/docs/progress-report`: Generates IEEE progress report.

### Faculty Endpoints
- `GET /api/faculty/dashboard`: Returns aggregate cohort metrics (total, in-progress, completed, needing attention, at-risk, overdue milestones).
- `GET /api/faculty/projects`: Retrieves filtered, searched, and sorted project list (`?search=`, `?health=`, `?status=`, `?sort_by=`, `?sort_order=`).
- `GET /api/faculty/projects/<id>`: Returns complete project inspection record (details, timeline, progress history, risk profile, health diagnosis).
- `POST /api/faculty/summary`: Generates or regenerates 9-point AI executive faculty summary for a project.

---

## 7. Security & Access Control

- **CORS Configuration**: Flask-CORS configured to accept requests from frontend origins with standardized pre-flight handling.
- **Backend Validation**: Strict type checking and null-coalescing on all progress and project creation endpoints.
- **Authorization Scope**:
  - Educational/Development Mode: Open student/faculty prototype access with clear security documentation.
  - Production Recommendation: JWT Bearer Tokens with Role-Based Access Control (RBAC) separating Student and Faculty claims in the HTTP `Authorization` header.
- **API Key Safeguards**: Sensitive AI provider keys are loaded from `.env` and never leaked into client payloads or client-side bundles.
