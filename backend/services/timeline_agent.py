import os
import json

from dotenv import load_dotenv
from google import genai


# Load environment variables from .env
load_dotenv()


# Get Gemini API key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError(
        "GEMINI_API_KEY is not set in the .env file."
    )


# Create Gemini client
client = genai.Client(api_key=api_key)


def generate_timeline(project_data):
    """
    Generate an AI-based milestone and project timeline
    using Gemini.
    """

    # Extract project information
    project_idea = project_data.get(
        "project_idea",
        "Not provided"
    )

    feasibility = project_data.get(
        "feasibility",
        {}
    )

    scope = project_data.get(
        "scope",
        {}
    )

    technology_stack = project_data.get(
        "technology_stack",
        {}
    )

    duration_weeks = project_data.get(
        "duration_weeks",
        8
    )

    # Create prompt for Gemini
    prompt = f"""
You are an AI Academic Project Planning and Timeline Mentor.

Your task is to create a realistic milestone-based development
timeline for a student's academic software project.

PROJECT INFORMATION

Project Idea:
{project_idea}

Feasibility Assessment:
{json.dumps(feasibility, indent=2)}

Project Scope:
{json.dumps(scope, indent=2)}

Technology Stack:
{json.dumps(technology_stack, indent=2)}

Available Duration:
{duration_weeks} weeks


TASK

Based on the information above, create a structured project
development timeline.

The timeline should:

1. Divide the project into logical weekly milestones.
2. Consider the project scope and feasibility.
3. Consider the given technology stack.
4. Assign realistic tasks to every week.
5. Provide expected deliverables for every week.
6. Mention dependencies between milestones where applicable.
7. Make sure the complete project can be completed within
   the specified number of weeks.
8. Maintain a logical development sequence from requirements
   to design, development, integration, testing and completion.


OUTPUT FORMAT

Return ONLY valid JSON.

Do not add explanations before or after the JSON.

Use exactly this structure:

{{
    "project_title": "Project title",
    "total_duration_weeks": {duration_weeks},
    "weekly_plan": [
        {{
            "week": 1,
            "milestone": "Milestone name",
            "tasks": [
                "Task 1",
                "Task 2",
                "Task 3"
            ],
            "deliverables": [
                "Deliverable 1",
                "Deliverable 2"
            ],
            "dependencies": []
        }}
    ]
}}

Make sure every week from Week 1 to Week {duration_weeks}
is included.
"""


    try:
        # Call Gemini API
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt
        )

        # Get Gemini response
        result = response.text.strip()

        # Remove Markdown JSON code fences if Gemini adds them
        if result.startswith("```json"):
            result = result[7:]

        elif result.startswith("```"):
            result = result[3:]

        if result.endswith("```"):
            result = result[:-3]

        # Convert AI response into Python JSON
        try:
            parsed = json.loads(result)
            if isinstance(parsed, dict) and "weekly_plan" in parsed and isinstance(parsed["weekly_plan"], list):
                return parsed
        except json.JSONDecodeError:
            pass

    except Exception as e:
        print("Gemini timeline generation failed, engaging fallback:", e)

    return generate_fallback_timeline(project_idea, duration_weeks)


def generate_fallback_timeline(project_idea, duration_weeks=8):
    """Deterministic, structured academic timeline fallback."""
    title = project_idea.split(".")[0].strip()[:60] if project_idea else "Academic Software Project"
    weeks = []
    milestone_templates = [
        ("Requirement Analysis & Scope Definition", ["Understand problem statement", "Identify target users", "Finalize functional requirements"], ["Requirement specification document"]),
        ("System Architecture & Database Design", ["Design system architecture", "Design database schema", "Design UI wireframes"], ["Architecture diagram and schema design"]),
        ("Backend API Development", ["Develop REST APIs", "Implement data validation", "Set up database connections"], ["Working backend service"]),
        ("Frontend UI Implementation", ["Build user interface components", "Implement responsive layout", "Connect UI to backend APIs"], ["Interactive frontend interface"]),
        ("Core AI / Logic Integration", ["Integrate core AI/ML algorithms", "Process data pipeline", "Connect AI agents with APIs"], ["Integrated full-stack system"]),
        ("Testing & Risk Mitigation", ["Unit and API testing", "Integration testing", "Fix bugs and resolve blockers"], ["Tested prototype with bug fixes"]),
        ("Review & Dynamic Plan Adjustment", ["Faculty review checkpoint", "Refine project UI and performance", "Finalize report documentation"], ["Project synopsis and methodology report"]),
        ("Final Demonstration & Submission", ["Complete project report", "Prepare presentation slides", "Final project viva demonstration"], ["Final project deliverable and presentation"])
    ]

    for i in range(1, duration_weeks + 1):
        idx = min(i - 1, len(milestone_templates) - 1)
        name, tasks, deliverables = milestone_templates[idx]
        weeks.append({
            "week": i,
            "milestone": f"{name}",
            "tasks": tasks,
            "deliverables": deliverables,
            "dependencies": [f"Week {i-1}"] if i > 1 else []
        })

    return {
        "project_title": title,
        "total_duration_weeks": duration_weeks,
        "weekly_plan": weeks
    }


# ---------------------------------------------------------
# TESTING
# ---------------------------------------------------------

if __name__ == "__main__":

    sample_project = {

        "project_idea":
            "AI based student attendance system",

        "feasibility": {
            "status": "Feasible",
            "reasoning":
                "The project can be developed within "
                "an academic project timeline."
        },

        "scope": {

            "objective":
                "Develop an AI-based attendance system.",

            "in_scope": [
                "Student registration",
                "Face-based attendance",
                "Attendance records",
                "Attendance dashboard"
            ],

            "out_of_scope": [
                "Biometric hardware integration"
            ]
        },

        "technology_stack": {

            "frontend": "ReactJS",
            "backend": "Python Flask",
            "database": "MongoDB",
            "ai": "Python computer vision"
        },

        "duration_weeks": 8
    }


    print("\n==========================================")
    print("MILESTONE & TIMELINE AGENT TEST")
    print("==========================================\n")

    timeline = generate_timeline(sample_project)

    print(
        json.dumps(
            timeline,
            indent=4
        )
    )

    print("\n==========================================")
    print("TEST COMPLETED")
    print("==========================================")
