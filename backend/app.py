# pyrefly: ignore [missing-import]
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os

# ==================================================
# LOAD ENVIRONMENT VARIABLES
# ==================================================

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

print("OPENAI API KEY FOUND:", bool(OPENAI_API_KEY))
print("GEMINI API KEY FOUND:", bool(GEMINI_API_KEY))


from datetime import datetime, timezone
import re
import uuid

# ==================================================
# IMPORT DATABASE
# ==================================================

from database.mongodb import (
    test_connection,
    students_collection,
    projects_collection,
    progress_collection,
    timeline_collection,
    risks_collection,
    mentor_chats_collection,
    documentation_collection
)


# ==================================================
# IMPORT SERVICES & AGENTS
# ==================================================

from services.technology_agent import recommend_technology_stack
from services.timeline_agent import generate_timeline
from services.risk_service import analyze_project_risks
from services.mentor_service import chat_with_mentor
from services.plan_adjustment import adjust_timeline
from services.documentation_service import (
    generate_synopsis,
    generate_methodology,
    generate_progress_report
)
from services.health_service import calculate_project_health
from services.faculty_summary_service import generate_faculty_mentor_summary



# ==================================================
# CREATE FLASK APP
# ==================================================

app = Flask(__name__)
CORS(app)


# ==================================================
# HOME & HEALTH CHECK
# ==================================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "AI Project Mentor Backend is running",
        "version": "Milestone 3 Integrated",
        "success": True
    }), 200


@app.route("/api/health", methods=["GET"])
def health():
    try:
        mongodb_status = test_connection()
        return jsonify({
            "backend": "running",
            "mongodb": mongodb_status,
            "openai_api_key_loaded": bool(OPENAI_API_KEY),
            "gemini_api_key_loaded": bool(GEMINI_API_KEY),
            "milestone": "Milestone 3 Active",
            "success": True
        }), 200
    except Exception as e:
        return jsonify({
            "backend": "running",
            "mongodb": False,
            "error": str(e),
            "success": False
        }), 500


# ==================================================
# MILESTONE 2: TECHNOLOGY STACK RECOMMENDATION AGENT
# ==================================================

@app.route("/api/technology", methods=["POST"])
def technology_recommendation():
    try:
        data = request.get_json() or {}
        project_idea = data.get("project_idea")
        feasibility_analysis = data.get("feasibility_analysis")
        project_scope = data.get("project_scope")

        if not project_idea:
            return jsonify({
                "error": "project_idea is required",
                "success": False
            }), 400

        result = recommend_technology_stack(
            project_idea=project_idea,
            feasibility_analysis=feasibility_analysis,
            project_scope=project_scope
        )

        return jsonify({
            "success": True,
            "technology_recommendation": result
        }), 200

    except Exception as e:
        print("Technology Agent Error:", str(e))
        return jsonify({
            "error": str(e),
            "success": False
        }), 500


# ==================================================
# MILESTONE 2: MILESTONE & TIMELINE PLANNING AGENT
# ==================================================
# In-memory storage cache so the application works seamlessly even if local MongoDB is offline
IN_MEMORY_PROJECTS = []
IN_MEMORY_TIMELINES = []
IN_MEMORY_PROGRESS = []
IN_MEMORY_RISKS = []
IN_MEMORY_CHATS = []

DEFAULT_ACADEMIC_TIMELINE = {
    "project_title": "Academic Software Project",
    "total_duration_weeks": 8,
    "weekly_plan": [
        {
            "week": 1,
            "milestone": "Requirement Analysis & Scope Definition",
            "tasks": ["Understand problem statement", "Identify target users", "Finalize functional requirements"],
            "deliverables": ["Requirement specification document"]
        },
        {
            "week": 2,
            "milestone": "System Architecture & Database Design",
            "tasks": ["Design system architecture", "Design database schema", "Design UI wireframes"],
            "deliverables": ["Architecture diagram and schema design"]
        },
        {
            "week": 3,
            "milestone": "Backend API Development",
            "tasks": ["Develop REST APIs", "Implement data validation", "Set up database connections"],
            "deliverables": ["Working backend service"]
        },
        {
            "week": 4,
            "milestone": "Frontend UI Implementation",
            "tasks": ["Build user interface components", "Implement responsive layout", "Connect UI to backend APIs"],
            "deliverables": ["Interactive frontend interface"]
        },
        {
            "week": 5,
            "milestone": "Core AI / Logic Integration",
            "tasks": ["Integrate core AI/ML algorithms", "Process data pipeline", "Connect AI agents with APIs"],
            "deliverables": ["Integrated full-stack system"]
        },
        {
            "week": 6,
            "milestone": "Testing & Risk Mitigation",
            "tasks": ["Unit and API testing", "Integration testing", "Fix bugs and resolve blockers"],
            "deliverables": ["Tested prototype with bug fixes"]
        },
        {
            "week": 7,
            "milestone": "Review & Dynamic Plan Adjustment",
            "tasks": ["Faculty review checkpoint", "Refine project UI and performance", "Finalize report documentation"],
            "deliverables": ["Project synopsis and methodology report"]
        },
        {
            "week": 8,
            "milestone": "Final Demonstration & Submission",
            "tasks": ["Complete project report", "Prepare presentation slides", "Final project viva demonstration"],
            "deliverables": ["Final project deliverable and presentation"]
        }
    ]
}


def init_seed_projects():
    """Initializes realistic academic cohort projects for faculty monitoring."""
    if IN_MEMORY_PROJECTS:
        return
    initial_cohort = [
        {
            "id": "proj-1",
            "title": "Smart Attendance System",
            "student_name": "Ananya Reddy",
            "department": "Computer Science & Engineering",
            "academic_year": "4th Year",
            "category": "Computer Vision / AI",
            "description": "AI-based automated attendance tracker with facial recognition.",
            "objective": "Automate classroom attendance marking using camera streams.",
            "skills": ["Python", "React", "OpenCV"],
            "status": "in_progress",
            "progress_percentage": 78,
            "faculty_mentor": "Dr. Aris Thorne",
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "timeline": DEFAULT_ACADEMIC_TIMELINE,
            "progress_history": [
                {
                    "week": "Week 6",
                    "completed_tasks": ["Facial feature extraction", "Video feed capture", "Student embedding dataset"],
                    "pending_tasks": ["Complete face-recognition module testing"],
                    "progress_percentage": 78,
                    "status": "On Track",
                    "problems": "None reported",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            ],
            "risk_assessment": {
                "overall_risk": "LOW",
                "risks": [{"severity": "LOW", "risk": "Lighting variation in video capture", "mitigation": "Histogram equalization preprocessing"}]
            }
        },
        {
            "id": "proj-2",
            "title": "Crop Disease Detector",
            "student_name": "Karthik Varma",
            "department": "Information Technology",
            "academic_year": "4th Year",
            "category": "Deep Learning / Agriculture",
            "description": "Leaf disease diagnosis model with leaf symptom classification.",
            "objective": "Identify crop infections from leaf photos with mobile camera.",
            "skills": ["Python", "TensorFlow", "React Native"],
            "status": "in_progress",
            "progress_percentage": 52,
            "faculty_mentor": "Prof. Sarah Jenkins",
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "timeline": DEFAULT_ACADEMIC_TIMELINE,
            "progress_history": [
                {
                    "week": "Week 4",
                    "completed_tasks": ["Dataset collection from agricultural field", "Data augmentation"],
                    "pending_tasks": ["Finish labelling and start model training", "Cross-validation calibration"],
                    "progress_percentage": 52,
                    "status": "Needs Attention",
                    "problems": "Dataset labelling is taking longer than planned. 1 milestone delayed.",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            ],
            "risk_assessment": {
                "overall_risk": "MEDIUM",
                "risks": [
                    {"severity": "HIGH", "probability": "HIGH", "risk": "Insufficient labeled training samples for rare blight", "mitigation": "Transfer learning using PlantVillage pre-trained weights"}
                ]
            }
        },
        {
            "id": "proj-3",
            "title": "Campus Chatbot Assistant",
            "student_name": "Sneha Patel",
            "department": "Computer Science & Engineering",
            "academic_year": "3rd Year",
            "category": "NLP / Web",
            "description": "FAQ and academic calendar chatbot for university students.",
            "objective": "Deliver conversational academic guidance and circular lookups.",
            "skills": ["Python", "React", "spaCy", "MongoDB"],
            "status": "in_progress",
            "progress_percentage": 91,
            "faculty_mentor": "Dr. Aris Thorne",
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "timeline": DEFAULT_ACADEMIC_TIMELINE,
            "progress_history": [
                {
                    "week": "Week 7",
                    "completed_tasks": ["Intent classifier", "Campus database connector", "Chat widget UI", "Unit tests"],
                    "pending_tasks": ["Prepare final demo and documentation"],
                    "progress_percentage": 91,
                    "status": "On Track",
                    "problems": "None reported",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            ],
            "risk_assessment": {
                "overall_risk": "LOW",
                "risks": [{"severity": "LOW", "risk": "Occasional intent ambiguity", "mitigation": "Confidence threshold fallback to human advisor desk"}]
            }
        },
        {
            "id": "proj-4",
            "title": "Expense Tracker & Fraud Detector",
            "student_name": "Rohit Sharma",
            "department": "Data Science",
            "academic_year": "4th Year",
            "category": "Fintech / Machine Learning",
            "description": "Personal finance manager with anomaly detection on transactions.",
            "objective": "Detect suspicious transactions and summarize monthly spend.",
            "skills": ["Python", "React", "Scikit-learn"],
            "status": "in_progress",
            "progress_percentage": 24,
            "faculty_mentor": "Prof. Sarah Jenkins",
            "updated_at": "2026-09-26T10:00:00Z",
            "timeline": DEFAULT_ACADEMIC_TIMELINE,
            "progress_history": [
                {
                    "week": "Week 2",
                    "completed_tasks": ["Basic UI layout"],
                    "pending_tasks": ["Integrate the expense API with frontend", "Transaction anomaly model training", "MongoDB schema migration"],
                    "progress_percentage": 24,
                    "status": "Needs Attention",
                    "problems": "Critical crash in banking API integration; no update in over two weeks.",
                    "timestamp": "2026-09-26T10:00:00Z"
                }
            ],
            "risk_assessment": {
                "overall_risk": "HIGH",
                "risks": [
                    {"severity": "CRITICAL", "probability": "HIGH", "risk": "Third-party sandbox API credentials revoked", "mitigation": "Switch to mock synthetic dataset generator"}
                ]
            }
        },
        {
            "id": "proj-5",
            "title": "Library Management & Recommendation Portal",
            "student_name": "Meghana Rao",
            "department": "Information Technology",
            "academic_year": "4th Year",
            "category": "Full-Stack Web",
            "description": "Automated circulation desk and collaborative filtering book recommender.",
            "objective": "Streamline book search, reservations, and personalized reading recommendations.",
            "skills": ["React", "Flask", "MongoDB"],
            "status": "completed",
            "progress_percentage": 100,
            "faculty_mentor": "Dr. Aris Thorne",
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "timeline": DEFAULT_ACADEMIC_TIMELINE,
            "progress_history": [
                {
                    "week": "Week 8",
                    "completed_tasks": ["System deployment", "Final viva report", "Recommender evaluation", "Documentation"],
                    "pending_tasks": [],
                    "progress_percentage": 100,
                    "status": "On Track",
                    "problems": "None reported",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            ],
            "risk_assessment": {
                "overall_risk": "LOW",
                "risks": []
            }
        }
    ]
    for p in initial_cohort:
        IN_MEMORY_PROJECTS.append(dict(p))
        if projects_collection is not None:
            try:
                if not projects_collection.find_one({"id": p["id"]}):
                    projects_collection.insert_one(dict(p))
            except Exception as e:
                pass

init_seed_projects()


@app.route("/api/milestone-timeline", methods=["POST"])
def create_milestone_timeline():
    try:
        project_data = request.get_json() or {}
        if not project_data:
            return jsonify({
                "success": False,
                "message": "No project data provided"
            }), 400

        timeline = generate_timeline(project_data)

        # Fallback to academic timeline if LLM request failed or returned malformed structure
        if not timeline or not timeline.get("weekly_plan") or "error" in timeline:
            timeline = dict(DEFAULT_ACADEMIC_TIMELINE)
            if project_data.get("project_idea") or project_data.get("title"):
                timeline["project_title"] = project_data.get("project_idea") or project_data.get("title")

        timeline_document = {
            "project_title": timeline.get(
                "project_title",
                project_data.get("project_idea", "Academic Project")
            ),
            "total_duration_weeks": timeline.get("total_duration_weeks", 8),
            "weekly_plan": timeline.get("weekly_plan", [])
        }
        IN_MEMORY_TIMELINES.append(timeline_document)

        if timeline_collection is not None:
            try:
                timeline_collection.insert_one(dict(timeline_document))
            except Exception as dbe:
                print("MongoDB offline, cached timeline in-memory:", dbe)

        # Also link timeline to active project in IN_MEMORY_PROJECTS
        p_title = timeline_document["project_title"].lower()
        for p in IN_MEMORY_PROJECTS:
            if p.get("title", "").lower() == p_title or p.get("is_live"):
                p["timeline"] = timeline_document
                break

        return jsonify({
            "success": True,
            "timeline": timeline
        }), 200

    except Exception as e:
        print("Timeline Agent Error:", str(e))
        return jsonify({
            "success": False,
            "message": "Failed to generate project timeline",
            "error": str(e)
        }), 500



@app.route("/api/timeline", methods=["GET"])
def get_timeline():
    # 1. Try MongoDB if connected and available
    if timeline_collection is not None:
        try:
            timeline = timeline_collection.find_one(
                {},
                {"_id": 0},
                sort=[("_id", -1)]
            )
            if timeline:
                return jsonify({
                    "success": True,
                    "timeline": timeline,
                    "source": "mongodb"
                }), 200
        except Exception as dbe:
            print("MongoDB query offline, using memory/fallback:", dbe)

    # 2. Try In-Memory Cache
    if IN_MEMORY_TIMELINES:
        return jsonify({
            "success": True,
            "timeline": IN_MEMORY_TIMELINES[-1],
            "source": "memory"
        }), 200

    # 3. Fallback to default academic 8-week timeline
    return jsonify({
        "success": True,
        "timeline": DEFAULT_ACADEMIC_TIMELINE,
        "source": "default_academic_plan"
    }), 200


# ==================================================
# MILESTONE 3: RISK ASSESSMENT & MITIGATION AGENT
# ==================================================

@app.route("/api/risk-assessment", methods=["POST"])
def risk_assessment_route():
    try:
        data = request.get_json() or {}
        project_idea = data.get("project_idea") or data.get("title") or "Academic Project"
        feasibility_analysis = data.get("feasibility_analysis", "Feasible")
        project_scope = data.get("project_scope", "Prototype development")
        technology_stack = data.get("technology_stack", {})

        result = analyze_project_risks(
            project_idea=project_idea,
            feasibility_analysis=feasibility_analysis,
            project_scope=project_scope,
            technology_stack=technology_stack
        )

        if risks_collection is not None and result.get("success"):
            try:
                risks_collection.insert_one({
                    "project_idea": project_idea,
                    "assessment": result
                })
            except Exception as dbe:
                print("Could not persist risk assessment to DB:", dbe)

        return jsonify({
            "success": True,
            "risk_assessment": result
        }), 200

    except Exception as e:
        print("Risk Assessment Error:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/risk-assessment", methods=["GET"])
def get_latest_risk_assessment():
    try:
        if risks_collection is None:
            return jsonify({
                "success": False,
                "message": "MongoDB not connected"
            }), 404

        record = risks_collection.find_one({}, {"_id": 0}, sort=[("_id", -1)])
        if not record:
            return jsonify({
                "success": False,
                "message": "No risk assessment found"
            }), 404

        return jsonify({
            "success": True,
            "risk_assessment": record.get("assessment")
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ==================================================
# MILESTONE 3: CONVERSATIONAL AI MENTOR INTERACTION
# ==================================================

@app.route("/api/mentor/chat", methods=["POST"])
def mentor_chat_route():
    try:
        data = request.get_json() or {}
        message = data.get("message", "").strip()
        chat_history = data.get("chat_history", [])
        project_data = data.get("project_data", {})
        progress_data = data.get("progress_data", {})

        if not message:
            return jsonify({
                "success": False,
                "error": "Message cannot be empty"
            }), 400

        result = chat_with_mentor(
            message=message,
            chat_history=chat_history,
            project_data=project_data,
            progress_data=progress_data
        )

        if mentor_chats_collection is not None and result.get("success"):
            try:
                mentor_chats_collection.insert_one({
                    "message": message,
                    "reply": result.get("reply"),
                    "project_title": project_data.get("title"),
                    "timestamp": result.get("timestamp")
                })
            except Exception as dbe:
                print("Could not persist mentor chat to DB:", dbe)

        return jsonify(result), 200

    except Exception as e:
        print("Mentor Chat Error:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ==================================================
# MILESTONE 3: PROGRESS TRACKING & PLAN ADJUSTMENT
# ==================================================

@app.route("/api/progress", methods=["POST"])
def track_progress():
    try:
        data = request.get_json() or {}
        week = data.get("week")
        current_task = data.get("current_task")
        completed_tasks = data.get("completed_tasks", "")
        pending_tasks = data.get("pending_tasks", "")
        problems = data.get("problems", "")
        current_timeline = data.get("current_timeline")

        if not week:
            return jsonify({"error": "week is required", "success": False}), 400
        if not current_task:
            return jsonify({"error": "current_task is required", "success": False}), 400
        if not completed_tasks and not pending_tasks:
            return jsonify({
                "error": "At least completed_tasks or pending_tasks is required",
                "success": False
            }), 400

        completed_list = [
            t.strip() for t in str(completed_tasks).replace("\n", ",").split(",") if t.strip()
        ]
        pending_list = [
            t.strip() for t in str(pending_tasks).replace("\n", ",").split(",") if t.strip()
        ]

        completed_count = len(completed_list)
        pending_count = len(pending_list)
        total_tasks = completed_count + pending_count

        progress = round((completed_count / total_tasks) * 100) if total_tasks > 0 else 0

        if progress >= 80:
            status = "On Track"
        elif progress >= 50:
            status = "In Progress"
        else:
            status = "Needs Attention"

        progress_document = {
            "week": week,
            "current_task": current_task,
            "completed_tasks": completed_list,
            "pending_tasks": pending_list,
            "completed_count": completed_count,
            "pending_count": pending_count,
            "total_tasks": total_tasks,
            "progress_percentage": progress,
            "status": status,
            "problems": problems
        }

        IN_MEMORY_PROGRESS.append(dict(progress_document))

        if progress_collection is not None:
            try:
                progress_collection.insert_one(dict(progress_document))
            except Exception as dbe:
                print("Could not persist progress to DB:", dbe)

        # Plan adjustment triggering
        adjusted_plan_data = None
        plan_adjusted = False
        
        # If there are delayed or pending tasks and a timeline is provided, recalculate schedule
        if (pending_count > 0 or "delay" in str(problems).lower() or status == "Needs Attention") and current_timeline:
            try:
                # Format progress tasks for plan_adjustment algorithm
                progress_items = []
                for t in completed_list:
                    progress_items.append({"task": t, "status": "completed", "week": 1})
                for t in pending_list:
                    progress_items.append({"task": t, "status": "delayed", "week": 1})

                adj_result = adjust_timeline(current_timeline, progress_items)
                if adj_result.get("adjustment_required"):
                    adjusted_plan_data = adj_result
                    plan_adjusted = True
            except Exception as adje:
                print("Plan adjustment trigger error:", adje)

        # Synchronize progress with corresponding project in IN_MEMORY_PROJECTS
        proj_title = data.get("project_title") or data.get("title")
        now_iso = datetime.now(timezone.utc).isoformat()
        progress_document["timestamp"] = now_iso
        matched = False
        for p in IN_MEMORY_PROJECTS:
            if (proj_title and p.get("title", "").lower() == str(proj_title).lower()) or (data.get("project_id") and str(p.get("id")) == str(data.get("project_id"))):
                p.setdefault("progress_history", []).append(dict(progress_document))
                p["progress_percentage"] = progress
                p["status"] = "completed" if progress >= 100 else "in_progress"
                p["updated_at"] = now_iso
                if adjusted_plan_data and adjusted_plan_data.get("updated_plan"):
                    p["timeline"] = adjusted_plan_data["updated_plan"]
                matched = True
                break

        if not matched and IN_MEMORY_PROJECTS:
            # Sync to the first live student project if present
            live_p = next((p for p in IN_MEMORY_PROJECTS if p.get("is_live")), None)
            if live_p:
                live_p.setdefault("progress_history", []).append(dict(progress_document))
                live_p["progress_percentage"] = progress
                live_p["status"] = "completed" if progress >= 100 else "in_progress"
                live_p["updated_at"] = now_iso

        return jsonify({
            "success": True,
            "message": "Progress calculated and saved successfully",
            "progress": progress_document,
            "plan_adjusted": plan_adjusted,
            "adjusted_plan": adjusted_plan_data
        }), 200

    except Exception as e:
        print("Progress Tracking Error:", str(e))
        return jsonify({"error": str(e), "success": False}), 500


@app.route("/api/progress", methods=["GET"])
def get_progress():
    if progress_collection is not None:
        try:
            progress_data = list(progress_collection.find({}, {"_id": 0}))
            if progress_data:
                return jsonify({
                    "success": True,
                    "progress": progress_data
                }), 200
        except Exception as dbe:
            print("MongoDB offline for progress, returning in-memory:", dbe)

    return jsonify({
        "success": True,
        "progress": IN_MEMORY_PROGRESS
    }), 200


@app.route("/api/plan-adjustment", methods=["POST"])
def manual_plan_adjustment():
    try:
        data = request.get_json() or {}
        original_plan = data.get("original_plan")
        progress_data = data.get("progress_data", [])
        risk_data = data.get("risk_data", {})

        if not original_plan:
            return jsonify({
                "success": False,
                "message": "Original plan is required"
            }), 400

        result = adjust_timeline(original_plan, progress_data, risk_data)
        return jsonify({
            "success": True,
            "result": result
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ==================================================
# MILESTONE 3: ON-DEMAND DOCUMENTATION GENERATION
# ==================================================

@app.route("/api/project/synopsis", methods=["POST"])
def generate_project_synopsis_endpoint():
    try:
        data = request.get_json() or {}
        synopsis = generate_synopsis(data)
        return jsonify({
            "success": True,
            "synopsis": synopsis
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/project/methodology", methods=["POST"])
def generate_project_methodology_endpoint():
    try:
        data = request.get_json() or {}
        methodology = generate_methodology(data)
        return jsonify({
            "success": True,
            "methodology": methodology
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/project/progress-report", methods=["POST"])
def generate_project_progress_report_endpoint():
    try:
        data = request.get_json() or {}
        idea = data.get("project_idea") or data.get("title") or "Academic Project"
        completed = data.get("completed_tasks", [])
        pending = data.get("pending_tasks", [])
        current_progress = data.get("current_progress")
        risks = data.get("risks", [])
        problems = data.get("problems", [])
        next_week = data.get("next_week_plan", [])

        report = generate_progress_report(
            idea,
            completed_tasks=completed,
            pending_tasks=pending,
            current_progress=current_progress,
            risks=risks,
            problems=problems,
            next_week_plan=next_week
        )

        return jsonify({
            "success": True,
            "progress_report": report
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ==================================================
# MILESTONE 4: PROJECT MANAGEMENT & COHORT REGISTRATION
# ==================================================

@app.route("/api/projects", methods=["GET"])
def get_projects():
    try:
        # Try MongoDB first
        if projects_collection is not None:
            try:
                db_projects = list(projects_collection.find({}, {"_id": 0}))
                if db_projects:
                    return jsonify({"success": True, "projects": db_projects}), 200
            except Exception:
                pass
        return jsonify({"success": True, "projects": IN_MEMORY_PROJECTS}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/projects", methods=["POST"])
def create_or_update_project():
    try:
        data = request.get_json() or {}
        title = data.get("title") or data.get("project_title")
        if not title:
            return jsonify({"success": False, "error": "Project title is required"}), 400

        student_name = data.get("student_name") or data.get("name") or "Student"
        department = data.get("department", "Computer Science & Engineering")
        academic_year = data.get("academic_year") or data.get("year", "4th Year")
        category = data.get("category", "General Software")
        description = data.get("description", "")
        objective = data.get("objective", "")
        skills = data.get("skills", [])
        faculty_mentor = data.get("faculty_mentor", "Dr. Aris Thorne")

        now_iso = datetime.now(timezone.utc).isoformat()

        # Check if project already exists
        existing = next((p for p in IN_MEMORY_PROJECTS if p.get("title", "").lower() == str(title).lower() or (data.get("id") and str(p.get("id")) == str(data.get("id")))), None)
        if existing:
            existing.update({
                "title": title,
                "student_name": student_name,
                "department": department,
                "academic_year": academic_year,
                "category": category,
                "description": description,
                "objective": objective,
                "skills": skills,
                "updated_at": now_iso
            })
            project_doc = existing
        else:
            project_id = data.get("id") or f"proj-live-{len(IN_MEMORY_PROJECTS) + 1}"
            project_doc = {
                "id": project_id,
                "title": title,
                "student_name": student_name,
                "department": department,
                "academic_year": academic_year,
                "category": category,
                "description": description,
                "objective": objective,
                "skills": skills,
                "status": "in_progress",
                "progress_percentage": data.get("progress_percentage", 0),
                "faculty_mentor": faculty_mentor,
                "is_live": True,
                "updated_at": now_iso,
                "timeline": data.get("timeline") or dict(DEFAULT_ACADEMIC_TIMELINE),
                "progress_history": data.get("progress_history", []),
                "risk_assessment": data.get("risk_assessment", {"overall_risk": "LOW", "risks": []})
            }
            IN_MEMORY_PROJECTS.insert(0, project_doc)

        if projects_collection is not None:
            try:
                projects_collection.update_one(
                    {"id": project_doc["id"]},
                    {"$set": dict(project_doc)},
                    upsert=True
                )
            except Exception as dbe:
                print("Could not persist project to DB:", dbe)

        return jsonify({
            "success": True,
            "message": "Project registered successfully",
            "project": project_doc
        }), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ==================================================
# MILESTONE 4: FACULTY DASHBOARD & HEALTH MONITORING
# ==================================================

@app.route("/api/faculty/dashboard", methods=["GET"])
def get_faculty_dashboard():
    try:
        projects = IN_MEMORY_PROJECTS
        total = len(projects)
        not_started = 0
        in_progress = 0
        completed = 0
        needs_attention = 0
        at_risk = 0
        total_overdue = 0
        progress_sum = 0
        health_dist = {
            "Healthy": 0,
            "Needs Attention": 0,
            "At Risk": 0,
            "Completed": 0,
            "Unknown": 0
        }

        for p in projects:
            p_health = calculate_project_health(
                project_data=p,
                timeline_data=p.get("timeline"),
                progress_records=p.get("progress_history", []),
                risk_data=p.get("risk_assessment", {})
            )
            h_status = p_health.get("health_status", "Unknown")
            health_dist[h_status] = health_dist.get(h_status, 0) + 1

            pct = p_health.get("progress_percentage", 0)
            progress_sum += pct
            total_overdue += p_health.get("overdue_count", 0)

            if h_status == "Completed" or pct >= 100:
                completed += 1
            elif pct == 0:
                not_started += 1
            else:
                in_progress += 1

            if h_status == "Needs Attention":
                needs_attention += 1
            elif h_status == "At Risk":
                at_risk += 1

        avg_progress = round(progress_sum / total, 1) if total > 0 else 0

        return jsonify({
            "success": True,
            "overview": {
                "total_projects": total,
                "not_started": not_started,
                "in_progress": in_progress,
                "completed": completed,
                "needs_attention": needs_attention,
                "at_risk": at_risk,
                "overdue_milestones": total_overdue,
                "average_progress": avg_progress,
                "health_distribution": health_dist
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/faculty/projects", methods=["GET"])
def get_faculty_projects():
    try:
        search_query = request.args.get("search", "").strip().lower()
        health_filter = request.args.get("health", "").strip()
        status_filter = request.args.get("status", "").strip().lower()
        sort_by = request.args.get("sort", "progress_desc").strip()

        projects_list = []
        for p in IN_MEMORY_PROJECTS:
            timeline = p.get("timeline") or DEFAULT_ACADEMIC_TIMELINE
            weekly_plan = timeline.get("weekly_plan", [])
            total_milestones = len(weekly_plan)

            p_health = calculate_project_health(
                project_data=p,
                timeline_data=timeline,
                progress_records=p.get("progress_history", []),
                risk_data=p.get("risk_assessment", {})
            )

            # Find next deadline milestone
            latest_progress = (p.get("progress_history") or [{}])[-1]
            completed_tasks = latest_progress.get("completed_tasks", [])
            next_deadline = "Final Submission"
            for wp in weekly_plan:
                wp_tasks = wp.get("tasks", [])
                if not wp_tasks or not all(t in completed_tasks for t in wp_tasks):
                    next_deadline = f"Week {wp.get('week', 1)}: {wp.get('milestone', '')}"
                    break

            risk_meta = p.get("risk_assessment", {})
            risk_level = risk_meta.get("overall_risk") or ("HIGH" if p_health["critical_risks_count"] > 0 else "LOW")

            entry = {
                "id": p.get("id"),
                "title": p.get("title"),
                "student_name": p.get("student_name"),
                "department": p.get("department"),
                "academic_year": p.get("academic_year"),
                "category": p.get("category"),
                "description": p.get("description"),
                "faculty_mentor": p.get("faculty_mentor", "Dr. Aris Thorne"),
                "status": p.get("status", "in_progress"),
                "progress_percentage": p_health.get("progress_percentage", 0),
                "total_milestones": total_milestones,
                "next_deadline": next_deadline,
                "risk_level": risk_level,
                "last_updated": p.get("updated_at"),
                "is_live": p.get("is_live", False),
                "health": p_health
            }
            projects_list.append(entry)

        # Apply search filter
        if search_query:
            projects_list = [
                p for p in projects_list
                if search_query in str(p.get("title", "")).lower()
                or search_query in str(p.get("student_name", "")).lower()
                or search_query in str(p.get("category", "")).lower()
                or search_query in str(p.get("department", "")).lower()
            ]

        # Apply health filter
        if health_filter and health_filter.lower() != "all":
            projects_list = [
                p for p in projects_list
                if p["health"]["health_status"].lower() == health_filter.lower()
            ]

        # Apply status filter
        if status_filter and status_filter.lower() != "all":
            projects_list = [
                p for p in projects_list
                if p.get("status", "").lower() == status_filter.lower()
            ]

        # Apply sorting
        if sort_by == "progress_asc":
            projects_list.sort(key=lambda x: x["progress_percentage"])
        elif sort_by == "name":
            projects_list.sort(key=lambda x: x["student_name"].lower())
        elif sort_by == "health":
            rank = {"At Risk": 0, "Needs Attention": 1, "Healthy": 2, "Completed": 3, "Unknown": 4}
            projects_list.sort(key=lambda x: rank.get(x["health"]["health_status"], 5))
        elif sort_by == "updated":
            projects_list.sort(key=lambda x: str(x.get("last_updated", "")), reverse=True)
        else:  # progress_desc
            projects_list.sort(key=lambda x: x["progress_percentage"], reverse=True)

        return jsonify({
            "success": True,
            "count": len(projects_list),
            "projects": projects_list
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/faculty/projects/<project_id>", methods=["GET"])
def get_faculty_project_detail(project_id):
    try:
        p = next((proj for proj in IN_MEMORY_PROJECTS if str(proj.get("id")) == str(project_id) or proj.get("title", "").lower() == str(project_id).lower()), None)
        if not p:
            return jsonify({"success": False, "error": "Project not found"}), 404

        timeline = p.get("timeline") or DEFAULT_ACADEMIC_TIMELINE
        health = calculate_project_health(
            project_data=p,
            timeline_data=timeline,
            progress_records=p.get("progress_history", []),
            risk_data=p.get("risk_assessment", {})
        )

        summary_result = generate_faculty_mentor_summary(
            project=p,
            health=health,
            progress_history=p.get("progress_history", []),
            timeline=timeline,
            risks=p.get("risk_assessment", {})
        )

        return jsonify({
            "success": True,
            "project": p,
            "health": health,
            "summary": summary_result.get("summary")
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/faculty/summary", methods=["POST"])
def generate_faculty_summary_endpoint():
    try:
        data = request.get_json() or {}
        project_id = data.get("project_id")
        project_payload = data.get("project")

        p = None
        if project_id:
            p = next((proj for proj in IN_MEMORY_PROJECTS if str(proj.get("id")) == str(project_id) or proj.get("title", "").lower() == str(project_id).lower()), None)
        if not p and project_payload:
            p = project_payload

        if not p:
            return jsonify({"success": False, "error": "Valid project_id or project object is required"}), 400

        timeline = p.get("timeline") or DEFAULT_ACADEMIC_TIMELINE
        health = calculate_project_health(
            project_data=p,
            timeline_data=timeline,
            progress_records=p.get("progress_history", []),
            risk_data=p.get("risk_assessment", {})
        )

        summary_res = generate_faculty_mentor_summary(
            project=p,
            health=health,
            progress_history=p.get("progress_history", []),
            timeline=timeline,
            risks=p.get("risk_assessment", {})
        )

        return jsonify(summary_res), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ==================================================
# RUN FLASK SERVER
# ==================================================

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )

