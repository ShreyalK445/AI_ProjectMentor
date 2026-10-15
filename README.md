
# AI Project Mentor

### AI-Guided Academic Project Progress Tracking Platform with Planning and Mentorship Assistance

**Project Domain:** Artificial Intelligence · Web Development · AI Agents · Academic Project Management

**Repository:** [AI_ProjectMentor](https://github.com/ShreyalK445/AI_ProjectMentor)

---

## 📌 Project Overview

**AI Project Mentor** is an AI-assisted academic project management platform designed to help students plan, organize, execute, and document their academic projects with structured guidance.

Students often struggle to convert an initial idea into a well-defined project with realistic milestones, suitable technologies, manageable tasks, and effective progress tracking. Faculty members may also find it challenging to monitor multiple student projects and provide continuous individualized guidance.

AI Project Mentor aims to address these challenges through a centralized platform that combines project planning, technology recommendations, risk assessment, progress monitoring, conversational mentorship, documentation assistance, and faculty-oriented monitoring.

The platform is designed to support students throughout the academic project lifecycle, from initial idea submission to implementation, progress review, and final documentation.

## 🎯 Problem Statement

Students frequently encounter difficulties in defining project objectives, selecting appropriate technologies, estimating realistic timelines, identifying risks, and maintaining consistent progress. Limited access to personalized mentorship can make these challenges more difficult.

At the same time, faculty members supervising multiple teams may need a more organized way to review project status and identify areas requiring attention.

The project aims to provide an integrated, AI-assisted platform that supports structured project planning, continuous guidance, progress tracking, and faculty monitoring.

## 💡 Objectives

- Simplify academic project submission and organization.
- Support project feasibility analysis and scope definition.
- Recommend suitable technologies based on project requirements.
- Assist in creating project milestones and execution plans.
- Identify potential project risks and suggest mitigation strategies.
- Provide conversational AI-based project guidance.
- Track project progress through task completion information.
- Support academic documentation generation.
- Provide a faculty-oriented interface for project monitoring.
- Integrate the frontend, backend, database, and AI-related components into a unified application.

## ✨ Key Features and Modules

The following modules are part of the project's documented scope. Their actual implementation status should be verified against the current repository.

### 1. Student Dashboard

Provides a central interface for students to access project-related features, review available information, and navigate between modules.

### 2. Student Profile and Skill Assessment

Supports student profile information and technical skill details that may help contextualize project planning and recommendations.

### 3. Project Submission

Allows students to enter project information, such as:

- Project title
- Project category
- Project description
- Project objectives

The submitted information can serve as the starting point for project planning and mentoring workflows.

### 4. Project Roadmap and Planning

Designed to organize a project into milestones and tasks, with planning details such as priorities, dependencies, and timelines where supported.

### 5. Technology Recommendation Agent

Provides technology suggestions relevant to the project requirements. Example technologies shown in the project interface include Python, ReactJS, Flask, and MongoDB.

### 6. Risk Assessment and Mitigation Agent

Designed to identify possible project risks and provide mitigation guidance. Risk assessment may consider factors such as probability, impact, dependencies, and resource constraints, depending on the implemented logic.

### 7. Progress Tracking and Plan Adjustment

Supports monitoring project progress through task completion information.

The project brief specifies the following progress calculation:

**Progress (%) = (Completed Tasks / Total Tasks) × 100**

For example, if 4 out of 10 tasks are completed, the calculated progress is 40%.

The application should handle projects with zero tasks safely.

### 8. Conversational AI Mentor

Provides an interface intended for students to ask project-related questions and receive guidance during planning and development.

### 9. Documentation Generation Hub

Designed to assist with academic project documentation, potentially including project synopses, methodology descriptions, and progress reports. Supported document types and export formats should be confirmed from the implementation.

### 10. Faculty Dashboard

Designed to help faculty members review available project information and monitor student project progress.

The exact dashboard metrics, data sources, and access permissions depend on the implemented functionality.

## 🏗️ System Architecture

The project materials identify a frontend, backend, database, and AI-agent architecture.

```text
              Student / Faculty
                     |
                     v
          ReactJS + Vite Frontend
                     |
                     v
             Python + Flask API
                /          \
               v            v
          MongoDB       AI Agent Workflow
                         (CrewAI)
               \            /
                v          v
             Application Response
                     |
                     v
             Frontend Interface
```

**Note:** This is a conceptual architecture based on the project brief. Confirm the actual request flow, agent integration, and database interactions from the source code before treating the diagram as an exact implementation diagram.

## 🛠️ Technology Stack

| Technology | Purpose |
| ---------- | ------- |
| ReactJS | Frontend user interface |
| Vite | Frontend development and build tooling |
| Python | Backend programming language |
| Flask | Backend API framework |
| MongoDB | Document-oriented database |
| CrewAI | AI-agent workflow framework identified in the project materials |

Actual package versions, AI model/provider, and additional dependencies should be taken from the repository's configuration files.

## 🔄 General Workflow

1. The student opens the application.
2. The student provides relevant profile and skill information, where required.
3. The student submits a project idea with its description and objectives.
4. The application processes the submitted project information.
5. The student accesses the available planning and technology recommendation features.
6. Potential project risks and mitigation suggestions can be reviewed.
7. The student manages tasks and updates project progress.
8. The student uses available AI mentoring and documentation features.
9. Faculty members access the monitoring interface where supported.

The exact workflow depends on which features are connected and operational in the current version.

## 📁 Project Structure

The following is a **conceptual structure**, not a verified listing of the repository's files. Replace it with the actual structure after reviewing the codebase.

```text
AI_ProjectMentor/
├── frontend/                 # ReactJS and Vite application
├── backend/                  # Python and Flask application
│   ├── routes/               # API route modules, if organized this way
│   ├── services/             # Application services, if present
│   └── agents/               # AI-agent logic, if organized separately
├── README.md
├── .gitignore
└── requirements.txt          # If used by the backend
```

The actual repository may use different folder names or a different organization. Refer to the existing source files rather than creating these folders solely to match this example.

## ⚙️ Installation and Setup

### Prerequisites

Install or configure the following, as applicable to the repository:

- Git
- Node.js and npm
- Python
- MongoDB or the configured MongoDB service
- Required AI model/provider credentials, if the application uses an external AI service

### Step 1: Clone the Repository

```bash
git clone https://github.com/ShreyalK445/AI_ProjectMentor.git
cd AI_ProjectMentor
```

### Step 2: Set Up the Frontend

Navigate to the actual frontend directory identified in the repository.

```bash
cd <frontend-directory>
npm install
```

Start the development server using the script defined in `package.json`. A common Vite command is:

```bash
npm run dev
```

Confirm the available scripts and frontend directory before running these commands.

### Step 3: Set Up the Backend

Open a separate terminal and navigate to the actual backend directory.

Create and activate a Python virtual environment:

```bash
python -m venv .venv
```

On Windows:

```bash
.venv\Scripts\activate
```

On macOS or Linux:

```bash
source .venv/bin/activate
```

Install dependencies using the dependency file provided by the repository. If the backend contains `requirements.txt`, use:

```bash
pip install -r requirements.txt
```

If a different dependency manager is used, follow the configuration included in the project.

### Step 4: Configure Environment Variables

Create a local environment file only if the application expects one. Check the source code and existing example configuration for the required variable names.

Typical configuration categories may include:

```text
MONGODB_URI=<your-mongodb-connection-string>
DATABASE_NAME=<your-database-name>
AI_PROVIDER_API_KEY=<your-provider-key-if-required>
```

These names are illustrative placeholders, **not confirmed variable names from the project**. Use the exact names expected by the application.

Do not commit credentials, private keys, or real environment files containing secrets to GitHub.

### Step 5: Start the Backend

Run the backend using the command documented by the application. For example, a Flask application may be started through its configured Flask entry point.

The exact command depends on the backend entry file, application configuration, and scripts in the repository.

### Step 6: Run the Application

Start the frontend and backend using their documented development commands. Confirm that:

- The frontend loads successfully.
- The backend API starts without errors.
- MongoDB connectivity works if persistence is required.
- AI-related features work when their required services and credentials are configured.

If a feature is unavailable, document the limitation instead of assuming that the integration is operational.

## 🔌 Backend API

The project materials identify the following API route groups:

| Route group | Intended purpose |
| ----------- | ---------------- |
| `/api/students` | Student-related operations |
| `/api/projects` | Project-related operations |
| `/api/skills` | Skill-related operations |

The exact HTTP methods, request bodies, response formats, validation rules, and status codes must be documented from the actual Flask route definitions.

## 🧠 AI-Agent Design

The project is designed around specialized AI-assisted responsibilities.

| Agent or functional area | Intended responsibility |
| ------------------------ | ----------------------- |
| Feasibility and scope | Evaluate project ideas and help define scope |
| Technology recommendation | Suggest relevant technologies |
| Milestone planning | Organize project execution into milestones and tasks |
| Risk assessment | Identify possible risks and suggest mitigation |
| Progress and plan adjustment | Support progress review and planning changes |
| Conversational mentor | Provide project-related conversational guidance |
| Documentation generation | Assist with academic project documents |

CrewAI is identified in the project materials as the framework associated with the agent architecture.

The actual agent definitions, task dependencies, model configuration, prompts, tools, and execution flow should be verified from the source code. AI-generated outputs should be reviewed by students and faculty rather than treated as guaranteed-correct answers.

## 🗓️ Development Milestones

The project statement describes four major development milestones.

| Milestone | Focus |
| --------- | ----- |
| Milestone 1 | Foundation, architecture, data models, onboarding, skills, and project submission |
| Milestone 2 | Feasibility and scope, technology recommendations, and project planning |
| Milestone 3 | Risk assessment, conversational mentoring, progress tracking, and documentation |
| Milestone 4 | Faculty dashboard, end-to-end testing, reliability improvements, documentation, and final demonstration |

These describe the planned development progression. Actual completion status should be reconciled with the latest code, test evidence, and team records before publication.

## 🧪 Testing and Quality Assurance

Testing should cover the following areas:

- Frontend navigation and form validation
- Backend API request and response behavior
- Database connectivity and data persistence
- AI-agent outputs and error handling
- Technology recommendation relevance
- Risk assessment and mitigation outputs
- Progress percentage calculations
- Zero-task and empty-state behavior
- Faculty dashboard data consistency and permissions
- Documentation generation, if implemented
- End-to-end integration and regression testing

**Testing status:** Add actual test results, test coverage, and known defects after executing and documenting the tests. No pass rates or performance measurements are claimed in this README.

## 🔐 Security and Responsible AI

Important considerations include:

- Keep database credentials and API keys outside committed source code.
- Validate user input on the backend.
- Enforce access permissions on the server wherever user roles are implemented.
- Avoid exposing private student information to unauthorized users.
- Handle unavailable AI services and invalid outputs gracefully.
- Treat AI-generated plans and recommendations as guidance requiring human review.
- Send only the information necessary for an AI request to external services.

These are security recommendations, not claims that all controls are currently implemented.

## 🚧 Current Limitations

Implementation-specific limitations should be updated after reviewing and testing the application. Areas requiring verification include:

- Whether all listed AI-agent functions are connected to live workflows.
- Whether recommendations are generated dynamically or use predefined content.
- The extent of database persistence for projects, milestones, tasks, and chat history.
- The availability and behavior of documentation export.
- The data sources and access controls of the faculty dashboard.
- Error handling, authentication, authorization, and automated test coverage.

## 🚀 Future Enhancements

Potential future improvements include:

- More detailed project feasibility analysis.
- Editable project roadmaps and milestone scheduling.
- Improved recommendation explanations and alternatives.
- Risk prioritization and mitigation-status tracking.
- Better AI response evaluation and prompt testing.
- Personalized mentorship using relevant project context.
- Expanded documentation templates and export options.
- Enhanced faculty reporting and project-health indicators.
- Automated integration and regression testing.
- Stronger access controls, privacy safeguards, and audit logging.
- Usability and accessibility improvements.

## 👥 Project Team

The following roles are recorded in the supplied project materials. Confirm the preferred names and contributions before final publication.

| Team member | Recorded responsibility |
| ----------- | ----------------------- |
| Piyush | AI Architecture and CrewAI Lead |
| Jeevana / Jeevi | Planning, Risk and Progress Specification Lead |
| Sailaja G. | ReactJS Frontend Lead |
| Shreyal K. | Backend, MongoDB and Integration Lead |
| Phani Sri M.D.L.A. | Faculty Requirements, QA and Documentation Lead |

**Department:** Artificial Intelligence

**Project:** AI Project Mentor — AI-Guided Academic Project Progress Tracking Platform with Planning and Mentorship Assistance

## 📚 References

- [AI Project Mentor — GitHub Repository](https://github.com/ShreyalK445/AI_ProjectMentor)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/guide/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [CrewAI Documentation](https://docs.crewai.com/)

Consult the official documentation corresponding to the versions actually used by the project.

## 📄 License

Add the project's chosen license here. Until a license is selected and committed to the repository, do not assume that the project is distributed under an open-source license.

---

**AI Project Mentor — Supporting students from project idea to structured execution through AI-assisted planning and mentorship.**
