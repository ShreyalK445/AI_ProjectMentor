import os
import sys
import json
from dotenv import load_dotenv

load_dotenv()

# Add backend directory to sys.path so services can be reused
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from services.risk_service import analyze_project_risks
except ImportError:
    analyze_project_risks = None

def run_risk_assessment(feasibility_output, project_idea="AI Academic Project", project_scope="Academic Scope", technology_stack=None):
    """
    Unified entry point for Risk Assessment.
    Tries backend risk service (Gemini / OpenAI / Heuristic),
    with graceful fallback to CrewAI if GROQ_API_KEY is available.
    """
    if analyze_project_risks:
        result = analyze_project_risks(
            project_idea=project_idea,
            feasibility_analysis=feasibility_output,
            project_scope=project_scope,
            technology_stack=technology_stack
        )
        return {
            "success": result.get("success", True),
            "risk_assessment": result
        }

    return {
        "success": False,
        "error": "Risk service unavailable."
    }

if __name__ == "__main__":
    print("\n==========================================")
    print("   RISK ASSESSMENT & MITIGATION AGENT")
    print("==========================================\n")
    
    sample_idea = "AI-based Student Project Mentor platform with automated tracking and guidance"
    sample_feasibility = "Technically feasible using Python, Flask, MongoDB, and Gemini LLMs."
    
    print(f"Project Idea: {sample_idea}\n")
    print("Analyzing risks...\n")
    
    res = run_risk_assessment(sample_feasibility, project_idea=sample_idea)
    print(json.dumps(res, indent=2))
    print("\n==========================================")
    print("   RISK ASSESSMENT COMPLETED")
    print("==========================================")