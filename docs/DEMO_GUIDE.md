# Reproducible Demonstration Guide: AI-Project-Mentor

## Demonstration Overview

This guide provides an end-to-end, step-by-step 5–10 minute walkthrough of the **AI-Project-Mentor** platform, showcasing both the **Student Workflow** (Onboarding, Milestone Planning, Progress Tracking, AI Mentoring) and the **Faculty Oversight Workflow** (Cohort Dashboard, Project Health Diagnostics, 9-Point AI Mentor Briefings, and Fault-Tolerant Fallbacks).

---

## 1. Prerequisites & Environment Setup

### 1.1 Terminal 1: Backend Startup
Open a terminal in the project root and start the Flask API server:
```bash
cd backend
# Windows:
.\venv\Scripts\python.exe app.py
```
*Expected Output:*
```text
 * Running on http://127.0.0.1:5000
```
*(Note: If local MongoDB is not running, the in-memory fallback will automatically seed sample cohort projects `proj-001` through `proj-005` without error).*

### 1.2 Terminal 2: Frontend Startup
Open a second terminal in the project root and start the Vite development server:
```bash
cd frontend
npm run dev
```
*Expected Output:*
```text
  VITE v6.4.1  ready in 250 ms
  ➜  Local:   http://localhost:5173/
```

Open your browser to `http://localhost:5173`.

---

## 2. Demonstration Flow (8–10 Minutes)

### Phase 1: Student Onboarding & Blueprint Generation (~2 Mins)
1. In the navigation bar, click on **Onboarding**.
2. Fill out the student profile with demo credentials:
   - **Student Name**: `Alex Chen`
   - **Email**: `alex.chen@university.edu`
   - **Department**: `Computer Science`
   - **Project Title**: `Autonomous Campus Delivery Drone with Obstacle Avoidance`
   - **Project Domain**: `Robotics & Computer Vision`
   - **Project Duration**: `8 Weeks`
   - **Problem Statement / Idea**: `Design an autonomous quadcopter prototype capable of delivering small laboratory specimens between campus buildings while utilizing depth cameras for real-time obstacle avoidance.`
3. Click **Submit Project Details**.
4. Observe the automatic transition to the **Blueprint** tab:
   - Review the **Feasibility Analysis** generated for the idea.
   - Review the **Project Scope** requirements and deliverables.
   - Review the **Technology Stack Recommendations** (Python, ROS2, OpenCV, PyTorch, MongoDB).

---

### Phase 2: Milestone Planning & AI Mentorship (~2 Mins)
1. Click the **Timeline** tab (or let the guided wizard navigate you).
2. Click **Generate 8-Week Milestone Timeline**.
3. Observe the generated weekly schedule:
   - Week 1: Sensor selection and flight simulator setup.
   - Week 2: Camera calibration and depth testing.
   - Week 3: Obstacle avoidance algorithm implementation.
   - Subsequent weeks through final demonstration.
4. Click the **Risk Assessment** tab:
   - Observe the risk register identifying hardware failure, weather interference, and latency risks with actionable mitigations.
5. Click the **AI Mentor** tab:
   - Type a question into the mentorship chat:  
     `"What is the best depth sensor to pair with a Raspberry Pi 4 for real-time collision detection?"`
   - Observe the conversational guidance returned by the mentor coach.

---

### Phase 3: Progress Tracking & Dynamic Adjustment (~2 Mins)
1. Click the **Progress Tracking** tab.
2. Submit a Week 2 progress update with an intentional delay:
   - **Select Week**: `Week 2`
   - **Completed Tasks**: `Installed simulation environment, calibrated monocular camera`
   - **Pending Tasks**: `Depth sensor calibration, real-time bounding box detection`
   - **Progress Percentage**: `25%`
   - **Report Problems / Blockers**: `Depth camera hardware shipment delayed by supplier; calibration postponed.`
3. Click **Submit Progress Update**.
4. Observe the feedback banner confirming submission and recalculating the project's health status.
5. *(Optional)* Click **Dynamic Plan Adjustment** to demonstrate how unfinished Week 2 tasks are absorbed into Week 3 without erasing historical logs.

---

### Phase 4: Faculty Dashboard & Cohort Monitoring (~2 Mins)
1. Click the **Faculty Dashboard** tab in the navigation bar.
2. Review the **Cohort Overview KPI Cards**:
   - Total Projects count.
   - Active, Completed, Needing Attention, and At-Risk counts.
   - Overdue Milestones tally.
3. Review the **Interactive Filters**:
   - Click the **At Risk** pill filter: Observe the roster immediately filtering to high-risk projects.
   - Use the **Search Bar**: Type `Delivery` or `Alex` to locate Alex Chen's project in real time.
   - Switch the **Sort By** dropdown: Sort by `Health (Worst First)` or `Progress (Lowest First)`.

---

### Phase 5: Project Inspection & 9-Point AI Summary (~2 Mins)
1. In the project roster, locate **Alex Chen**'s project (`Autonomous Campus Delivery Drone`).
2. Click the **Inspect Project** button.
3. In the Project Inspection modal:
   - Review the **Multi-Factor Health Diagnosis** showing health status, numeric score (out of 100), key strengths, and specific concerns (e.g., delayed hardware blocker).
   - Click the **Timeline & Progress History** tab to view logged submissions.
   - Click the **Risks** tab to view the active risk profile.
4. Review the **Executive Faculty Mentor Summary**:
   - Observe the 9 structured dimensions:
     1. Current Project Status
     2. Recent Achievements
     3. Completed & Pending Milestones
     4. Upcoming & Overdue Deadlines
     5. Current Blockers & Unresolved Risks
     6. Key Changes Since Previous Update
     7. Recommended Faculty Intervention (e.g., *"Immediate intervention required: Schedule emergency project check-in regarding hardware delay"*)
     8. Prioritized Next Actions
     9. Generation Provenance & Timestamp
5. Click **Regenerate Summary** to demonstrate live re-synthesis of the project briefing.

---

### Phase 6: Demonstrating Fault-Tolerant Fallbacks (~1 Min)
1. **Database Fallback**: Explain how stopping MongoDB has zero effect on the presentation because the in-memory fallback engine transparently maintains cohort synchronization.
2. **AI Provider Fallback**: Explain that in the event of missing or invalid external API keys (Gemini / OpenAI), the application gracefully falls back to the deterministic rule engine without throwing errors, freezing, or producing empty milestone schedules.

---

## 3. Post-Demo Reset (Optional)
To return the application to its clean initial cohort state:
- Restart the backend terminal (`Ctrl + C`, then run `.\venv\Scripts\python.exe app.py`).
- The in-memory cohort will re-initialize to the 5 standard benchmark projects (`proj-001` through `proj-005`).
