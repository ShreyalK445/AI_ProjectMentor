import os
import json
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        # pyrefly: ignore [missing-import]
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception as e:
        print("Failed to initialize Gemini client for Risk Service:", e)
        return None

def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or "your_" in api_key:
        return None
    try:
        # pyrefly: ignore [missing-import]
        from openai import OpenAI
        return OpenAI(api_key=api_key)
    except Exception as e:
        print("Failed to initialize OpenAI client for Risk Service:", e)
        return None

def analyze_project_risks(project_idea, feasibility_analysis="Not provided", project_scope="Not provided", technology_stack=None):
    """
    Risk Assessment and Mitigation Agent (Milestone 3)
    Analyzes project feasibility, scope, and technologies to detect:
    - Technical, Data, Timeline, Resource, Integration, and Security risks
    - Severity, probability, impact, possible effects
    - Actionable student-friendly mitigation strategies
    """
    if not project_idea:
        return {
            "success": False,
            "error": "project_idea is required"
        }

    tech_summary = json.dumps(technology_stack) if isinstance(technology_stack, dict) else str(technology_stack or "Standard Web / AI Stack")
    scope_summary = json.dumps(project_scope) if isinstance(project_scope, dict) else str(project_scope or "Academic prototype")
    feasibility_summary = json.dumps(feasibility_analysis) if isinstance(feasibility_analysis, dict) else str(feasibility_analysis or "Feasible")

    prompt = f"""You are the Project Risk Assessment and Mitigation Agent in an AI Academic Project Mentor platform.
Analyze this academic student project to identify realistic execution risks, evaluate severity, and formulate practical mitigation strategies.

PROJECT INFORMATION:
- Project Idea: {project_idea}
- Feasibility Analysis: {feasibility_summary}
- Project Scope: {scope_summary}
- Technology Stack: {tech_summary}

TASK:
Identify 4 to 6 critical project risks across relevant categories:
- Technical Risk (complex algorithms, hardware constraints, package conflicts)
- Timeline Risk (underestimating sprint tasks, academic deadline crunch)
- Data Risk (data scarcity, annotation bottlenecks, format inconsistencies)
- Integration Risk (frontend-backend mismatch, external API limits/costs)
- Resource Risk (computational limits, training time, cloud credits)
- Security / Privacy Risk (insecure credentials, user data exposure)

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact schema:
{{
  "overall_risk": "MEDIUM",
  "overall_risk_score": 58,
  "summary": "Clear executive summary of project risks and outlook",
  "risks": [
    {{
      "id": "risk_1",
      "category": "Technical Risk",
      "risk": "Short title of the risk",
      "probability": "MEDIUM",
      "impact": "HIGH",
      "severity": "HIGH",
      "reason": "Why this risk occurs in this project",
      "possible_effect": "Negative outcome if unmitigated",
      "mitigation": "Practical step-by-step mitigation strategy for students",
      "recommended_action": "Immediate next step the student should take"
    }}
  ],
  "top_priority_actions": [
    "First crucial priority to de-risk the project",
    "Second priority",
    "Third priority"
  ],
  "final_recommendation": "Encouraging final advice on how to navigate the project smoothly."
}}
"""

    # 1. Try Gemini
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
            data = json.loads(raw.strip())
            data["success"] = True
            return data
        except Exception as e:
            print("Gemini Risk analysis failed, falling back:", e)

    # 2. Try OpenAI
    openai_client = get_openai_client()
    if openai_client:
        try:
            model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            res = openai_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a professional project risk analyst. Respond only in valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            data = json.loads(res.choices[0].message.content)
            data["success"] = True
            return data
        except Exception as e:
            print("OpenAI Risk analysis failed, falling back:", e)

    # 3. Intelligent Heuristic Rule-Based Fallback
    return generate_fallback_risk_assessment(project_idea, tech_summary)

def generate_fallback_risk_assessment(project_idea, tech_summary):
    idea_lower = (project_idea + " " + tech_summary).lower()
    
    risks = []
    
    # Check AI / ML risks
    if any(k in idea_lower for k in ["ai", "machine learning", "ml", "deep learning", "neural", "model", "predict"]):
        risks.append({
            "id": "risk_1",
            "category": "Technical & AI Risk",
            "risk": "Model Accuracy and Overfitting",
            "probability": "MEDIUM",
            "impact": "HIGH",
            "severity": "HIGH",
            "reason": "Training data may be limited or imbalanced, causing poor generalization on real-world test inputs.",
            "possible_effect": "Low demonstration accuracy during final faculty evaluation.",
            "mitigation": "Use established pre-trained architectures, cross-validation, and baseline simpler models (like Random Forest or Logistic Regression) before complex deep networks.",
            "recommended_action": "Collect and validate a benchmark dataset in Week 2 before fine-tuning models."
        })
        risks.append({
            "id": "risk_2",
            "category": "Data Risk",
            "risk": "Dataset Availability and Preprocessing Bottleneck",
            "probability": "HIGH",
            "impact": "MEDIUM",
            "severity": "MEDIUM",
            "reason": "Academic projects frequently face delays in finding clean, labeled public datasets.",
            "possible_effect": "Project stalls in early weeks waiting for clean training data.",
            "mitigation": "Identify existing Kaggle/HuggingFace datasets or synthesize simulated dummy records for prototype development.",
            "recommended_action": "Finalize dataset schema and download training samples within the first 10 days."
        })
    else:
        risks.append({
            "id": "risk_1",
            "category": "Technical Risk",
            "risk": "Architecture and State Synchronization Complexity",
            "probability": "MEDIUM",
            "impact": "MEDIUM",
            "severity": "MEDIUM",
            "reason": "Integrating multiple frontend components with asynchronous REST APIs can cause race conditions or state desynchronization.",
            "possible_effect": "Unresponsive UI or stale data displayed to users.",
            "mitigation": "Design unified API contracts and clear state handlers before starting frontend-backend wiring.",
            "recommended_action": "Create Postman or curl collection to test all backend routes independently."
        })

    # Timeline Risk
    risks.append({
        "id": "risk_3",
        "category": "Timeline Risk",
        "risk": "Underestimating End-to-End Integration and Testing Time",
        "probability": "HIGH",
        "impact": "HIGH",
        "severity": "HIGH",
        "reason": "Students typically spend excess time on initial development, leaving insufficient time for debugging integrated systems.",
        "possible_effect": "Unfinished demo or critical bugs on presentation day.",
        "mitigation": "Adopt a strict Week-wise milestone plan with a feature freeze 2 weeks prior to final submission.",
        "recommended_action": "Allocate Week 6 entirely for end-to-end integration and bug fixing."
    })

    # Integration / API Risk
    if any(k in idea_lower for k in ["api", "cloud", "payment", "gemini", "openai", "external"]):
        risks.append({
            "id": "risk_4",
            "category": "Integration & API Risk",
            "risk": "External API Rate Limits and Authentication Failures",
            "probability": "MEDIUM",
            "impact": "HIGH",
            "severity": "MEDIUM",
            "reason": "Free API tiers may throttle requests or credentials might expire during demo evaluation.",
            "possible_effect": "Application throws 429 Too Many Requests or 401 Unauthorized errors during presentations.",
            "mitigation": "Implement client-side caching, exponential backoff, and mock offline fallback responses.",
            "recommended_action": "Add mock fallback data in the frontend so demo functions even when offline."
        })
    else:
        risks.append({
            "id": "risk_4",
            "category": "Resource Risk",
            "risk": "Database Schema Evolution and Performance",
            "probability": "LOW",
            "impact": "MEDIUM",
            "severity": "LOW",
            "reason": "Modifying document or relational models midway through development causes orphaned records.",
            "possible_effect": "Database query failures or inconsistency.",
            "mitigation": "Lock the schema definition in the design phase and write seed scripts for test records.",
            "recommended_action": "Create reproducible sample seed data in MongoDB."
        })

    # Security Risk
    risks.append({
        "id": "risk_5",
        "category": "Security & Deployment Risk",
        "risk": "Exposing Environment Secrets in Version Control",
        "probability": "MEDIUM",
        "impact": "HIGH",
        "severity": "HIGH",
        "reason": "Accidentally pushing .env files with API keys or database connection strings to public GitHub repositories.",
        "possible_effect": "Compromised API tokens, revoked quotas, or security flags.",
        "mitigation": "Verify .gitignore contains .env and use environment variable injection across builds.",
        "recommended_action": "Run `git status` and check `.gitignore` before every commit."
    })

    return {
        "success": True,
        "overall_risk": "MEDIUM",
        "overall_risk_score": 62,
        "summary": "The project is technically feasible within standard academic schedules. Key areas requiring attention are dataset preparation, milestone discipline, and robust offline fallbacks.",
        "risks": risks,
        "top_priority_actions": [
            "Finalize API contracts and dataset source within Week 1-2.",
            "Enforce strict milestone deadlines with feature freeze 10 days before final evaluation.",
            "Verify all environment secrets are secured in .gitignore and protected."
        ],
        "final_recommendation": "Focus on creating an end-to-end working prototype with the core features first. Polish and secondary features should only be added once core flows are proven."
    }
