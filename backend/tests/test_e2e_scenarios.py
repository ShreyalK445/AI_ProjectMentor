import unittest
import json
import sys
import os
from unittest.mock import patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import app as flask_app_module
from app import app, IN_MEMORY_PROJECTS
from services.health_service import calculate_project_health
from services.faculty_summary_service import generate_faculty_mentor_summary
from services.timeline_agent import generate_timeline
from services.mentor_service import chat_with_mentor


class TestEndToEndScenarios(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.client = app.test_client()
        self.app.testing = True

    def test_scenario_1_normal_project_lifecycle(self):
        """Scenario 1: Normal project creation -> plan -> progress -> reflected in faculty dashboard."""
        # 1. Create project
        proj_payload = {
            "id": "proj-e2e-1",
            "title": "E2E Automated Solar Tracker",
            "student_name": "Kiran Kumar",
            "department": "Electrical Engineering",
            "category": "IoT / Embedded",
            "description": "Dual-axis solar tracking microcontroller."
        }
        res_create = self.client.post("/api/projects", json=proj_payload)
        self.assertEqual(res_create.status_code, 201)

        # 2. Generate timeline
        with patch("services.timeline_agent.client.models.generate_content", side_effect=Exception("Offline")):
            res_plan = self.client.post("/api/milestone-timeline", json={
                "project_idea": "Dual-axis solar tracking microcontroller",
                "title": "E2E Automated Solar Tracker"
            })
        self.assertEqual(res_plan.status_code, 200)

        # 3. Submit progress
        res_prog = self.client.post("/api/progress", json={
            "project_id": "proj-e2e-1",
            "title": "E2E Automated Solar Tracker",
            "week": "Week 2",
            "current_task": "Sensor calibration",
            "completed_tasks": "Microcontroller wiring, LDR sensors test",
            "pending_tasks": "Motor driver servo code",
            "problems": "None reported"
        })
        self.assertEqual(res_prog.status_code, 200)

        # 4. Verify Faculty Dashboard reflects new project
        res_dash = self.client.get("/api/faculty/projects?search=Solar")
        self.assertEqual(res_dash.status_code, 200)
        data = res_dash.get_json()
        self.assertTrue(any(p["id"] == "proj-e2e-1" for p in data["projects"]))
        matched = next(p for p in data["projects"] if p["id"] == "proj-e2e-1")
        self.assertGreater(matched["progress_percentage"], 0)
        self.assertIn(matched["health"]["health_status"], ["Healthy", "Needs Attention"])

    def test_scenario_2_delayed_milestone(self):
        """Scenario 2: Record an overdue task and verify dashboard detects delay and provides explanation."""
        proj = {
            "id": "proj-e2e-2",
            "title": "Delayed NLP Summarizer",
            "student_name": "Meera Sen",
            "status": "in_progress",
            "timeline": {"weekly_plan": [{"week": 1, "tasks": ["Task 1"]}, {"week": 2, "tasks": ["Task 2"]}]},
            "progress_history": [{
                "week": "Week 1",
                "completed_tasks": [],
                "pending_tasks": ["Prerequisite dataset annotation"],
                "progress_percentage": 20,
                "problems": "Severe annotation delay, stuck for 10 days"
            }]
        }
        # Evaluate health at week 3 (Week 1 task is overdue)
        health = calculate_project_health(proj, proj["timeline"], proj["progress_history"], {}, current_week=3)
        self.assertIn(health["health_status"], ["Needs Attention", "At Risk"])
        self.assertGreaterEqual(health["overdue_count"], 1)
        self.assertTrue(any("overdue" in r.lower() or "delay" in r.lower() for r in health["reasons"]))

    def test_scenario_3_high_risk_project(self):
        """Scenario 3: Unresolved critical blocker forces project into At Risk status."""
        proj = {
            "id": "proj-e2e-3",
            "title": "Autonomous Rover Nav",
            "student_name": "Tanmay Bhat",
            "progress_history": [{
                "week": "Week 6",
                "completed_tasks": ["All base wheels", "Chassis", "Cameras", "Sensors"],
                "pending_tasks": ["SLAM pipeline"],
                "progress_percentage": 80,
                "problems": "CRITICAL: LiDAR sensor module fried due to voltage spike"
            }]
        }
        risks = {
            "overall_risk": "CRITICAL",
            "risks": [{"severity": "CRITICAL", "risk": "Hardware hardware failure", "mitigation": "Order replacement board"}]
        }
        health = calculate_project_health(proj, {"weekly_plan": [{"week": 1, "tasks": []}]}, proj["progress_history"], risks)
        self.assertEqual(health["health_status"], "At Risk")
        self.assertLessEqual(health["health_score"], 40)
        self.assertTrue(any("CRITICAL OVERRIDE" in r for r in health["reasons"]))

    def test_scenario_4_dynamic_plan_adjustment(self):
        """Scenario 4: Delays in progress trigger plan adjustment without losing historical progress."""
        payload = {
            "week": "Week 2",
            "current_task": "Backend routes",
            "completed_tasks": "Setup database",
            "pending_tasks": "API Authentication",
            "problems": "Delayed due to semester exams",
            "current_timeline": flask_app_module.DEFAULT_ACADEMIC_TIMELINE
        }
        res = self.client.post("/api/progress", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["plan_adjusted"])
        self.assertIsNotNone(data["adjusted_plan"])

    def test_scenario_5_ai_failure_graceful_fallback(self):
        """Scenario 5: When Gemini/OpenAI fails or times out, deterministic fallbacks return valid schemas."""
        # 1. Timeline fallback
        with patch("services.timeline_agent.client.models.generate_content", side_effect=Exception("API Quota Exceeded")):
            res = self.client.post("/api/milestone-timeline", json={"project_idea": "AI Chatbot"})
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            self.assertTrue(data["success"])
            self.assertEqual(len(data["timeline"]["weekly_plan"]), 8)

        # 2. Faculty summary fallback
        with patch("services.faculty_summary_service.get_gemini_client", return_value=None):
            with patch("services.faculty_summary_service.get_openai_client", return_value=None):
                res_sum = self.client.post("/api/faculty/summary", json={"project_id": "proj-1"})
                self.assertEqual(res_sum.status_code, 200)
                data_sum = res_sum.get_json()
                self.assertTrue(data_sum["success"])
                self.assertEqual(data_sum["summary"]["source"], "deterministic_rule_engine")

    def test_scenario_6_database_offline_in_memory_resilience(self):
        """Scenario 6: Verify in-memory cache operations continue when MongoDB is offline."""
        with patch("app.projects_collection", None):
            res = self.client.get("/api/faculty/dashboard")
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            self.assertTrue(data["success"])
            self.assertGreater(data["overview"]["total_projects"], 0)

    def test_scenario_7_empty_state_resilience(self):
        """Scenario 7: Verify calculations handle empty project state without crash or zero-division."""
        res = calculate_project_health({}, {}, [], {})
        self.assertEqual(res["health_status"], "Unknown")
        self.assertEqual(res["health_score"], 0)
        self.assertFalse(res["reasons"] == [])

    def test_scenario_8_validation_and_access_integrity(self):
        """Scenario 8: Invalid payloads and non-existent IDs return structured 400/404 errors."""
        res_bad_proj = self.client.post("/api/projects", json={})
        self.assertEqual(res_bad_proj.status_code, 400)
        self.assertIn("error", res_bad_proj.get_json())

        res_bad_id = self.client.get("/api/faculty/projects/invalid-id-9999")
        self.assertEqual(res_bad_id.status_code, 404)
        self.assertFalse(res_bad_id.get_json()["success"])


if __name__ == "__main__":
    unittest.main()
