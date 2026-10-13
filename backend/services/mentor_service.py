import os
import json
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
        print("Gemini client error for Mentor Service:", e)
        return None

def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or "your_" in api_key:
        return None
    try:
        from openai import OpenAI
        return OpenAI(api_key=api_key)
    except Exception as e:
        print("OpenAI client error for Mentor Service:", e)
        return None

def chat_with_mentor(message, chat_history=None, project_data=None, progress_data=None):
    """
    Conversational Mentor Interaction Service (Milestone 3)
    Provides conversational AI guidance for ongoing weekly student check-ins,
    progress reviews, debugging advice, and milestone pacing.
    """
    if not message or not message.strip():
        return {
            "success": False,
            "error": "Message is required"
        }

    chat_history = chat_history or []
    project_data = project_data or {}
    progress_data = progress_data or {}

    project_title = project_data.get("title", "Academic Software Project")
    project_desc = project_data.get("description", "A student capstone/engineering project")
    project_category = project_data.get("category", "General Software")
    skills = project_data.get("skills", [])
    if isinstance(skills, list):
        skills_str = ", ".join(skills)
    else:
        skills_str = str(skills)

    current_week = progress_data.get("week", "Current Sprint")
    current_status = progress_data.get("status", "In Progress")
    pending_tasks = progress_data.get("pending_tasks", [])
    problems = progress_data.get("problems", "None reported")

    # Format conversation history
    history_lines = []
    for turn in chat_history[-6:]:
        sender = turn.get("sender", "student")
        text = turn.get("text", "")
        history_lines.append(f"{sender.capitalize()}: {text}")
    formatted_history = "\n".join(history_lines) if history_lines else "None (Start of conversation)"

    system_prompt = f"""You are the AI Academic Project Mentor, an expert academic advisor and technical supervisor for computer science and engineering students.

STUDENT & PROJECT CONTEXT:
- Project Title: {project_title}
- Category: {project_category}
- Description: {project_desc}
- Student Skills: {skills_str}
- Current Milestone / Week: {current_week}
- Current Status: {current_status}
- Pending Tasks: {pending_tasks}
- Logged Problems / Blockers: {problems}

YOUR ROLE & TONE:
1. Provide practical, step-by-step guidance suitable for academic requirements (vivas, documentation, software architecture, testing).
2. Answer student questions conversationally, warmly, and with high technical clarity.
3. Suggest clear next steps, how to overcome blockers, or recommended tools/libraries.
4. Keep answers concise, well-structured, using markdown formatting (bullet points, bold highlights, code snippets when relevant).
5. Always be encouraging and action-oriented.
"""

    prompt = f"""RECENT CONVERSATION HISTORY:
{formatted_history}

STUDENT MESSAGE:
{message}

Please provide your mentor guidance response."""

    # 1. Try Gemini
    gemini_client = get_gemini_client()
    if gemini_client:
        try:
            full_prompt = f"{system_prompt}\n\n{prompt}"
            response = gemini_client.models.generate_content(
                model="gemini-flash-latest",
                contents=full_prompt
            )
            reply = response.text.strip()
            return {
                "success": True,
                "reply": reply,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print("Gemini chat error, falling back:", e)

    # 2. Try OpenAI
    openai_client = get_openai_client()
    if openai_client:
        try:
            model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            messages = [
                {"role": "system", "content": system_prompt}
            ]
            for turn in chat_history[-6:]:
                role = "assistant" if turn.get("sender") == "mentor" else "user"
                messages.append({"role": role, "content": turn.get("text", "")})
            messages.append({"role": "user", "content": message})

            res = openai_client.chat.completions.create(
                model=model,
                messages=messages
            )
            reply = res.choices[0].message.content.strip()
            return {
                "success": True,
                "reply": reply,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print("OpenAI chat error, falling back:", e)

    # 3. Contextual Heuristic Fallback
    fallback_reply = generate_fallback_mentor_reply(message, project_title, current_week, pending_tasks)
    return {
        "success": True,
        "reply": fallback_reply,
        "timestamp": datetime.now().isoformat()
    }

def generate_fallback_mentor_reply(message, project_title, current_week, pending_tasks):
    msg = message.lower()

    if any(k in msg for k in ["hello", "hi", "hey"]):
        return (
            f"👋 **Hello!** I'm your AI Academic Project Mentor for **{project_title}**.\n\n"
            f"We are currently tracking **{current_week}**. How can I support you today? "
            "You can ask me about:\n"
            "- Architecture & technology stack selection\n"
            "- Breaking down your upcoming milestone tasks\n"
            "- Resolving technical blockers or database issues\n"
            "- Preparing your documentation, synopsis, or viva presentation!"
        )

    if any(k in msg for k in ["progress", "status", "week", "schedule"]):
        return (
            f"📈 **Weekly Check-in for {project_title} ({current_week}):**\n\n"
            "Here is how you should evaluate your current progress:\n"
            "1. **Audit Completed Work:** Verify that code changes are committed to Git with clear commit messages.\n"
            "2. **Address Pending Tasks:** Focus strictly on high-impact blocker tasks first before UI embellishments.\n"
            "3. **Update the Progress Tracker:** Log your completed and pending tasks in the Progress Tracking tab so your timeline can automatically calibrate.\n\n"
            "What specific blocker is currently slowing you down?"
        )

    if any(k in msg for k in ["test", "testing", "bug", "error", "troubleshoot"]):
        return (
            "🛠️ **Mentor Debugging Strategy:**\n\n"
            "When troubleshooting issues in an academic project, follow this 4-step framework:\n"
            "1. **Isolate the Layer:** Determine whether the issue originates in the Frontend (console logs/network tab), Backend (Flask terminal logs), or Database (MongoDB connection).\n"
            "2. **Verify API Payloads:** Test your endpoint directly using curl, Postman, or a standalone test script.\n"
            "3. **Check Environment Variables:** Ensure all required `.env` values and CORS policies are properly loaded.\n"
            "4. **Log State Changes:** Print request payloads at the top of your route to inspect incoming data types.\n\n"
            "Share the error message or stack trace, and I will help you debug it step by step!"
        )

    if any(k in msg for k in ["synopsis", "methodology", "document", "report", "viva", "presentation"]):
        return (
            "📄 **Academic Documentation & Review Advice:**\n\n"
            "For your project evaluations and supervisor reviews, keep these pointers in mind:\n"
            "- **Synopsis:** Focus on the problem statement, clear objectives, and why your solution is unique.\n"
            "- **Methodology:** Include system architecture diagrams, database schemas, and dataflow pipelines.\n"
            "- **Documentation Tab:** You can generate your official **Synopsis**, **Methodology**, and **Progress Reports** directly from our Documentation Hub with one click!\n\n"
            "Would you like guidance on specific viva defense questions?"
        )

    if any(k in msg for k in ["database", "mongo", "mongodb", "schema"]):
        return (
            "🗄️ **Database & Data Modeling Guidance:**\n\n"
            "For **MongoDB** in this project:\n"
            "- Keep document schemas flexible but maintain consistent keys for core collections (`students`, `projects`, `timelines`, `progress`).\n"
            "- Use the native `test_connection()` helper in your backend to verify connectivity.\n"
            "- Ensure your connection string handles replica sets properly if using MongoDB Atlas (`mongodb+srv://...`).\n\n"
            "Need help designing a specific collection schema?"
        )

    # General mentor response
    return (
        f"🎯 **Mentor Advice for {project_title}:**\n\n"
        f"Regarding your query: *\"{message}\"*\n\n"
        "Here are 3 concrete steps you should take:\n"
        "1. **Clarify the Immediate Objective:** Break this requirement down into a 1-day deliverable.\n"
        "2. **Maintain Separation of Concerns:** Keep your agent logic in `services/`, routes in `routes/`, and presentation in React.\n"
        "3. **Validate with Real Inputs:** Run a standalone pipeline test to ensure the agent output meets your project rubric.\n\n"
        "Let me know if you would like me to dive deeper into any specific technical detail!"
    )
