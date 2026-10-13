import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception as e:
        return None

def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or "your_" in api_key:
        return None
    try:
        from openai import OpenAI
        return OpenAI(api_key=api_key)
    except Exception as e:
        return None

def generate_synopsis(project_data_or_idea, blueprint=""):
    """
    On-Demand Documentation Generation: Project Synopsis
    """
    if isinstance(project_data_or_idea, dict):
        title = project_data_or_idea.get("title") or "AI Academic Project"
        description = project_data_or_idea.get("description") or ""
        objective = project_data_or_idea.get("objective") or ""
        category = project_data_or_idea.get("category") or "Software Engineering"
        skills = project_data_or_idea.get("skills") or "Python, React, MongoDB"
    else:
        title = "AI-Guided Academic Project"
        description = str(project_data_or_idea or "")
        objective = "Develop an intelligent software system solving academic project workflow challenges."
        category = "AI / Web Application"
        skills = "Python, React, MongoDB, Machine Learning"

    prompt = f"""Generate a formal, publication-ready Academic Project Synopsis for an engineering/CS project:
Project Title: {title}
Category: {category}
Description: {description}
Objective: {objective}
Technologies: {skills}

Include these standard academic sections:
1. PROJECT TITLE
2. INTRODUCTION & BACKGROUND
3. PROBLEM STATEMENT
4. OBJECTIVES (Numbered)
5. PROPOSED SYSTEM & SCOPE
6. SYSTEM ARCHITECTURE & TECHNOLOGY STACK
7. HARDWARE & SOFTWARE REQUIREMENTS
8. EXPECTED OUTCOMES & DELIVERABLES
"""

    gemini_client = get_gemini_client()
    if gemini_client:
        try:
            res = gemini_client.models.generate_content(
                model="gemini-flash-latest",
                contents=prompt
            )
            return res.text.strip()
        except Exception:
            pass

    openai_client = get_openai_client()
    if openai_client:
        try:
            res = openai_client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                messages=[
                    {"role": "system", "content": "You are an academic project supervisor. Format documents cleanly in Markdown."},
                    {"role": "user", "content": prompt}
                ]
            )
            return res.choices[0].message.content.strip()
        except Exception:
            pass

    # Heuristic fallback
    return f"""============================================================
ACADEMIC PROJECT SYNOPSIS
============================================================

1. PROJECT TITLE
{title}

2. DOMAIN & CATEGORY
{category}

3. PROBLEM STATEMENT
Students and institutions face significant challenges in organizing, executing,
and maintaining quality across technical projects. {description or 'Existing manual workflows lack structured tracking, automated risk mitigation, and continuous technical mentorship.'}

4. OBJECTIVES
- Objective 1: {objective or 'Design and implement a scalable full-stack application with modular architecture.'}
- Objective 2: Establish an automated workflow pipeline ensuring reliable milestone tracking.
- Objective 3: Provide an intuitive, modern interface for seamless user interaction and status reporting.

5. PROJECT SCOPE
In Scope:
- Core application frontend and backend RESTful APIs
- Persistent database storage with schema validation
- Automated progress tracking and analytical reporting
- Structured milestone execution and validation

Out of Scope:
- Commercial production scaling and high-availability multi-region cluster deployment
- Third-party paid enterprise software integrations

6. TECHNOLOGY STACK
- Frontend: React.js (Modern Component Architecture)
- Backend: Python Flask REST API
- Database: MongoDB (Document-Oriented Storage)
- Core Languages & Tools: {skills}
- AI / Automation: Agentic Workflows & Google Gemini

7. HARDWARE & SOFTWARE REQUIREMENTS
Hardware:
- Processor: Intel Core i5 / AMD Ryzen 5 or higher
- RAM: 8 GB minimum (16 GB recommended)
- Storage: 20 GB free disk space

Software:
- Operating System: Windows 10/11, macOS, or Linux
- Environment: Python 3.10+, Node.js 18+
- Tools: VS Code, Git, MongoDB Compass, Web Browser

8. EXPECTED OUTCOMES
A verified, fully functional software prototype meeting all specified functional
requirements, complete with comprehensive documentation and milestone reports.

============================================================
DOCUMENT GENERATED: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
============================================================
"""

def generate_methodology(project_data_or_idea, blueprint=""):
    """
    On-Demand Documentation Generation: System Methodology
    """
    if isinstance(project_data_or_idea, dict):
        title = project_data_or_idea.get("title") or "AI Academic Project"
        description = project_data_or_idea.get("description") or ""
        category = project_data_or_idea.get("category") or "Software Engineering"
        skills = project_data_or_idea.get("skills") or "Python, React, MongoDB"
    else:
        title = "AI-Guided Academic Project"
        description = str(project_data_or_idea or "")
        category = "AI / Web Application"
        skills = "Python, React, MongoDB"

    prompt = f"""Generate a detailed Academic Project Methodology Report for an engineering project:
Project Title: {title}
Category: {category}
Description: {description}
Technologies: {skills}

Include:
1. METHODOLOGY OVERVIEW (Agile / Iterative model rationale)
2. SYSTEM ARCHITECTURE & DATA FLOW
3. MODULAR BREAKDOWN (Layer-by-layer)
4. BACKEND & API DESIGN
5. DATABASE DESIGN & DATA MODELING
6. IMPLEMENTATION PHASES & MILESTONES
7. TESTING & VALIDATION STRATEGY (Unit, Integration, End-to-End)
8. DEPLOYMENT & MAINTENANCE
"""

    gemini_client = get_gemini_client()
    if gemini_client:
        try:
            res = gemini_client.models.generate_content(
                model="gemini-flash-latest",
                contents=prompt
            )
            return res.text.strip()
        except Exception:
            pass

    openai_client = get_openai_client()
    if openai_client:
        try:
            res = openai_client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                messages=[
                    {"role": "system", "content": "You are an academic project supervisor. Format documents cleanly in Markdown."},
                    {"role": "user", "content": prompt}
                ]
            )
            return res.choices[0].message.content.strip()
        except Exception:
            pass

    return f"""============================================================
PROJECT METHODOLOGY & SYSTEM ARCHITECTURE
============================================================

PROJECT TITLE: {title}
DOMAIN: {category}

1. DEVELOPMENT MODEL
The project adopts an Agile / Iterative Incremental development lifecycle.
This facilitates continuous testing, rapid feedback integration, and weekly milestone calibration.

2. SYSTEM ARCHITECTURE
The system employs a decoupled 3-tier client-server architecture:
- Presentation Layer: React 18 single-page application with responsive CSS
- Application Layer: Python Flask server exposing stateless REST endpoints
- Persistence Layer: MongoDB database utilizing flexible document collections

3. DATA FLOW & COMMUNICATION PIPELINE
1. Client initiates requests via asynchronous fetch / Axios HTTP calls.
2. Flask backend routes validate incoming payloads and enforce schema integrity.
3. Service workers and AI agents process business logic and model inference.
4. Database transactions are committed to MongoDB collections.
5. Structured JSON responses are returned to the client and rendered dynamically.

4. MODULAR BREAKDOWN
- Module 1: Student Profile & Skill Evaluation Engine
- Module 2: Project Ingestion & Feasibility Analysis Pipeline
- Module 3: Technology Recommendation & Scope Agent
- Module 4: Milestone & Timeline Planning Engine
- Module 5: Risk Assessment & Mitigation Agent
- Module 6: Conversational Mentor Interaction System
- Module 7: Automated Documentation Generation Hub

5. TESTING AND QUALITY ASSURANCE
- Unit Testing: Individual verification of agent heuristic rules and service modules.
- Integration Testing: Validation of API contracts between React and Flask.
- Pipeline Testing: End-to-end evaluation using realistic student project scenarios.
- Security Verification: Validation of environment variable isolation and credential safety.

============================================================
DOCUMENT GENERATED: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
============================================================
"""

def generate_progress_report(
    project_idea,
    completed_tasks=None,
    pending_tasks=None,
    current_progress=None,
    risks=None,
    problems=None,
    next_week_plan=None
):
    """
    On-Demand Documentation Generation: Weekly Progress Report
    """
    completed_tasks = completed_tasks or ["Student Profile setup", "Project Submission", "Tech Stack Analysis"]
    pending_tasks = pending_tasks or ["Integration Testing", "Final Report Preparation"]
    current_progress = current_progress or "Milestones 1 & 2 Completed; Milestone 3 in progress."
    risks = risks or ["Timeline scheduling conflicts", "API quota limits"]
    problems = problems or ["None reported"]
    next_week_plan = next_week_plan or ["Complete Milestone 3 integration", "Commence Milestone 4 dashboard"]

    report = f"""============================================================
ACADEMIC PROJECT PROGRESS REPORT
============================================================

PROJECT: {project_idea}
REPORT DATE: {datetime.now().strftime("%B %d, %Y")}
OVERALL STATUS: {current_progress}

------------------------------------------------------------
1. COMPLETED MILESTONE DELIVERABLES
------------------------------------------------------------
"""
    for task in completed_tasks:
        report += f"  [✓] {task}\n"

    report += """
------------------------------------------------------------
2. IN-PROGRESS & PENDING TASKS
------------------------------------------------------------
"""
    for task in pending_tasks:
        report += f"  [⏳] {task}\n"

    report += """
------------------------------------------------------------
3. IDENTIFIED RISKS & BLOCKERS
------------------------------------------------------------
"""
    for r in risks:
        report += f"  [!] {r}\n"

    report += """
------------------------------------------------------------
4. PROBLEMS ENCOUNTERED & RESOLUTIONS
------------------------------------------------------------
"""
    for p in problems:
        report += f"  - {p}\n"

    report += """
------------------------------------------------------------
5. ACTION PLAN FOR UPCOMING SPRINT
------------------------------------------------------------
"""
    for n in next_week_plan:
        report += f"  → {n}\n"

    report += """
------------------------------------------------------------
6. SUPERVISOR / MENTOR REVIEW SIGN-OFF
------------------------------------------------------------
Student Signature: _______________________      Date: ____________
Mentor Signature:  _______________________      Date: ____________

============================================================
END OF PROGRESS REPORT
============================================================
"""
    return report