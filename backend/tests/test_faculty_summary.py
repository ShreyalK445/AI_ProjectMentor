import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.faculty_summary_service import (
    generate_faculty_mentor_summary,
    _validate_summary_schema,
    _build_deterministic_summary
)


class TestFacultySummaryService(unittest.TestCase):
    def setUp(self):
        self.mock_project = {
            "id": "proj-test",
            "title": "Smart Campus Assistant",
            "student_name": "Aarav Sharma",
            "department": "Computer Science",
            "faculty_mentor": "Dr. Aris Thorne",
            "updated_at": "2026-10-13T10:00:00Z"
        }
        self.mock_health = {
            "health_status": "Needs Attention",
            "health_score": 62,
            "reasons": ["1 delayed task", "trailing schedule"],
            "recommended_action": "Sync with student on blockers."
        }
        self.mock_progress = [
            {
                "week": "Week 3",
                "completed_tasks": ["Database setup", "Auth API"],
                "pending_tasks": ["Socket integration"],
                "progress_percentage": 50,
                "problems": "Socket.IO connection drops"
            }
        ]
        self.mock_timeline = {
            "weekly_plan": [
                {"week": 1, "milestone": "Requirements", "tasks": ["Database setup"]},
                {"week": 2, "milestone": "Authentication", "tasks": ["Auth API"]},
                {"week": 3, "milestone": "Realtime Sockets", "tasks": ["Socket integration"]}
            ]
        }

    def test_summary_schema_validation(self):
        """Ensures schema validator enforces all 8 required analytical keys."""
        valid_summary = {
            "current_status": "On track",
            "recent_achievements": ["Built API"],
            "milestone_status": {"completed": ["W1"], "pending": ["W2"]},
            "upcoming_and_overdue_deadlines": ["W2 Deadline"],
            "current_blockers_and_risks": ["None"],
            "important_changes": "Progress up",
            "recommended_faculty_intervention": "Check in",
            "prioritized_next_actions": ["Test"]
        }
        self.assertTrue(_validate_summary_schema(valid_summary))

        invalid_summary = {"current_status": "Missing keys"}
        self.assertFalse(_validate_summary_schema(invalid_summary))

    def test_deterministic_summary_generation(self):
        """Validates that deterministic fallback constructs all 9 required points."""
        from unittest.mock import patch
        with patch("services.faculty_summary_service.get_gemini_client", return_value=None):
            with patch("services.faculty_summary_service.get_openai_client", return_value=None):
                res = generate_faculty_mentor_summary(
                    project=self.mock_project,
                    health=self.mock_health,
                    progress_history=self.mock_progress,
                    timeline=self.mock_timeline,
                    risks={"risks": []}
                )
        self.assertTrue(res["success"])
        summary = res["summary"]

        self.assertIn("current_status", summary)
        self.assertIn("recent_achievements", summary)
        self.assertIn("milestone_status", summary)
        self.assertIn("upcoming_and_overdue_deadlines", summary)
        self.assertIn("current_blockers_and_risks", summary)
        self.assertIn("important_changes", summary)
        self.assertIn("recommended_faculty_intervention", summary)
        self.assertIn("prioritized_next_actions", summary)
        self.assertIn("generation_timestamp", summary)
        self.assertIn("data_timestamp", summary)

        # Check content accuracy
        self.assertIn("Aarav Sharma", summary["current_status"])
        self.assertIn("Needs Attention", summary["current_status"])
        self.assertTrue(len(summary["recent_achievements"]) > 0)
        self.assertTrue(len(summary["prioritized_next_actions"]) > 0)


if __name__ == "__main__":
    unittest.main()
