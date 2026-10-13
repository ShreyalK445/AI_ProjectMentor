import unittest
import json
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app


class TestApiEndpoints(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.client = app.test_client()
        self.app.testing = True

    def test_home_and_health(self):
        """GET / and GET /api/health return status 200 with active milestone."""
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])

        res_h = self.client.get("/api/health")
        self.assertEqual(res_h.status_code, 200)
        data_h = res_h.get_json()
        self.assertTrue(data_h["success"])
        self.assertEqual(data_h["backend"], "running")

    def test_get_and_post_projects(self):
        """Tests project registration and listing."""
        new_project = {
            "title": "Autonomous Drone Fleet",
            "student_name": "Divya Nair",
            "department": "Robotics",
            "category": "Embedded Systems",
            "description": "Swarm robotics controller",
            "objective": "Coordinate drone trajectories"
        }
        res_post = self.client.post("/api/projects", json=new_project)
        self.assertEqual(res_post.status_code, 201)
        data_post = res_post.get_json()
        self.assertTrue(data_post["success"])
        self.assertEqual(data_post["project"]["title"], "Autonomous Drone Fleet")

        res_get = self.client.get("/api/projects")
        self.assertEqual(res_get.status_code, 200)
        data_get = res_get.get_json()
        self.assertTrue(data_get["success"])
        self.assertTrue(len(data_get["projects"]) > 0)

    def test_faculty_dashboard_overview(self):
        """GET /api/faculty/dashboard returns valid aggregate statistics."""
        res = self.client.get("/api/faculty/dashboard")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        overview = data["overview"]
        self.assertIn("total_projects", overview)
        self.assertIn("average_progress", overview)
        self.assertIn("health_distribution", overview)
        self.assertTrue(overview["total_projects"] > 0)

    def test_faculty_projects_search_and_filter(self):
        """GET /api/faculty/projects tests search query and health filters."""
        # Test basic list
        res = self.client.get("/api/faculty/projects")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertTrue(data["count"] > 0)

        # Test search query
        res_search = self.client.get("/api/faculty/projects?search=attendance")
        self.assertEqual(res_search.status_code, 200)
        data_search = res_search.get_json()
        self.assertTrue(data_search["success"])
        self.assertTrue(any("attendance" in p["title"].lower() for p in data_search["projects"]))

        # Test filter by health
        res_filter = self.client.get("/api/faculty/projects?health=Healthy")
        self.assertEqual(res_filter.status_code, 200)
        data_filter = res_filter.get_json()
        self.assertTrue(data_filter["success"])
        for p in data_filter["projects"]:
            self.assertEqual(p["health"]["health_status"], "Healthy")

    def test_faculty_project_detail_and_summary(self):
        """GET /api/faculty/projects/<id> and POST /api/faculty/summary."""
        from unittest.mock import patch
        res_detail = self.client.get("/api/faculty/projects/proj-1")
        self.assertEqual(res_detail.status_code, 200)
        data_detail = res_detail.get_json()
        self.assertTrue(data_detail["success"])
        self.assertEqual(data_detail["project"]["id"], "proj-1")
        self.assertIn("health", data_detail)

        # Summary route with mocked external AI to test deterministic summary
        with patch("services.faculty_summary_service.get_gemini_client", return_value=None):
            with patch("services.faculty_summary_service.get_openai_client", return_value=None):
                res_sum = self.client.post("/api/faculty/summary", json={"project_id": "proj-1"})
        self.assertEqual(res_sum.status_code, 200)
        data_sum = res_sum.get_json()
        self.assertTrue(data_sum["success"])
        self.assertIn("current_status", data_sum["summary"])
        self.assertIn("recommended_faculty_intervention", data_sum["summary"])

    def test_technology_recommendation_route(self):
        """POST /api/technology returns categorized stack."""
        payload = {
            "project_idea": "Deep learning convolutional neural network for tumor segmentation",
            "project_scope": "Medical prototype"
        }
        res = self.client.post("/api/technology", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertIn("TensorFlow", data["technology_recommendation"])

    def test_timeline_generation_and_fallback(self):
        """POST /api/milestone-timeline and GET /api/timeline."""
        from unittest.mock import patch
        payload = {"project_idea": "E-commerce book catalog", "duration_weeks": 8}
        with patch("services.timeline_agent.client.models.generate_content", side_effect=Exception("Offline")):
            res_post = self.client.post("/api/milestone-timeline", json=payload)
        self.assertEqual(res_post.status_code, 200)
        data_post = res_post.get_json()
        self.assertTrue(data_post["success"])
        self.assertTrue(len(data_post["timeline"]["weekly_plan"]) > 0)

        res_get = self.client.get("/api/timeline")
        self.assertEqual(res_get.status_code, 200)
        data_get = res_get.get_json()
        self.assertTrue(data_get["success"])

    def test_progress_tracking_route(self):
        """POST /api/progress calculates completion and updates status."""
        payload = {
            "week": "Week 2",
            "current_task": "Backend routes",
            "completed_tasks": "Setup Flask, Create database connection",
            "pending_tasks": "Implement auth JWT",
            "problems": "Token expiration config"
        }
        res = self.client.post("/api/progress", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["progress"]["progress_percentage"], 67)
        self.assertEqual(data["progress"]["status"], "In Progress")

    def test_risk_assessment_route(self):
        """POST /api/risk-assessment evaluates multi-factor project risks."""
        payload = {
            "project_idea": "Real-time stock prediction app",
            "technology_stack": {"ai": "LSTM"}
        }
        res = self.client.post("/api/risk-assessment", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertIn("risks", data["risk_assessment"])

    def test_invalid_requests_error_handling(self):
        """Verifies 400 bad request handling on missing payloads."""
        res_tech = self.client.post("/api/technology", json={})
        self.assertEqual(res_tech.status_code, 400)

        res_prog = self.client.post("/api/progress", json={})
        self.assertEqual(res_prog.status_code, 400)

        res_proj_missing = self.client.get("/api/faculty/projects/non-existent-id")
        self.assertEqual(res_proj_missing.status_code, 404)


if __name__ == "__main__":
    unittest.main()
