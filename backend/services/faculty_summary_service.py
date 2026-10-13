"""
Faculty Mentor Summary Generation Service (Milestone 4)
Generates concise, actionable, evidence-based executive summaries for faculty advisors
using real project records, health metrics, and LLM reasoning with a robust
deterministic fallback engine.
"""

import os
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional

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
        print("Gemini client initialization error:", e)
        return None


def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or "your_" in api_key:
        return None
    try:
        from openai import OpenAI
        return OpenAI(api_key=api_key)
    except Exception as e:
        print("OpenAI client initialization error:", e)
        return None


def generate_faculty_mentor_summary(
    project: Dict[str, Any],
    health: Optional[Dict[str, Any]] = None,
    progress_history: Optional[list] = None,
    timeline: Optional[Dict[str, Any]] = None,
    risks: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Produces a 9-point structured faculty mentor summary.
    Attempts LLM generation with strict JSON schema validation,
    falling back to a rigorous deterministic summary if LLM calls fail.
    """
    health = health or {}
    progress_history = progress_history or []
    timeline = timeline or {}
    risks = risks or {}

    generation_time = datetime.now(timezone.utc).isoformat()
    underlying_data_time = (
        progress_history[-1].get("timestamp")
        if progress_history and progress_history[-1].get("timestamp")
        else project.get("updated_at") or generation_time
    )

    student_name = project.get("student_name") or project.get("name") or "Student"
    project_title = project.get("title") or project.get("project_title") or "Academic Project"
    health_status = health.get("health_status", "Needs Attention")
    progress_pct = health.get("progress_percentage", project.get("progress_percentage", 0))

    # Compile factual context from database records
    latest_progress = progress_history[-1] if progress_history else {}
    completed_tasks = latest_progress.get("completed_tasks", [])
    pending_tasks = latest_progress.get("pending_tasks", [])
    problems_reported = latest_progress.get("problems", "None reported")
    
    # Milestone status extraction
    weekly_plan = timeline.get("weekly_plan", [])
    completed_milestones = []
    pending_milestones = []
    upcoming_deadlines = []

    for wp in weekly_plan:
        w_num = wp.get("week", 1)
        m_name = wp.get("milestone", f"Week {w_num}")
        # A milestone is completed if all its tasks are in completed_tasks
        tasks_in_week = wp.get("tasks", [])
        if tasks_in_week and all(t in completed_tasks for t in tasks_in_week):
            completed_milestones.append(f"Week {w_num}: {m_name}")
        else:
            pending_milestones.append(f"Week {w_num}: {m_name}")
            if len(upcoming_deadlines) < 2:
                upcoming_deadlines.append(f"Week {w_num} Deadline: {m_name}")

    if not upcoming_deadlines and pending_milestones:
        upcoming_deadlines = [pending_milestones[0]]

    # Risks breakdown
    unresolved_risks_list = []
    for r in risks.get("risks", []):
        if isinstance(r, dict):
            unresolved_risks_list.append(f"[{r.get('severity', 'MED')}] {r.get('risk', '')}: {r.get('mitigation', '')}")

    # Changes since previous update
    changes_since_previous = "Initial progress logged."
    if len(progress_history) > 1:
        prev = progress_history[-2]
        prev_pct = prev.get("progress_percentage", 0)
        diff = progress_pct - prev_pct
        changes_since_previous = (
            f"Progress increased by {diff}% since previous update ({prev.get('week', 'previous sprint')}). "
            f"New tasks completed: {len(completed_tasks)}. "
            f"Active blockers updated: '{problems_reported}'."
        )

    # ----------------------------------------------------
    # Prompt for AI Generation
    # ----------------------------------------------------
    prompt = f"""You are the Faculty Mentorship Lead in an academic project management platform.
Generate a concise, professional, evidence-based faculty mentor summary for the faculty supervisor.

DO NOT hallucinate or invent deliverables, dates, or blockers not mentioned below.

PROJECT CONTEXT:
- Student / Team: {student_name}
- Project Title: {project_title}
- Department: {project.get('department', 'Computer Science & Engineering')}
- Health Status: {health_status} (Score: {health.get('health_score', 50)}/100)
- Progress: {progress_pct}% completed
- Completed Tasks: {json.dumps(completed_tasks)}
- Pending / Delayed Tasks: {json.dumps(pending_tasks)}
- Reported Problems: {problems_reported}
- Completed Milestones: {json.dumps(completed_milestones)}
- Pending Milestones: {json.dumps(pending_milestones)}
- Upcoming Deadlines: {json.dumps(upcoming_deadlines)}
- Identified Risks: {json.dumps(unresolved_risks_list)}
- Changes Since Previous Check-in: {changes_since_previous}

OUTPUT REQUIREMENTS:
Return ONLY a valid JSON object matching this exact schema:
{{
  "current_status": "Concise summary of overall standing, milestone pace, and active health state",
  "recent_achievements": ["Achievement 1 based on completed tasks", "Achievement 2"],
  "milestone_status": {{
    "completed": ["Milestone A", "Milestone B"],
    "pending": ["Milestone C", "Milestone D"]
  }},
  "upcoming_and_overdue_deadlines": ["Deadline details"],
  "current_blockers_and_risks": ["Specific blocker or unresolved risk"],
  "important_changes": "Clear sentence describing progress delta or status change since previous report",
  "recommended_faculty_intervention": "Specific, actionable intervention the professor/advisor should take",
  "prioritized_next_actions": [
    "Immediate action 1 for student",
    "Action 2 for student"
  ]
}}
"""

    # 1. Attempt Gemini Generation
    gemini_client = get_gemini_client()
    if gemini_client:
        try:
            response = gemini_client.models.generate_content(
                model="gemini-flash-latest",
                contents=prompt
            )
            raw = response.text.strip()
            if raw.startswith("```json"):
                raw = raw[7:]
            elif raw.startswith("```"):
                raw = raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]
            parsed = json.loads(raw.strip())
            
            # Validate required keys
            if _validate_summary_schema(parsed):
                parsed["source"] = "ai_gemini"
                parsed["generation_timestamp"] = generation_time
                parsed["data_timestamp"] = underlying_data_time
                parsed["health_status"] = health_status
                parsed["health_score"] = health.get("health_score", 50)
                parsed["project_title"] = project_title
                parsed["student_name"] = student_name
                return {"success": True, "summary": parsed}
        except Exception as e:
            print("Gemini faculty summary generation error, falling back:", e)

    # 2. Attempt OpenAI Generation
    openai_client = get_openai_client()
    if openai_client:
        try:
            model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            res = openai_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are an academic project faculty advisor. Respond strictly in valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            parsed = json.loads(res.choices[0].message.content)
            if _validate_summary_schema(parsed):
                parsed["source"] = "ai_openai"
                parsed["generation_timestamp"] = generation_time
                parsed["data_timestamp"] = underlying_data_time
                parsed["health_status"] = health_status
                parsed["health_score"] = health.get("health_score", 50)
                parsed["project_title"] = project_title
                parsed["student_name"] = student_name
                return {"success": True, "summary": parsed}
        except Exception as e:
            print("OpenAI faculty summary generation error, falling back:", e)

    # 3. Deterministic Fallback Engine
    deterministic_summary = _build_deterministic_summary(
        student_name=student_name,
        project_title=project_title,
        health_status=health_status,
        health=health,
        progress_pct=progress_pct,
        completed_tasks=completed_tasks,
        pending_tasks=pending_tasks,
        problems_reported=problems_reported,
        completed_milestones=completed_milestones,
        pending_milestones=pending_milestones,
        upcoming_deadlines=upcoming_deadlines,
        unresolved_risks_list=unresolved_risks_list,
        changes_since_previous=changes_since_previous,
        generation_time=generation_time,
        underlying_data_time=underlying_data_time
    )

    return {"success": True, "summary": deterministic_summary}


def _validate_summary_schema(data: Any) -> bool:
    if not isinstance(data, dict):
        return False
    required_keys = [
        "current_status",
        "recent_achievements",
        "milestone_status",
        "upcoming_and_overdue_deadlines",
        "current_blockers_and_risks",
        "important_changes",
        "recommended_faculty_intervention",
        "prioritized_next_actions"
    ]
    return all(k in data for k in required_keys)


def _build_deterministic_summary(
    student_name: str,
    project_title: str,
    health_status: str,
    health: Dict[str, Any],
    progress_pct: int,
    completed_tasks: list,
    pending_tasks: list,
    problems_reported: str,
    completed_milestones: list,
    pending_milestones: list,
    upcoming_deadlines: list,
    unresolved_risks_list: list,
    changes_since_previous: str,
    generation_time: str,
    underlying_data_time: str
) -> Dict[str, Any]:
    """
    Constructs an evidence-backed deterministic summary strictly from available records.
    """
    achievements = (
        [f"Completed: {t}" for t in completed_tasks[:4]]
        if completed_tasks
        else ["Project idea submitted and milestone plan structured."]
    )

    blockers = []
    if problems_reported and problems_reported != "None reported":
        blockers.append(f"Student reported blocker: {problems_reported}")
    for r in unresolved_risks_list[:2]:
        blockers.append(r)
    if not blockers:
        blockers = ["No critical blockers reported in latest check-in."]

    intervention_map = {
        "Completed": "Verify code repository, review technical documentation, and clear student for final viva evaluation.",
        "Healthy": "Commend steady milestone pace. Ensure proper unit testing and documentation are maintained.",
        "Needs Attention": "Request an informal 15-minute sync to review delayed sprint deliverables and unblock technical dependencies.",
        "At Risk": "Immediate intervention required: Schedule emergency project review to descope deliverables or resolve critical technical/data bottlenecks.",
        "Unknown": "Contact student to confirm project scope and prompt initial milestone plan generation."
    }
    recommended_intervention = intervention_map.get(
        health_status,
        "Review weekly progress update with student team."
    )

    next_actions = (
        [f"Complete pending task: {p}" for p in pending_tasks[:3]]
        if pending_tasks
        else ["Proceed to next scheduled milestone sprint in timeline."]
    )

    return {
        "current_status": (
            f"{student_name}'s project '{project_title}' is currently classified as {health_status} "
            f"({progress_pct}% overall completion, Health Score {health.get('health_score', 50)}/100). "
            f"{' '.join(health.get('reasons', [])[:2])}"
        ),
        "recent_achievements": achievements,
        "milestone_status": {
            "completed": completed_milestones if completed_milestones else ["Sprint Initiation"],
            "pending": pending_milestones if pending_milestones else ["All planned milestones completed"]
        },
        "upcoming_and_overdue_deadlines": upcoming_deadlines if upcoming_deadlines else ["Final Project Viva Presentation"],
        "current_blockers_and_risks": blockers,
        "important_changes": changes_since_previous,
        "recommended_faculty_intervention": recommended_intervention,
        "prioritized_next_actions": next_actions,
        "source": "deterministic_rule_engine",
        "generation_timestamp": generation_time,
        "data_timestamp": underlying_data_time,
        "health_status": health_status,
        "health_score": health.get("health_score", 50),
        "project_title": project_title,
        "student_name": student_name
    }
