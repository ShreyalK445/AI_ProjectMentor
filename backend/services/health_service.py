"""
Project Health Calculation Service (Milestone 4)
Provides deterministic, explainable, multi-factor health scoring and classification
for academic student projects monitored by faculty mentors.
"""

from datetime import datetime, timezone
from typing import Dict, Any, List, Optional


def calculate_project_health(
    project_data: Dict[str, Any],
    timeline_data: Optional[Dict[str, Any]] = None,
    progress_records: Optional[List[Dict[str, Any]]] = None,
    risk_data: Optional[Dict[str, Any]] = None,
    current_week: int = 4
) -> Dict[str, Any]:
    """
    Evaluates project health using a multi-factor scoring algorithm.
    
    Precedence Rules:
    1. Insufficient Data: If no timeline or progress is recorded -> 'Unknown'.
    2. Completed: If all planned milestones/tasks are done with no critical blockers -> 'Completed'.
    3. Critical Risk Override: Unresolved critical risks or severe blockers force 'At Risk'
       status, regardless of high progress percentage.
    4. Delays & Overdue Milestones: >=2 overdue/delayed milestones force 'At Risk';
       1 overdue milestone caps health at 'Needs Attention'.
    5. Inactivity Decay: Updates older than 14 days degrade score by 25 points.
    6. Score Brackets:
       - Score >= 75 with no high/critical risks -> 'Healthy'
       - Score 45..74 -> 'Needs Attention'
       - Score < 45 -> 'At Risk'
    """
    timeline_data = timeline_data or {}
    progress_records = progress_records or []
    risk_data = risk_data or {}

    reasons: List[str] = []
    
    # ----------------------------------------------------
    # Factor 1: Task and Milestone Progress
    # ----------------------------------------------------
    weekly_plan = timeline_data.get("weekly_plan", [])
    total_milestones = len(weekly_plan)
    
    # Flatten planned tasks from timeline
    all_planned_tasks = []
    for week_entry in weekly_plan:
        w_num = week_entry.get("week", 1)
        for t in week_entry.get("tasks", []):
            all_planned_tasks.append({"week": w_num, "task": t})

    total_tasks_count = len(all_planned_tasks)
    
    # Extract latest progress record
    latest_progress = progress_records[-1] if progress_records else {}
    progress_percentage = latest_progress.get("progress_percentage")
    
    # If percentage not set directly, infer from completed vs total tasks
    completed_tasks = latest_progress.get("completed_tasks", [])
    pending_tasks = latest_progress.get("pending_tasks", [])
    problems_reported = str(latest_progress.get("problems", "")).strip()

    if progress_percentage is None:
        if total_tasks_count > 0 and (completed_tasks or pending_tasks):
            progress_percentage = round((len(completed_tasks) / max(total_tasks_count, len(completed_tasks) + len(pending_tasks))) * 100)
        else:
            progress_percentage = 0

    # Rule 1: Insufficient Data Check
    if not weekly_plan and not progress_records and not project_data.get("status"):
        return {
            "health_status": "Unknown",
            "health_score": 0,
            "status_label": "Unknown",
            "progress_percentage": 0,
            "overdue_count": 0,
            "critical_risks_count": 0,
            "days_since_update": None,
            "score_breakdown": {
                "base_progress": 0,
                "schedule_alignment": 0,
                "risk_penalty": 0,
                "delay_penalty": 0,
                "staleness_penalty": 0,
            },
            "reasons": ["No timeline or progress updates recorded yet. Baseline data required for assessment."],
            "recommended_action": "Student must complete onboarding and generate a milestone roadmap."
        }

    # ----------------------------------------------------
    # Factor 2: Overdue / Delayed Tasks Evaluation
    # ----------------------------------------------------
    delayed_count = 0
    overdue_milestones = []
    
    # Check explicitly marked delayed tasks
    for pr in progress_records:
        for p in pr.get("pending_tasks", []):
            # If pending task belongs to a week before current week, it's overdue
            task_week = pr.get("week")
            w_int = None
            if isinstance(task_week, int):
                w_int = task_week
            elif isinstance(task_week, str):
                import re
                match = re.search(r"\d+", task_week)
                if match:
                    w_int = int(match.group())
            
            if w_int and w_int < current_week:
                delayed_count += 1
                if task_week not in overdue_milestones:
                    overdue_milestones.append(task_week)

    # Also detect delays flagged in problems string
    has_delay_in_problems = any(
        kw in problems_reported.lower()
        for kw in ["delay", "behind", "stuck", "blocker", "cannot", "failed", "error"]
    )
    if has_delay_in_problems and delayed_count == 0:
        delayed_count += 1

    # ----------------------------------------------------
    # Factor 3: Risk Evaluation
    # ----------------------------------------------------
    critical_risks = 0
    high_risks = 0
    medium_risks = 0

    risks_list = risk_data.get("risks", [])
    if isinstance(risks_list, list):
        for r in risks_list:
            if not isinstance(r, dict):
                continue
            severity = str(r.get("severity", "")).upper()
            prob = str(r.get("probability", "")).upper()
            if severity == "CRITICAL" or (severity == "HIGH" and prob == "HIGH"):
                critical_risks += 1
            elif severity == "HIGH":
                high_risks += 1
            elif severity == "MEDIUM":
                medium_risks += 1

    # Also check if overall_risk in risk_data is HIGH or CRITICAL
    overall_risk_level = str(risk_data.get("overall_risk", "")).upper()
    if overall_risk_level in ["CRITICAL", "HIGH"] and critical_risks == 0 and high_risks == 0:
        high_risks = 1

    # ----------------------------------------------------
    # Factor 4: Freshness / Staleness Evaluation
    # ----------------------------------------------------
    days_since_update = 0
    timestamp_str = latest_progress.get("timestamp") or project_data.get("updated_at")
    if timestamp_str:
        try:
            # Handle ISO string
            clean_ts = timestamp_str.replace("Z", "+00:00")
            update_time = datetime.fromisoformat(clean_ts)
            if update_time.tzinfo is None:
                now = datetime.now()
            else:
                now = datetime.now(timezone.utc)
            delta = now - update_time
            days_since_update = max(0, delta.days)
        except Exception:
            days_since_update = 2
    else:
        # Default assumption if project exists but no timestamp
        days_since_update = 3

    # ----------------------------------------------------
    # Scoring Algorithm Calculation (0 - 100)
    # ----------------------------------------------------
    # 1. Base Progress (0..40 points)
    base_progress_points = round((progress_percentage / 100.0) * 40.0)

    # 2. Schedule Alignment (0..35 points)
    # Expected progress at current_week (assuming 8-week project)
    expected_percentage = min(100, round((current_week / max(8, total_milestones or 8)) * 100))
    schedule_diff = progress_percentage - expected_percentage
    if schedule_diff >= 0:
        schedule_points = 35
        reasons.append(f"Progress ({progress_percentage}%) is ahead of or on pace with schedule target ({expected_percentage}%).")
    elif schedule_diff >= -15:
        schedule_points = 25
        reasons.append(f"Progress ({progress_percentage}%) is slightly trailing the expected pace ({expected_percentage}%).")
    elif schedule_diff >= -30:
        schedule_points = 15
        reasons.append(f"Progress ({progress_percentage}%) is significantly behind expected pace ({expected_percentage}%).")
    else:
        schedule_points = 5
        reasons.append(f"Critical schedule lag: progress ({progress_percentage}%) is over 30% behind target ({expected_percentage}%).")

    # 3. Penalties
    risk_penalty = (critical_risks * 35) + (high_risks * 18) + (medium_risks * 5)
    delay_penalty = min(30, delayed_count * 15)
    
    staleness_penalty = 0
    if days_since_update > 14:
        staleness_penalty = 25
        reasons.append(f"Stale project: No progress logged in {days_since_update} days.")
    elif days_since_update > 7:
        staleness_penalty = 10
        reasons.append(f"Moderate inactivity: Last update was {days_since_update} days ago.")

    raw_score = (base_progress_points + schedule_points + 25) - (risk_penalty + delay_penalty + staleness_penalty)
    final_score = max(0, min(100, raw_score))

    # ----------------------------------------------------
    # Precedence Rules Evaluation
    # ----------------------------------------------------
    # Rule 2: Completed Check
    if progress_percentage >= 100 and critical_risks == 0 and delayed_count == 0:
        health_status = "Completed"
        reasons.insert(0, "All planned deliverables and milestones have been completed successfully.")
        recommended_action = "Review final deliverables, project documentation, and conduct viva presentation."

    # Rule 3: Critical Risk Override
    elif critical_risks > 0 or ("critical" in problems_reported.lower() and progress_percentage < 100):
        health_status = "At Risk"
        reasons.insert(0, f"CRITICAL OVERRIDE: {critical_risks} unresolved critical risk(s) or blocker detected. Immediate mentor intervention required.")
        final_score = min(final_score, 40)
        recommended_action = "Schedule an urgent faculty review session to unblock critical technical/data dependencies."

    # Rule 4: Severe Delays
    elif delayed_count >= 2:
        health_status = "At Risk"
        reasons.insert(0, f"Multiple delayed milestones ({delayed_count} overdue tasks). Project pace is at high risk of deadline failure.")
        final_score = min(final_score, 44)
        recommended_action = "Trigger dynamic plan adjustment and descope non-essential features."

    # Rule 5: Moderate Delay or Moderate Lag
    elif delayed_count == 1 or schedule_diff < -20 or high_risks > 0 or final_score < 70:
        if final_score < 45:
            health_status = "At Risk"
            reasons.insert(0, "Combined low score and lagging progress indicates severe risk of delay.")
            recommended_action = "Re-evaluate weekly milestone deliverables with the student."
        else:
            health_status = "Needs Attention"
            if delayed_count == 1:
                reasons.insert(0, "1 overdue task or reported blocker requires prompt student resolution.")
            if high_risks > 0:
                reasons.append(f"{high_risks} high severity risk factor(s) flagged.")
            recommended_action = "Guide student through technical blockers and ensure pending sprint tasks are updated."

    # Healthy
    else:
        health_status = "Healthy"
        reasons.insert(0, f"Project is progressing smoothly with an active health score of {final_score}/100.")
        recommended_action = "Maintain regular weekly check-ins and proceed to the next scheduled sprint milestone."

    return {
        "health_status": health_status,
        "health_score": final_score,
        "status_label": health_status,
        "progress_percentage": progress_percentage,
        "overdue_count": delayed_count,
        "critical_risks_count": critical_risks,
        "days_since_update": days_since_update,
        "score_breakdown": {
            "base_progress": base_progress_points,
            "schedule_alignment": schedule_points,
            "risk_penalty": risk_penalty,
            "delay_penalty": delay_penalty,
            "staleness_penalty": staleness_penalty,
        },
        "reasons": reasons,
        "recommended_action": recommended_action
    }
