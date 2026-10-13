import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.plan_adjustment import analyze_progress, adjust_timeline, find_affected_tasks


class TestProgressCalculations(unittest.TestCase):
    def setUp(self):
        self.mock_plan = {
            "project_title": "AI Analytics Portal",
            "total_duration_weeks": 4,
            "weekly_plan": [
                {
                    "week": 1,
                    "milestone": "Data Acquisition",
                    "tasks": ["Collect dataset", "Clean data"],
                    "dependencies": []
                },
                {
                    "week": 2,
                    "milestone": "Feature Engineering",
                    "tasks": ["Feature selection"],
                    "dependencies": ["Collect dataset", "Clean data"]
                },
                {
                    "week": 3,
                    "milestone": "Model Training",
                    "tasks": ["Train Random Forest"],
                    "dependencies": ["Feature selection"]
                },
                {
                    "week": 4,
                    "milestone": "Evaluation & Viva",
                    "tasks": ["Final evaluation"],
                    "dependencies": ["Train Random Forest"]
                }
            ]
        }

    def test_analyze_progress_identifies_delays(self):
        """Checks categorization of completed, pending, and delayed tasks."""
        progress_data = [
            {"task": "Collect dataset", "status": "completed"},
            {"task": "Clean data", "status": "delayed", "week": 1}
        ]
        res = analyze_progress(self.mock_plan, progress_data)
        self.assertTrue(res["adjustment_required"])
        self.assertEqual(len(res["completed_tasks"]), 1)
        self.assertEqual(len(res["delayed_tasks"]), 1)

    def test_find_affected_tasks_cascading(self):
        """Ensures downstream dependent tasks are identified when a prerequisite is delayed."""
        delayed = [{"task": "Clean data", "week": 1}]
        affected = find_affected_tasks(self.mock_plan, delayed)
        self.assertTrue(len(affected) >= 1)
        self.assertEqual(affected[0]["week"], 2)
        self.assertEqual(affected[0]["task"], "Feature selection")

    def test_adjust_timeline_reallocates_schedule(self):
        """Verifies that adjust_timeline reschedules without dropping unfinished items."""
        progress_data = [
            {"task": "Collect dataset", "status": "completed"},
            {"task": "Clean data", "status": "delayed", "week": 1}
        ]
        adj = adjust_timeline(self.mock_plan, progress_data)
        self.assertTrue(adj["adjustment_required"])
        self.assertIn("updated_plan", adj)
        updated_weeks = adj["updated_plan"]["weekly_plan"]
        self.assertEqual(len(updated_weeks), len(self.mock_plan["weekly_plan"]))

    def test_no_adjustment_when_on_track(self):
        """Ensures plan stays unaltered when all tasks are completed or on-track."""
        progress_data = [
            {"task": "Collect dataset", "status": "completed"},
            {"task": "Clean data", "status": "completed"}
        ]
        adj = adjust_timeline(self.mock_plan, progress_data)
        self.assertFalse(adj["adjustment_required"])


if __name__ == "__main__":
    unittest.main()
