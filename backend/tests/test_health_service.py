import unittest
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.health_service import calculate_project_health


class TestHealthService(unittest.TestCase):
    def setUp(self):
        self.mock_timeline = {
            "project_title": "Automated Vision System",
            "total_duration_weeks": 8,
            "weekly_plan": [
                {"week": 1, "milestone": "Scope & Specs", "tasks": ["Task 1A", "Task 1B"]},
                {"week": 2, "milestone": "Architecture", "tasks": ["Task 2A"]},
                {"week": 3, "milestone": "Backend APIs", "tasks": ["Task 3A", "Task 3B"]},
                {"week": 4, "milestone": "Frontend UI", "tasks": ["Task 4A"]},
                {"week": 5, "milestone": "AI Model Training", "tasks": ["Task 5A"]},
                {"week": 6, "milestone": "Integration", "tasks": ["Task 6A"]},
                {"week": 7, "milestone": "Testing & Docs", "tasks": ["Task 7A"]},
                {"week": 8, "milestone": "Final Viva", "tasks": ["Task 8A"]}
            ]
        }

    def test_insufficient_data_returns_unknown(self):
        """Rule 1: Empty project data and no timeline returns Unknown."""
        res = calculate_project_health({}, None, None, None)
        self.assertEqual(res["health_status"], "Unknown")
        self.assertEqual(res["health_score"], 0)
        self.assertIn("No timeline or progress updates recorded yet", res["reasons"][0])

    def test_completed_project_status(self):
        """Rule 2: 100% progress without blockers returns Completed."""
        progress = [{
            "week": "Week 8",
            "completed_tasks": ["All done"],
            "pending_tasks": [],
            "progress_percentage": 100,
            "problems": ""
        }]
        res = calculate_project_health({"title": "Test"}, self.mock_timeline, progress, {})
        self.assertEqual(res["health_status"], "Completed")
        self.assertIn("All planned deliverables", res["reasons"][0])

    def test_critical_risk_overrides_high_progress(self):
        """Rule 3: Critical blocker forces At Risk even if progress is 85%."""
        progress = [{
            "week": "Week 7",
            "completed_tasks": ["Task 1", "Task 2", "Task 3", "Task 4"],
            "pending_tasks": ["Final viva"],
            "progress_percentage": 85,
            "problems": "Critical database corruption"
        }]
        risks = {
            "overall_risk": "CRITICAL",
            "risks": [{
                "severity": "CRITICAL",
                "risk": "Database corrupt",
                "mitigation": "Restore backup"
            }]
        }
        res = calculate_project_health({"title": "Test"}, self.mock_timeline, progress, risks)
        self.assertEqual(res["health_status"], "At Risk")
        self.assertLessEqual(res["health_score"], 40)
        self.assertTrue(any("CRITICAL OVERRIDE" in r for r in res["reasons"]))

    def test_multiple_overdue_milestones_triggers_at_risk(self):
        """Rule 4: >= 2 overdue tasks triggers At Risk."""
        progress = [
            {"week": "Week 1", "pending_tasks": ["Overdue 1"]},
            {"week": "Week 2", "pending_tasks": ["Overdue 2"]}
        ]
        res = calculate_project_health({"title": "Test"}, self.mock_timeline, progress, {}, current_week=4)
        self.assertEqual(res["health_status"], "At Risk")
        self.assertGreaterEqual(res["overdue_count"], 2)

    def test_single_overdue_milestone_triggers_needs_attention(self):
        """Rule 5: 1 overdue task caps health at Needs Attention."""
        progress = [
            {
                "week": "Week 2",
                "completed_tasks": ["Task 1", "Task 2"],
                "pending_tasks": ["Overdue task"],
                "progress_percentage": 50,
                "problems": "1 task delayed"
            }
        ]
        res = calculate_project_health({"title": "Test"}, self.mock_timeline, progress, {}, current_week=3)
        self.assertEqual(res["health_status"], "Needs Attention")
        self.assertGreaterEqual(res["overdue_count"], 1)

    def test_healthy_progress_classification(self):
        """Rule 6: Steady progress matching schedule pace is Healthy."""
        progress = [{
            "week": "Week 4",
            "completed_tasks": ["T1", "T2", "T3", "T4"],
            "pending_tasks": ["T5"],
            "progress_percentage": 75,
            "problems": ""
        }]
        res = calculate_project_health({"title": "Test"}, self.mock_timeline, progress, {}, current_week=4)
        self.assertEqual(res["health_status"], "Healthy")
        self.assertGreaterEqual(res["health_score"], 70)


if __name__ == "__main__":
    unittest.main()
