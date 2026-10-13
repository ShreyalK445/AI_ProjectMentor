# AI-Project-Mentor

### AI-Guided Academic Project Progress Tracking Platform with Planning & Mentorship Assistance

AI-Project-Mentor is an academic capstone project management platform that combines intelligent student self-service onboarding, dynamic milestone scheduling, risk assessment, and conversational AI mentorship with an executive, evidence-based **Faculty Oversight and Cohort Analytics Dashboard**.

---

## 🌟 Key Features

### For Students
- **Intelligent Intake & Blueprinting**: Feasibility analysis, scope definition, and tailored technology stack recommendations.
- **Dynamic Milestone Scheduling**: $N$-week milestone planning with automatic task reallocation upon reported delays.
- **AI Mentorship Coach**: 24/7 conversational advice on software architecture, debugging, and academic project methodologies.
- **Progress Tracking**: Weekly task check-ins with problem and blocker reporting.
- **Academic Documentation Generation**: Automated creation of Project Synopsis, Technical Methodology, and periodic Progress Reports.

### For Faculty Advisors
- **Real-Time Cohort KPI Dashboard**: Instant visibility into total, in-progress, completed, needing-attention, and at-risk projects, along with overdue milestones.
- **Explainable Health Scoring Engine**: Multi-factor mathematical scoring ($0$–$100$) evaluating task completion, schedule alignment, overdue milestones, risk severity, and update staleness.
- **Precedence-Based Blocker Detection**: Explicit rules ensuring critical unresolved blockers immediately flag projects as *At Risk*, regardless of high completion percentages.
- **9-Point AI Executive Summaries**: Concise, structured briefings highlighting achievements, blockers, deadlines, and recommended faculty interventions, with 100% deterministic fallback guarantees.
- **Cohort Search, Filter & Sort**: Search by student or project title, filter by health status or lifecycle phase, and sort by health or progress metrics.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 19, Vite 6, JavaScript (ES6+), Vanilla CSS (responsive glassmorphism design system).
- **Backend**: Python 3.11+, Flask 3, Flask-CORS.
- **Database**: MongoDB (via PyMongo) with an automatic In-Memory cohort fallback engine for zero-dependency development.
- **AI Services**: Google GenAI SDK (`google-genai`), OpenAI API (`openai`), CrewAI, and deterministic rule engines.

For comprehensive technical specifications, refer to [docs/TECHNICAL_ARCHITECTURE.md](file:///c:/Projects/AI-Project-Mentor/docs/TECHNICAL_ARCHITECTURE.md).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.11+** installed.
- **Node.js (v18+)** and `npm` installed.
- *(Optional)* **MongoDB** running locally on port 27017. If MongoDB is absent, the backend automatically operates using its built-in in-memory fallback.

---

### 2. Environment Configuration

In `backend/.env`, configure your environment variables:
```ini
# Server Configuration
PORT=5000
FLASK_ENV=development

# Database Configuration (Optional - in-memory fallback engages if unreachable)
MONGO_URI=mongodb://localhost:27017/ai_project_mentor

# AI Provider API Keys (Optional - deterministic rule engines engage if absent)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

---

### 3. Backend Installation & Startup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (if not already created)
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows Command Prompt:
.\venv\Scripts\activate.bat
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Flask API server
python app.py
```
The backend API server will start on `http://127.0.0.1:5000`.

---

### 4. Frontend Installation & Startup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend application will be accessible at `http://localhost:5173`.

---

## 🧪 Testing & Verification

The repository contains an automated test suite verifying health scoring, mentor summaries, API integration, and all 8 end-to-end scenarios.

### Run Automated Unit & E2E Tests
```bash
cd backend
python -m unittest discover -s tests -p "test_*.py"
```
*Expected Result:*
```text
Ran 30 tests in ~10s
OK
```

### Run Prompt & Pipeline Reliability Evaluation
```bash
cd backend
python tests/evaluate_prompts.py
```
Evaluates all 6 academic benchmark scenarios (Feasible Web, AI/ML, Overambitious, Limited Skills, Strict Deadlines, High Technical Risk) against agent pipelines and fallback engines.

### Run Frontend Production Build
```bash
cd frontend
npm run build
```
Compiles and bundles the React production assets into `frontend/dist/`.

For complete empirical testing results, consult [docs/TESTING_REPORT.md](file:///c:/Projects/AI-Project-Mentor/docs/TESTING_REPORT.md).

---

## 📡 REST API Reference

### Faculty Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/faculty/dashboard` | Returns aggregate cohort KPI metrics (total, active, completed, attention, at risk, overdue). |
| `GET` | `/api/faculty/projects` | Returns searchable, filterable, and sortable project roster. |
| `GET` | `/api/faculty/projects/<id>` | Returns full project inspection record (timeline, progress logs, risks, health). |
| `POST` | `/api/faculty/summary` | Generates or regenerates a 9-point structured AI faculty briefing. |

### Student Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/onboarding/submit` | Submits student intake data and project proposal. |
| `POST` | `/api/projects` | Registers/syncs project metadata across storage layers. |
| `POST` | `/api/blueprint/generate` | Generates feasibility and scope analysis. |
| `POST` | `/api/technology/recommend`| Recommends language, framework, and database stacks. |
| `POST` | `/api/timeline/generate` | Generates milestone timeline schedule. |
| `POST` | `/api/risks/analyze` | Generates project risk register and mitigations. |
| `POST` | `/api/mentor/chat` | Multi-turn conversational mentorship query. |
| `POST` | `/api/progress/track` | Submits weekly progress update and recalculates health. |
| `POST` | `/api/timeline/adjust` | Dynamically reallocates delayed milestones. |
| `POST` | `/api/docs/synopsis` | Generates academic project synopsis. |
| `POST` | `/api/docs/methodology` | Generates technical methodology documentation. |
| `POST` | `/api/docs/progress-report` | Generates IEEE-style progress report. |

---

## 🛠️ Troubleshooting

- **MongoDB Connection Error**: If MongoDB is not installed or running, no action is required. The system automatically initializes in-memory fallback storage with seeded sample projects (`proj-001` to `proj-005`).
- **AI Provider 401 / Quota Error**: If API keys are missing or invalid, the platform activates its deterministic rule engine, returning structured milestone schedules and 9-point summaries without crashing.
- **Port Conflicts**: If port `5000` is occupied, change the `PORT` variable in `backend/.env`. If port `5173` is occupied, Vite will automatically offer the next available port (e.g., `5174`).

---

## 📚 Milestone 4 Documentation Index

- [Gap Analysis & Audit](file:///c:/Projects/AI-Project-Mentor/docs/MILESTONE4_GAP_ANALYSIS.md): Initial audit findings, defect matrix, and remediation plan.
- [Technical Architecture](file:///c:/Projects/AI-Project-Mentor/docs/TECHNICAL_ARCHITECTURE.md): Architectural topology, health formulas, persistence sync, and security controls.
- [Comprehensive Testing Report](file:///c:/Projects/AI-Project-Mentor/docs/TESTING_REPORT.md): 30 unit/E2E test cases, prompt evaluations, build checks, and execution results.
- [Final Project Report](file:///c:/Projects/AI-Project-Mentor/docs/FINAL_PROJECT_REPORT.md): Formal 17-section academic capstone report.
- [Demonstration Guide](file:///c:/Projects/AI-Project-Mentor/docs/DEMO_GUIDE.md): 5–10 minute step-by-step walkthrough script for student and faculty workflows.
