
import { useEffect, useState, useRef } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:5000/api/technology";
const PROGRESS_API_URL = "http://127.0.0.1:5000/api/progress";
const PROGRESS_GET_URL = "http://127.0.0.1:5000/api/progress";
const TIMELINE_GET_URL = "http://127.0.0.1:5000/api/timeline";
const RISK_API_URL = "http://127.0.0.1:5000/api/risk-assessment";
const MENTOR_CHAT_URL = "http://127.0.0.1:5000/api/mentor/chat";
const SYNOPSIS_API_URL = "http://127.0.0.1:5000/api/project/synopsis";
const METHODOLOGY_API_URL = "http://127.0.0.1:5000/api/project/methodology";
const PROGRESS_REPORT_DOC_URL = "http://127.0.0.1:5000/api/project/progress-report";
const PLAN_ADJUST_URL = "http://127.0.0.1:5000/api/plan-adjustment";

const skills = [
  { id: "Python", icon: "🐍", name: "Python" },
  { id: "Java", icon: "☕", name: "Java" },
  { id: "JavaScript", icon: "JS", name: "JavaScript" },
  { id: "React", icon: "⚛", name: "React" },
  { id: "MongoDB", icon: "◆", name: "MongoDB" },
  { id: "AI / ML", icon: "◉", name: "AI / ML" },
];

const DEFAULT_TIMELINE = {
  project_title: "AI based sentiment analysis",
  total_duration_weeks: 8,
  weekly_plan: [
    {
      week: 1,
      milestone: "Requirement Analysis & Scope Definition",
      tasks: [
        "Define sentiment analysis problem & domain scope",
        "Identify dataset requirements and data sources",
        "Formulate core system architecture and evaluation metrics"
      ],
      deliverables: ["Project specification document and requirements analysis"]
    },
    {
      week: 2,
      milestone: "Data Collection & Preprocessing Pipeline",
      tasks: [
        "Collect text reviews/sentiment corpora",
        "Implement tokenization, lemmatization, and stopwords cleaning",
        "Label and split dataset into train/val/test splits"
      ],
      deliverables: ["Curated dataset and preprocessing script"]
    },
    {
      week: 3,
      milestone: "Model Architecture & Baseline Training",
      tasks: [
        "Develop baseline sentiment classifier (Logistic / Naive Bayes)",
        "Implement transformer/LSTM feature extraction",
        "Track baseline performance metrics (F1-score, accuracy)"
      ],
      deliverables: ["Baseline model evaluation metrics"]
    },
    {
      week: 4,
      milestone: "Deep Learning & LLM / Sentiment Fine-Tuning",
      tasks: [
        "Fine-tune sentiment classification model / LLM embeddings",
        "Perform hyperparameter tuning and cross-validation",
        "Validate confidence score calibration and confusion matrix"
      ],
      deliverables: ["Trained sentiment model checkpoint"]
    },
    {
      week: 5,
      milestone: "Backend API & Inference Service",
      tasks: [
        "Build Flask/FastAPI REST endpoints for text inference",
        "Add batch sentiment analysis and aspect-based classification",
        "Optimize inference latency and error handling"
      ],
      deliverables: ["Working backend sentiment inference API"]
    },
    {
      week: 6,
      milestone: "Frontend Interactive Dashboard",
      tasks: [
        "Build interactive UI for live text analysis and file upload",
        "Display sentiment breakdown charts and confidence gauges",
        "Connect frontend components with backend API"
      ],
      deliverables: ["Interactive sentiment analysis web interface"]
    },
    {
      week: 7,
      milestone: "Testing, Risk Mitigation & Plan Review",
      tasks: [
        "Conduct unit tests and boundary condition validation",
        "Perform stress testing on long sentences and slang inputs",
        "Generate automated synopsis and methodology documentation"
      ],
      deliverables: ["Test report and academic documentation"]
    },
    {
      week: 8,
      milestone: "Final Deployment & Project Viva Presentation",
      tasks: [
        "Deploy prototype and verify end-to-end user experience",
        "Prepare slide deck and project viva documentation",
        "Final demonstration with faculty review presentation"
      ],
      deliverables: ["Completed project repository and final presentation"]
    }
  ]
};

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const loadSaved = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const [technologyResult, setTechnologyResult] = useState(() =>
    loadSaved("apm_tech", null)
  );

  // ---------- Login + Settings ----------
  const [auth, setAuth] = useState(() => loadSaved("apm_user", null));
  const [authForm, setAuthForm] = useState({
    mode: "login",
    name: "",
    email: "",
    password: "",
    error: "",
  });
  const [settings, setSettings] = useState(() =>
    loadSaved("apm_settings", {
      theme: "dark",
      fontSize: "large",
      notifications: true,
      weeklyReminder: true,
      mentorStyle: "detailed",
    })
  );
  const [technologyLoading, setTechnologyLoading] = useState(false);
  const [technologyError, setTechnologyError] = useState("");
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);

  const [formData, setFormData] = useState(() =>
    loadSaved("apm_profile", {
      name: "",
      department: "",
      year: "",
      interests: "",
    })
  );

  const [projectData, setProjectData] = useState(() =>
    loadSaved("apm_project", {
      title: "",
      category: "",
      description: "",
      objective: "",
    })
  );

  // Milestone 3 - Risk Assessment Agent
  const [riskResult, setRiskResult] = useState(() => loadSaved("apm_risk", null));
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState("");

  // Milestone 3 - Conversational AI Mentor Chat
  const [mentorChatHistory, setMentorChatHistory] = useState(() =>
    loadSaved("apm_mentor_chat", [
      {
        sender: "mentor",
        text: "👋 Hi there! I'm your AI Academic Project Mentor. I'm here for your weekly check-ins, architectural advice, and helping you solve blockers. How can I guide you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
  );
  const [mentorInput, setMentorInput] = useState("");
  const [mentorLoading, setMentorLoading] = useState(false);

  // Milestone 3 - On-Demand Documentation Generation Hub
  const [docTab, setDocTab] = useState("synopsis"); // synopsis | methodology | progress
  const [docResult, setDocResult] = useState({ synopsis: "", methodology: "", progress: "" });
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Milestone 3 - Dynamic Plan Adjustment
  const [adjustedPlan, setAdjustedPlan] = useState(null);

  // Milestone 3 - Progress Tracking
  // Progress percentage is calculated automatically by the Flask backend.
  const [progressData, setProgressData] = useState({
    week: "Week 1",
    currentTask: "Define sentiment analysis problem & domain scope",
    completedTasks: "Understood problem statement and finalized functional requirements",
    pendingTasks: "Dataset collection and source verification",
    problems: "None so far, initial research underway",
  });
  const [progressResult, setProgressResult] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [savedProgress, setSavedProgress] = useState([]);
  const [progressHistoryLoading, setProgressHistoryLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("apm_profile", JSON.stringify(formData));
      localStorage.setItem("apm_project", JSON.stringify(projectData));
      localStorage.setItem("apm_settings", JSON.stringify(settings));
      if (technologyResult) {
        localStorage.setItem("apm_tech", JSON.stringify(technologyResult));
      } else {
        localStorage.removeItem("apm_tech");
      }
      if (riskResult) {
        localStorage.setItem("apm_risk", JSON.stringify(riskResult));
      }
      localStorage.setItem("apm_mentor_chat", JSON.stringify(mentorChatHistory));
    } catch {
      /* ignore storage errors */
    }
  }, [formData, projectData, settings, technologyResult, riskResult, mentorChatHistory]);

  // M2 Timeline -> M3 Progress Tracking
  const [timelineData, setTimelineData] = useState(() =>
    loadSaved("apm_timeline", DEFAULT_TIMELINE)
  );
  const [milestone4Completed, setMilestone4Completed] = useState(() =>
    loadSaved("apm_milestone4_completed", {})
  );
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState("");

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const delta = touchCurrentX.current - touchStartX.current;

    if (!sidebarOpen && touchStartX.current < 30 && delta > 60) {
      setSidebarOpen(true);
    }

    if (sidebarOpen && delta < -60) {
      setSidebarOpen(false);
    }

    touchStartX.current = 0;
    touchCurrentX.current = 0;
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill]
    );
  };

  const handleProfileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProjectChange = (e) => {
    setProjectData({
      ...projectData,
      [e.target.name]: e.target.value,
    });
  };

  const handleContinue = () => {
    if (!formData.name || !formData.department || !formData.year) {
      alert("Please complete all required fields.");
      return;
    }

    setCurrentPage("project");
  };

  const getWeekNumber = (weekValue) => {
    const match = String(weekValue || "").match(/\d+/);
    return match ? Number(match[0]) : null;
  };

  const getWeekPlan = (weekValue) => {
    const weekNumber = getWeekNumber(weekValue);
    if (!weekNumber || !timelineData?.weekly_plan) return null;

    return (
      timelineData.weekly_plan.find(
        (item) => Number(item.week) === weekNumber
      ) || null
    );
  };

  const loadTimeline = async () => {
    setTimelineLoading(true);
    setTimelineError("");

    try {
      const response = await fetch(TIMELINE_GET_URL);
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success && data.timeline) {
        setTimelineData(data.timeline);
        try {
          localStorage.setItem("apm_timeline", JSON.stringify(data.timeline));
        } catch { }

        if (!progressData.week && data.timeline.weekly_plan?.length) {
          const firstWeek = data.timeline.weekly_plan[0];
          setProgressData((current) => ({
            ...current,
            week: `Week ${firstWeek.week}`,
            currentTask: firstWeek.tasks?.[0] || "",
          }));
        }
      } else {
        // Fall back gracefully to DEFAULT_TIMELINE
        if (!timelineData?.weekly_plan?.length) {
          setTimelineData(DEFAULT_TIMELINE);
        }
      }
    } catch (error) {
      console.warn("Using offline academic timeline:", error);
      if (!timelineData?.weekly_plan?.length) {
        setTimelineData(DEFAULT_TIMELINE);
      }
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleProgressChange = (e) => {
    const { name, value } = e.target;

    if (name === "week") {
      const selectedPlan = getWeekPlan(value);

      setProgressData((current) => ({
        ...current,
        week: value,
        currentTask: selectedPlan?.tasks?.[0] || "",
        completedTasks: "",
        pendingTasks: "",
        problems: "",
      }));
      return;
    }

    setProgressData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (currentPage === "progress") {
      loadTimeline();
      loadSavedProgress();
    }
  }, [currentPage]);

  const loadSavedProgress = async () => {
    setProgressHistoryLoading(true);
    try {
      const response = await fetch(PROGRESS_GET_URL);
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to load saved progress.");
      }
      setSavedProgress(Array.isArray(data.progress) ? data.progress : []);
    } catch (error) {
      console.error("Get Progress Error:", error);
    } finally {
      setProgressHistoryLoading(false);
    }
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();

    if (
      !progressData.week ||
      !progressData.currentTask.trim() ||
      !progressData.completedTasks.trim()
    ) {
      alert("Please complete Week, Current Task, and Completed Tasks.");
      return;
    }

    setProgressLoading(true);
    setProgressError("");
    setProgressResult(null);

    try {
      const response = await fetch(PROGRESS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          week: progressData.week,
          current_task: progressData.currentTask,
          completed_tasks: progressData.completedTasks,
          pending_tasks: progressData.pendingTasks,
          problems: progressData.problems,
          current_timeline: timelineData,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Progress Tracking request failed.");
      }

      setProgressResult(data.progress);
      if (data.plan_adjusted && data.adjusted_plan) {
        setAdjustedPlan(data.adjusted_plan);
      } else {
        setAdjustedPlan(null);
      }
      await loadSavedProgress();
      setCurrentPage("progress-report");
    } catch (error) {
      console.error("Progress Tracking Error:", error);
      setProgressError(
        error.message ||
        "Unable to connect to Progress Tracking. Please make sure the Flask backend is running on port 5000."
      );
    } finally {
      setProgressLoading(false);
    }
  };

  // Milestone 3: Run Risk Assessment Agent
  const handleRunRiskAssessment = async () => {
    setRiskLoading(true);
    setRiskError("");

    const projectIdea = projectData.title
      ? `${projectData.title}. ${projectData.description || ""}`
      : "Academic Software Project";

    try {
      const response = await fetch(RISK_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_idea: projectIdea,
          feasibility_analysis: "Technically feasible for academic development.",
          project_scope: projectData.objective || "Standard academic scope",
          technology_stack: technologyResult?.technology_recommendation || {},
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Risk assessment failed.");
      }

      setRiskResult(data.risk_assessment);
      setCurrentPage("risk");
    } catch (err) {
      console.error("Risk Assessment Error:", err);
      setRiskError(err.message || "Failed to run Risk Assessment Agent.");
    } finally {
      setRiskLoading(false);
    }
  };

  // Milestone 3: Conversational AI Mentor Chat
  const handleSendMentorMessage = async (customPrompt) => {
    const textToSend = (customPrompt || mentorInput || "").trim();
    if (!textToSend || mentorLoading) return;

    const userMessage = {
      sender: "student",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...mentorChatHistory, userMessage];
    setMentorChatHistory(updatedHistory);
    setMentorInput("");
    setMentorLoading(true);

    try {
      const response = await fetch(MENTOR_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          chat_history: updatedHistory,
          project_data: {
            title: projectData.title || "Academic Project",
            category: projectData.category || "Software",
            description: projectData.description || "",
            skills: selectedSkills,
          },
          progress_data: {
            week: progressData.week || "Week 1",
            status: progressResult?.status || "In Progress",
            pending_tasks: progressData.pendingTasks || "",
            problems: progressData.problems || "",
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to reach AI Mentor.");
      }

      const mentorReply = {
        sender: "mentor",
        text: data.reply || "I have received your update. Let's make continuous progress on your next milestone!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMentorChatHistory([...updatedHistory, mentorReply]);
    } catch (err) {
      console.error("Mentor chat error:", err);
      const errorReply = {
        sender: "mentor",
        text: `⚠️ ${err.message || "Could not connect to the Mentor service. Make sure the backend is active on port 5000."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMentorChatHistory([...updatedHistory, errorReply]);
    } finally {
      setMentorLoading(false);
    }
  };

  // Milestone 3: On-Demand Documentation Generation
  const handleGenerateDoc = async (type) => {
    setDocLoading(true);
    setDocError("");

    let url = SYNOPSIS_API_URL;
    if (type === "methodology") url = METHODOLOGY_API_URL;
    if (type === "progress") url = PROGRESS_REPORT_DOC_URL;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projectData.title || "AI Academic Project",
          project_idea: `${projectData.title || "Academic Project"}. ${projectData.description || ""}`,
          category: projectData.category || "Software Engineering",
          description: projectData.description || "",
          objective: projectData.objective || "Complete an end-to-end academic system.",
          skills: selectedSkills.join(", ") || "Python, React, MongoDB",
          completed_tasks: progressResult?.completed_tasks || ["Onboarding", "Ideation", "Architecture Design"],
          pending_tasks: progressResult?.pending_tasks || ["Testing", "Documentation"],
          current_progress: progressResult ? `${progressResult.progress_percentage}% completed (${progressResult.status})` : "Active development",
          risks: riskResult?.risks?.map(r => r.risk) || ["Timeline crunch", "API rate limits"],
          problems: progressData.problems ? [progressData.problems] : ["None reported"],
          next_week_plan: ["Implement integration tests", "Conduct mentor code review"],
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Documentation generation failed.");
      }

      const generatedContent = data.synopsis || data.methodology || data.progress_report || "";
      setDocResult(prev => ({
        ...prev,
        [type]: generatedContent
      }));
    } catch (err) {
      console.error("Doc generation error:", err);
      setDocError(err.message || "Failed to generate document.");
    } finally {
      setDocLoading(false);
    }
  };

  const handleCopyDoc = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleDownloadDoc = (filename, text) => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleProjectContinue = () => {
    if (
      !projectData.title ||
      !projectData.category ||
      !projectData.description
    ) {
      alert("Please complete all required project fields.");
      return;
    }

    setTechnologyError("");
    setCurrentPage("review");
  };

  // Technology Agent runs only after View Recommendation is clicked.
  const handleViewRecommendation = async () => {
    setTechnologyLoading(true);
    setTechnologyError("");
    setTechnologyResult(null);
    setCurrentPage("technology");

    const feasibilityAnalysis =
      "The project is technically feasible based on the submitted project idea, available skills, and proposed academic scope.";

    const projectScope =
      projectData.objective ||
      `Develop ${projectData.title} with the required features described by the student.`;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_idea: `${projectData.title}. ${projectData.description}`,
          feasibility_analysis: feasibilityAnalysis,
          project_scope: projectScope,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Technology recommendation request failed."
        );
      }

      setTechnologyResult(data.technology_recommendation);
    } catch (error) {
      console.error("Technology Agent Error:", error);
      setTechnologyError(
        "Unable to connect to the Technology Agent. Please make sure the Flask backend is running on port 5000."
      );
    } finally {
      setTechnologyLoading(false);
    }
  };

  const handleCompleteOnboarding = () => {
    // Technology Recommendation done -> go straight to Progress Tracking
    setCurrentPage("progress");
    loadSavedProgress();
  };

  // Displays any object returned by the backend without assuming one exact
  // response structure. This makes the frontend compatible with the current
  // Technology Agent response and future response improvements.
  const renderRecommendation = (value, level = 0) => {
    if (value === null || value === undefined || value === "") return null;

    if (typeof value === "object" && !Array.isArray(value)) {
      return (
        <div className={level === 0 ? "recommendation-object" : "recommendation-nested"}>
          {Object.entries(value).map(([key, item]) => (
            <div className="recommendation-item" key={key}>
              <h4>{formatKey(key)}</h4>
              {renderRecommendation(item, level + 1)}
            </div>
          ))}
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <ul className="recommendation-list">
          {value.map((item, index) => (
            <li key={index}>{renderRecommendation(item, level + 1)}</li>
          ))}
        </ul>
      );
    }

    return <p className="recommendation-value">{String(value)}</p>;
  };

  const formatKey = (key) =>
    String(key)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  // Parses the Technology Agent's numbered plain-text stack
  // ("1. PROGRAMMING LANGUAGE\n\nTechnology: Python\n\nReason: ...")
  // into structured cards. Falls back to null if the text doesn't
  // match that shape, so the generic renderer can still handle it.
  const parseTechStackText = (text) => {
    if (typeof text !== "string") return null;

    const cleaned = text.replace(/\\n/g, "\n").trim();
    const blocks = cleaned
      .split(/\n?\s*\d+\.\s+/)
      .map((b) => b.trim())
      .filter(Boolean);

    if (blocks.length < 2) return null;

    const cards = blocks
      .map((block) => {
        const techMatch = block.match(/Technology:\s*([\s\S]*?)(?:\n\s*Reason:|$)/i);
        const reasonMatch = block.match(/Reason:\s*([\s\S]*)/i);
        if (!techMatch) return null;

        const labelLine = block.split(/\n/)[0].split("Technology:")[0].trim();

        return {
          label: labelLine || "Recommendation",
          tech: techMatch[1].trim().replace(/\n+/g, " "),
          reason: reasonMatch ? reasonMatch[1].trim().replace(/\n+/g, " ") : "",
        };
      })
      .filter(Boolean);

    return cards.length ? cards : null;
  };

  const renderTechStackCards = (text) => {
    const cards = parseTechStackText(text);
    if (!cards) return renderRecommendation(text);

    return (
      <div className="tech-stack-grid">
        {cards.map((card, i) => {
          const isSkipped = /not required/i.test(card.tech);
          return (
            <div
              className={`tech-stack-card${isSkipped ? " tech-stack-card--skip" : ""}`}
              key={i}
            >
              <span className="tech-stack-index">{i + 1}</span>
              <div className="tech-stack-body">
                <p className="tech-stack-label">{card.label}</p>
                <h4 className="tech-stack-name">{card.tech}</h4>
                {card.reason && (
                  <p className="tech-stack-reason">{card.reason}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ---------- helper functions ----------
  const updateSetting = (key, value) =>
    setSettings((current) => ({ ...current, [key]: value }));

  const countItems = (value) => {
    if (Array.isArray(value)) return value.length;
    if (typeof value === "number") return value;
    const text = String(value || "").trim();
    if (!text) return 0;
    if (/^\d+$/.test(text)) return Number(text);
    return text.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean).length;
  };

  const completedTotal = savedProgress.reduce(
    (sum, item) => sum + countItems(item.completed_tasks),
    0
  );
  const pendingNow = savedProgress.length
    ? countItems(savedProgress[savedProgress.length - 1].pending_tasks)
    : 0;
  const totalTasks = completedTotal + pendingNow;
  // Latest % reported by the Progress Tracker agent (used so 100% there => everything Completed in Milestone 4 / Faculty views)
  const trackerPercent = savedProgress.length
    ? Math.max(0, Math.min(100, Number(savedProgress[savedProgress.length - 1].progress_percentage) || 0))
    : 0;

  const techStatus = technologyLoading
    ? "Running"
    : technologyResult
      ? "Completed"
      : "Not started";
  const progressLocked = !technologyResult;

  const openTechnologyAgent = () => {
    setSidebarOpen(false);
    if (technologyResult) {
      setCurrentPage("technology");
      return;
    }
    if (!projectData.title || !projectData.category || !projectData.description) {
      alert("Please submit your project idea first.");
      setCurrentPage("project");
      return;
    }
    handleViewRecommendation();
  };

  const openProgressAgent = () => {
    setSidebarOpen(false);
    if (!technologyResult) {
      alert("Complete the Technology Recommendation Agent first to unlock Progress Tracking.");
      setCurrentPage("agents");
      return;
    }
    setCurrentPage("progress");
    loadSavedProgress();
  };

  const handleAuthChange = (e) =>
    setAuthForm({ ...authForm, [e.target.name]: e.target.value, error: "" });

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const email = authForm.email.trim().toLowerCase();
    const isSignup = authForm.mode === "signup";

    if (isSignup && !authForm.name.trim()) {
      return setAuthForm({ ...authForm, error: "Please enter your full name." });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return setAuthForm({ ...authForm, error: "Please enter a valid email address." });
    }
    if (authForm.password.length < 6) {
      return setAuthForm({ ...authForm, error: "Password must be at least 6 characters." });
    }

    // Demo-only auth stored in the browser. Replace with a Flask /api/login later.
    const users = loadSaved("apm_users", []);
    let user;

    if (isSignup) {
      if (users.some((u) => u.email === email)) {
        return setAuthForm({ ...authForm, error: "This email is already registered. Please login." });
      }
      user = { name: authForm.name.trim(), email, password: authForm.password };
      localStorage.setItem("apm_users", JSON.stringify([...users, user]));
    } else {
      user = users.find((u) => u.email === email && u.password === authForm.password);
      if (!user) {
        return setAuthForm({ ...authForm, error: "Invalid email or password. New here? Create an account." });
      }
    }

    // Keep the demo workspace isolated between accounts. A brand-new account must
    // never inherit a previous user's project count or sample dashboard data.
    const previousOwner = localStorage.getItem("apm_data_owner");
    if (previousOwner !== email) {
      const emptyProfile = { name: user.name, department: "", year: "", interests: "" };
      const emptyProject = { title: "", category: "", description: "", objective: "" };
      const defaultSettings = { theme: "dark", fontSize: "large", notifications: true, weeklyReminder: true, mentorStyle: "detailed" };
      setFormData(emptyProfile);
      setProjectData(emptyProject);
      setTechnologyResult(null);
      setSavedProgress([]);
      setProgressResult(null);
      setProgressData({ week: "", currentTask: "", completedTasks: "", pendingTasks: "", problems: "" });
      setTimelineData(null);
      setSettings(defaultSettings);
      localStorage.setItem("apm_profile", JSON.stringify(emptyProfile));
      localStorage.setItem("apm_project", JSON.stringify(emptyProject));
      localStorage.setItem("apm_settings", JSON.stringify(defaultSettings));
      localStorage.removeItem("apm_tech");
    } else {
      setFormData((current) => ({ ...current, name: current.name || user.name }));
    }
    localStorage.setItem("apm_data_owner", email);
    localStorage.setItem("apm_user", JSON.stringify({ name: user.name, email: user.email }));
    setAuth({ name: user.name, email: user.email });
    setCurrentPage("dashboard");
    setAuthForm({ mode: "login", name: "", email: "", password: "", error: "" });
  };

  const handleLogout = () => {
    localStorage.removeItem("apm_user");
    setAuth(null);
    setCurrentPage("dashboard");
  };

  if (!auth) {
    const isSignup = authForm.mode === "signup";
    return (
      <div className={`login-shell theme-dark font-${settings.fontSize}`}>
        <div className="login-left">
          <div className="login-brand">
            <div className="brand-icon"><span>AI</span></div>
            <div>
              <h2>AI Project Mentor</h2>
              <p>Build • Learn • Grow</p>
            </div>
          </div>
          <h1>Your AI-powered project companion</h1>
          <p className="login-tagline">
            Submit your idea, get technology recommendations from AI agents and
            track your project progress week by week.
          </p>
          <ul className="login-points">
            <li>◇ Technology Recommendation Agent</li>
            <li>◔ Progress Tracking Agent</li>
            <li>✧ Smarter guidance, better projects</li>
          </ul>
        </div>

        <form className="login-card" onSubmit={handleAuthSubmit}>
          <h2>{isSignup ? "Create your account" : "Welcome back"}</h2>
          <p>{isSignup ? "Sign up to start your project journey." : "Login to continue to your dashboard."}</p>

          {isSignup && (
            <div className="login-field">
              <label htmlFor="auth-name">Full Name</label>
              <input id="auth-name" name="name" value={authForm.name} onChange={handleAuthChange} placeholder="Enter your full name" />
            </div>
          )}

          <div className="login-field">
            <label htmlFor="auth-email">Email</label>
            <input id="auth-email" name="email" type="email" value={authForm.email} onChange={handleAuthChange} placeholder="you@example.com" />
          </div>

          <div className="login-field">
            <label htmlFor="auth-password">Password</label>
            <input id="auth-password" name="password" type="password" value={authForm.password} onChange={handleAuthChange} placeholder="Minimum 6 characters" />
          </div>

          {authForm.error && <div className="login-error">⚠️ {authForm.error}</div>}

          <button type="submit" className="login-submit">
            {isSignup ? "Create Account" : "Login"} →
          </button>

          <p className="login-switch">
            {isSignup ? "Already have an account?" : "New here?"}{" "}
            <button
              type="button"
              onClick={() => setAuthForm({ mode: isSignup ? "login" : "signup", name: "", email: "", password: "", error: "" })}
            >
              {isSignup ? "Login" : "Create account"}
            </button>
          </p>
        </form>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .tech-stack-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }

        .tech-stack-card {
          display: grid;
          grid-template-columns: 34px 1fr;
          gap: 16px;
          background: rgba(15, 23, 55, 0.55);
          border: 1px solid rgba(120, 140, 255, 0.15);
          border-radius: 14px;
          padding: 18px 20px;
        }

        .tech-stack-card--skip {
          opacity: 0.65;
        }

        .tech-stack-index {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          background: linear-gradient(135deg, #3ad4ff, #8a3bff);
          color: #fff;
        }

        .tech-stack-card--skip .tech-stack-index {
          background: rgba(255, 255, 255, 0.08);
          color: #8b93b8;
        }

        .tech-stack-label {
          font-size: 12px;
          letter-spacing: 0.02em;
          color: #8b93b8;
          margin: 0 0 4px;
        }

        .tech-stack-name {
          margin: 0 0 6px;
          font-size: 17px;
          font-weight: 700;
          color: #7ce0c6;
        }

        .tech-stack-card--skip .tech-stack-name {
          color: #8b93b8;
        }

        .tech-stack-reason {
          margin: 0;
          font-size: 14px;
          line-height: 1.55;
          color: #c7cdec;
        }

        .main-content .profile-card-large {
          padding: 32px;
        }

        .onboarding-steps {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 24px 32px;
          margin-bottom: 24px;
          border-radius: 16px;
          background: rgba(15, 23, 55, 0.55);
          border: 1px solid rgba(120, 140, 255, 0.15);
        }

        .onboarding-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          min-width: 90px;
        }

        .onboarding-step-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          background: rgba(255, 255, 255, 0.06);
          color: #8b93b8;
          border: 1px solid rgba(120, 140, 255, 0.2);
        }

        .onboarding-step.active .onboarding-step-icon,
        .onboarding-step.done .onboarding-step-icon {
          background: linear-gradient(135deg, #3ad4ff, #8a3bff);
          color: #fff;
          border-color: transparent;
        }

        .onboarding-step-title {
          font-weight: 700;
          font-size: 14px;
          color: #8b93b8;
        }

        .onboarding-step.active .onboarding-step-title,
        .onboarding-step.done .onboarding-step-title {
          color: #fff;
        }

        .onboarding-step-subtitle {
          font-size: 12px;
          color: #6c7599;
        }

        .onboarding-step-line {
          flex: 1;
          height: 2px;
          background: rgba(120, 140, 255, 0.2);
          border-radius: 2px;
          margin: 0 4px;
          align-self: flex-start;
          margin-top: 22px;
        }

        .onboarding-step-line.filled {
          background: linear-gradient(90deg, #3ad4ff, #8a3bff);
        }

        .selected-technologies-display {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .selected-technologies-display .tech-tags {
          font-weight: 600;
          color: #e6e9f7;
        }

        .progress-report-page {
          max-height: calc(100vh - 170px);
          overflow-y: auto;
        }

        .progress-report-top {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin: 20px 0;
        }

        .progress-report-info {
          padding: 16px 18px;
          border: 1px solid rgba(117, 95, 255, 0.25);
          border-radius: 16px;
          background: rgba(10, 14, 38, 0.65);
        }

        .progress-report-info span {
          display: block;
          font-size: 10px;
          letter-spacing: 1.2px;
          opacity: 0.65;
          margin-bottom: 7px;
        }

        .progress-report-info strong {
          display: block;
          font-size: 15px;
          line-height: 1.4;
        }

        .progress-graphs-grid {
          display: grid;
          grid-template-columns: minmax(240px, 0.8fr) minmax(0, 1.2fr);
          gap: 18px;
        }

        .progress-graph-card {
          padding: 22px;
          border: 1px solid rgba(117, 95, 255, 0.22);
          border-radius: 18px;
          background: rgba(10, 14, 38, 0.62);
        }

        .progress-graph-card h3 {
          margin: 0 0 20px;
          font-size: 17px;
        }

        .progress-circle-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 220px;
        }

        .progress-circle {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 35px rgba(138, 59, 255, 0.18);
        }

        .progress-circle-inner {
          width: 138px;
          height: 138px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #080d22;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .progress-circle-inner strong {
          font-size: 30px;
          line-height: 1;
        }

        .progress-circle-inner span {
          margin-top: 7px;
          font-size: 11px;
          opacity: 0.65;
        }

        .task-bar-chart {
          display: flex;
          flex-direction: column;
          gap: 26px;
          padding-top: 18px;
        }

        .task-bar-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .task-bar-label span {
          opacity: 0.75;
        }

        .task-bar-track {
          height: 14px;
          border-radius: 99px;
          background: rgba(255,255,255,0.07);
          overflow: hidden;
        }

        .task-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.5s ease;
        }

        .task-bar-fill.completed {
          background: linear-gradient(90deg, #3ad4ff, #8a3bff);
        }

        .task-bar-fill.pending {
          background: linear-gradient(90deg, #ff9a5c, #ff4f9a);
        }

        .progress-chart-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 28px;
        }

        .progress-chart-summary div {
          padding: 12px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          text-align: center;
        }

        .progress-chart-summary span {
          display: block;
          font-size: 10px;
          opacity: 0.6;
          margin-bottom: 5px;
        }

        .progress-chart-summary strong {
          font-size: 17px;
        }

        .progress-report-problems {
          margin-top: 18px;
          padding: 16px 18px;
          border-radius: 14px;
          border: 1px solid rgba(117, 95, 255, 0.18);
          background: rgba(10, 14, 38, 0.5);
        }

        .progress-report-problems p {
          margin: 7px 0 0;
          opacity: 0.75;
        }

        .progress-page-card {
          max-height: calc(100vh - 170px);
          overflow-y: auto;
        }

        .progress-page-card .progress-summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin: 18px 0;
        }

        .progress-page-card .progress-stat-box {
          padding: 16px 18px;
          border: 1px solid rgba(117, 95, 255, 0.25);
          border-radius: 16px;
          background: rgba(10, 14, 38, 0.65);
        }

        .progress-page-card .progress-stat-box span {
          display: block;
          font-size: 11px;
          letter-spacing: 1.2px;
          opacity: 0.65;
          margin-bottom: 6px;
        }

        .progress-page-card .progress-stat-box strong {
          display: block;
          font-size: 16px;
          line-height: 1.35;
        }

        .progress-page-card .progress-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .progress-page-card .progress-full {
          grid-column: 1 / -1;
        }

        .progress-page-card .progress-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 18px;
        }

        .progress-page-card .progress-result-box {
          margin-top: 20px;
          padding: 20px;
          border-radius: 18px;
          border: 1px solid rgba(75, 220, 255, 0.28);
          background: rgba(7, 18, 35, 0.7);
        }

        .progress-page-card .backend-progress-track {
          height: 12px;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.08);
          overflow: hidden;
          margin: 16px 0 8px;
        }

        .progress-page-card .backend-progress-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #3ad4ff, #8a3bff);
          transition: width 0.4s ease;
        }

        .progress-page-card .progress-percent {
          text-align: right;
          font-weight: 800;
          font-size: 20px;
        }

        .progress-page-card .progress-result-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-top: 14px;
        }

        .progress-page-card .result-mini {
          padding: 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
        }

        .progress-page-card .result-mini span {
          display: block;
          font-size: 10px;
          opacity: 0.6;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        .progress-page-card .result-mini strong {
          font-size: 15px;
        }

        .progress-page-card .progress-error {
          margin-top: 16px;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 80, 120, 0.35);
          background: rgba(100, 20, 45, 0.22);
        }

        @media (max-width: 900px) {
          .progress-report-top,
          .progress-graphs-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .progress-page-card .progress-summary-grid,
          .progress-page-card .progress-result-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .progress-page-card .progress-form-grid {
            grid-template-columns: 1fr;
          }

          .progress-page-card .progress-full {
            grid-column: auto;
          }
        }

        @media (max-width: 600px) {
          .progress-page-card .progress-summary-grid,
          .progress-page-card .progress-result-grid {
            grid-template-columns: 1fr;
          }

          .progress-page-card .progress-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>

      <div
        className={`app-shell theme-${settings.theme} font-${settings.fontSize}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="background-glow glow-one"></div>
        <div className="background-glow glow-two"></div>
        <div className="cyber-grid"></div>

        <button
          className="hamburger-button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>

          <div className="brand">
            <div className="brand-icon">
              <span>AI</span>
            </div>

            <div>
              <h2>AI Project Mentor</h2>
              <p>Academic Guidance Platform</p>
            </div>
          </div>

          <div className="sidebar-line"></div>
          <div className="nav-heading">WORKSPACE</div>

          <button
            className={`nav-item ${currentPage === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setCurrentPage("dashboard");
              setSidebarOpen(false);
            }}
          >
            <span className="nav-icon">▦</span>
            Dashboard
          </button>

          <div className="nav-heading onboarding-heading">PROJECT TOOLS</div>

          <button
            className={`nav-item ${currentPage === "profile" ? "active" : ""}`}
            onClick={() => {
              setCurrentPage("profile");
              setSidebarOpen(false);
            }}
          >
            <span className="nav-icon">♙</span>
            Student Profile
          </button>

          <button
            className={`nav-item ${currentPage === "project" ? "active" : ""}`}
            onClick={() => {
              setCurrentPage("project");
              setSidebarOpen(false);
            }}
          >
            <span className="nav-icon">▤</span>
            Project Submission
          </button>

          <button
            className={`nav-item ${currentPage === "review" ? "active" : ""}`}
            onClick={() => {
              setCurrentPage("review");
              setSidebarOpen(false);
            }}
          >
            <span className="nav-icon">☑</span>
            Project Roadmap
          </button>

          <button className={`nav-item ${currentPage === "agents" ? "active" : ""}`} onClick={() => { setCurrentPage("agents"); setSidebarOpen(false); }}><span className="nav-icon">✿</span>AI Agents</button>
          <button className={`nav-item ${currentPage === "technology" ? "active" : ""}`} onClick={() => { setCurrentPage("technology"); setSidebarOpen(false); }}><span className="nav-icon">◇</span>Technology Agent</button>
          <button className={`nav-item ${currentPage === "risk" ? "active" : ""}`} onClick={() => { setCurrentPage("risk"); setSidebarOpen(false); }}><span className="nav-icon">⚠</span>Risk Agent</button>
          <button className={`nav-item ${currentPage === "progress" ? "active" : ""} ${progressLocked ? "locked" : ""}`} onClick={openProgressAgent}><span className="nav-icon">◔</span>Progress Tracker{progressLocked && <span className="lock-badge">🔒</span>}</button>
          <button className={`nav-item ${currentPage === "faculty" ? "active" : ""}`} onClick={() => { setCurrentPage("faculty"); setSidebarOpen(false); }}><span className="nav-icon">▤</span>Faculty Dashboard</button>
          <button className={`nav-item ${currentPage === "mentor" ? "active" : ""}`} onClick={() => { setCurrentPage("mentor"); setAiOpen(false); setSidebarOpen(false); }}><span className="nav-icon">✧</span>AI Mentor Chat</button>
          <button className={`nav-item ${currentPage === "documentation" ? "active" : ""}`} onClick={() => { setCurrentPage("documentation"); setSidebarOpen(false); }}><span className="nav-icon">📄</span>Documentation Hub</button>
          <button className={`nav-item ${currentPage === "settings" ? "active" : ""}`} onClick={() => { setCurrentPage("settings"); setSidebarOpen(false); }}><span className="nav-icon">⚙</span>Settings</button>

          <div className="sidebar-bottom">
            <div className="help-card">
              <p className="help-title">NEED HELP?</p>

              <div className="help-content">
                <div className="mentor-bot">
                  <svg viewBox="0 0 100 100" className="mentor-bot-svg">
                    <defs>
                      <linearGradient
                        id="botHead"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#3ad4ff" />
                        <stop offset="100%" stopColor="#8a3bff" />
                      </linearGradient>
                    </defs>

                    <line
                      x1="50"
                      y1="8"
                      x2="50"
                      y2="18"
                      stroke="url(#botHead)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle cx="50" cy="6" r="4" fill="#3ad4ff" />
                    <rect
                      x="20"
                      y="18"
                      width="60"
                      height="46"
                      rx="16"
                      fill="#0a1330"
                      stroke="url(#botHead)"
                      strokeWidth="3"
                    />
                    <rect
                      x="30"
                      y="30"
                      width="16"
                      height="18"
                      rx="8"
                      fill="#0a1330"
                      stroke="#4ce0ff"
                      strokeWidth="2.5"
                    />
                    <circle cx="38" cy="39" r="3.5" fill="#4ce0ff" />
                    <rect
                      x="54"
                      y="30"
                      width="16"
                      height="18"
                      rx="8"
                      fill="#0a1330"
                      stroke="#4ce0ff"
                      strokeWidth="2.5"
                    />
                    <circle cx="62" cy="39" r="3.5" fill="#4ce0ff" />
                    <path
                      d="M38 54 Q50 60 62 54"
                      stroke="#c86bff"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <rect
                      x="12"
                      y="34"
                      width="8"
                      height="14"
                      rx="4"
                      fill="url(#botHead)"
                    />
                    <rect
                      x="80"
                      y="34"
                      width="8"
                      height="14"
                      rx="4"
                      fill="url(#botHead)"
                    />
                    <rect
                      x="28"
                      y="68"
                      width="44"
                      height="24"
                      rx="10"
                      fill="#0a1330"
                      stroke="url(#botHead)"
                      strokeWidth="3"
                    />
                    <circle cx="50" cy="80" r="4" fill="#4ce0ff" />
                  </svg>
                </div>

                <p>
                  Our AI Mentor is here to guide you through every step of your
                  project journey.
                </p>
              </div>

              <button className="help-button" onClick={() => setAiOpen(true)}>
                Get AI Assistance <span>→</span>
              </button>
            </div>

            <div className="weather">
              <span className="weather-icon">☁️</span>
              <div>
                <strong>28°C</strong>
                <span>Mostly Clear</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <header className="top-header redesigned-header">
            <div className="top-search"><span>⌕</span><input aria-label="Search" placeholder="Search projects, agents, or anything..." onKeyDown={(e) => { if (e.key === "Enter" && e.currentTarget.value.trim()) alert(`Search: ${e.currentTarget.value}`); }} /></div>
            <div className="header-actions"><button className="notification" onClick={() => alert("You're all caught up!")} aria-label="Notifications">♧<i></i></button><button className="student-profile" onClick={() => setCurrentPage("profile")}><span className="avatar">{(formData.name || "SG").slice(0, 2).toUpperCase()}</span><span><strong>{formData.name || auth?.name || "Student"}</strong><small>Student</small></span><span>⌄</span></button></div>
          </header>
          <div className="dashboard-welcome"><div><span>Welcome back, {formData.name || auth?.name || "there"}!</span><h1>{currentPage === "dashboard" ? "Student Dashboard" : currentPage === "progress" ? "Progress Tracking" : currentPage === "faculty" ? "Faculty Dashboard" : currentPage === "technology" ? "Technology Recommendation" : currentPage === "risk" ? "Risk Assessment & Mitigation" : currentPage === "documentation" ? "Documentation Generation Hub" : currentPage === "profile" ? "Student Profile" : currentPage === "project" ? "Project Submission" : currentPage === "review" ? "Project Roadmap" : currentPage === "settings" ? "Settings" : currentPage === "mentor" ? "Conversational AI Mentor" : "AI Agents"}</h1><p>{currentPage === "faculty" ? "Monitor student progress, project health, weekly task checklist and auto-generated mentor summaries." : currentPage === "agents" ? "Run your AI agents in order — Technology, Risk Assessment, and Progress Tracking." : currentPage === "risk" ? "Evaluate execution blockers, technical pitfalls, and mitigation strategies." : currentPage === "documentation" ? "Generate formal academic Synopsis, Methodology, and Progress Reports with one click." : currentPage === "settings" ? "Manage your profile, appearance, notifications and AI Mentor preferences." : currentPage === "mentor" ? "Your personal academic project guide — ask questions, debug blockers, and track weekly progress." : "Track your progress, manage your project, and get AI-powered guidance all in one place."}</p></div></div>

          {(currentPage === "profile" || currentPage === "project") && (
            <div className="onboarding-steps">
              <div className={`onboarding-step ${currentPage === "profile" ? "active" : "done"}`}>
                <div className="onboarding-step-icon">1</div>
                <div className="onboarding-step-title">Profile</div>
                <div className="onboarding-step-subtitle">Tell us about you</div>
              </div>

              <div className={`onboarding-step-line ${currentPage === "project" ? "filled" : ""}`}></div>

              <div className={`onboarding-step ${currentPage === "project" ? "active" : ""}`}>
                <div className="onboarding-step-icon">2</div>
                <div className="onboarding-step-title">Project</div>
                <div className="onboarding-step-subtitle">Share your idea</div>
              </div>

              <div className="onboarding-step-line"></div>

              <div className="onboarding-step">
                <div className="onboarding-step-icon">✓</div>
                <div className="onboarding-step-title">Complete</div>
                <div className="onboarding-step-subtitle">Review &amp; finish</div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------
            STUDENT PROFILE
        -------------------------------------------------- */}
          {currentPage === "profile" && (
            <section className="glass-card profile-card-large">
              <div className="card-heading">
                <div className="section-icon">♙</div>
                <div>
                  <div className="section-number">SECTION 01</div>
                  <h2>Build your academic profile</h2>
                  <p>
                    Provide your academic background and technical skills so we
                    can offer relevant project guidance.
                  </p>
                </div>
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>Full Name *</label>
                  <div className="input-wrap">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleProfileChange}
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Department *</label>
                  <div className="input-wrap">
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleProfileChange}
                      placeholder="e.g. CSE / CSM"
                    />
                  </div>
                </div>

                <div className="input-group full">
                  <label>Academic Year *</label>
                  <div className="input-wrap">
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleProfileChange}
                    >
                      <option value="">Select year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>

                <div className="input-group full">
                  <label>Technical Skills</label>
                  <p className="field-hint">Select the technologies you are familiar with</p>
                  <div className="skills-grid">
                    {skills.map((skill) => (
                      <button
                        type="button"
                        key={skill.id}
                        className={`skill-card ${selectedSkills.includes(skill.id) ? "selected" : ""
                          }`}
                        onClick={() => toggleSkill(skill.id)}
                      >
                        <span className="skill-icon">{skill.icon}</span>
                        <span>{skill.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="input-group full">
                  <label>Academic Interests</label>
                  <div className="input-wrap">
                    <input
                      type="text"
                      name="interests"
                      value={formData.interests}
                      onChange={handleProfileChange}
                      placeholder="AI, Web Development, etc."
                    />
                  </div>
                </div>
              </div>

              <div className="form-footer">
                <span></span>
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleContinue}
                >
                  Continue to Project
                  <span className="button-arrow">→</span>
                </button>
              </div>
            </section>
          )}

          {/* --------------------------------------------------
            PROJECT SUBMISSION
        -------------------------------------------------- */}
          {currentPage === "project" && (
            <section className="glass-card">
              <div className="card-heading">
                <div className="section-icon">▤</div>
                <div>
                  <div className="section-number">SECTION 02</div>
                  <h2>Submit your project idea</h2>
                  <p>
                    Tell us about your project idea so our AI Mentor can
                    provide personalized guidance.
                  </p>
                </div>
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>Project Title *</label>
                  <div className="input-wrap">
                    <input
                      type="text"
                      name="title"
                      value={projectData.title}
                      onChange={handleProjectChange}
                      placeholder="e.g. AI Based Student Attendance System"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Project Category *</label>
                  <div className="input-wrap">
                    <select
                      name="category"
                      value={projectData.category}
                      onChange={handleProjectChange}
                    >
                      <option value="">Select category</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                      <option value="Machine Learning">Machine Learning</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Data Science">Data Science</option>
                      <option value="IoT">IoT</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="input-group selected-technologies-display">
                  <label>Selected Technologies</label>
                  <div className="tech-tags">
                    {selectedSkills.length > 0
                      ? selectedSkills.join(", ")
                      : "No skills selected yet"}
                  </div>
                </div>

                <div className="input-group full">
                  <label>Project Description *</label>
                  <div className="input-wrap">
                    <textarea
                      name="description"
                      value={projectData.description}
                      onChange={handleProjectChange}
                      placeholder="Explain what your project will do..."
                      rows="5"
                    ></textarea>
                  </div>
                </div>

                <div className="input-group full">
                  <label>Project Objective</label>
                  <div className="input-wrap">
                    <textarea
                      name="objective"
                      value={projectData.objective}
                      onChange={handleProjectChange}
                      placeholder="What is the main objective of your project?"
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              </div>

              {technologyError && (
                <div className="error-message">
                  ⚠️ {technologyError}
                </div>
              )}

              <div className="form-footer">
                <button type="button" onClick={() => setCurrentPage("profile")}>
                  ← Back to Profile
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={handleProjectContinue}
                >
                  Continue to Review
                  <span className="button-arrow">→</span>
                </button>
              </div>
            </section>
          )}

          {/* --------------------------------------------------
            REVIEW & COMPLETE
        -------------------------------------------------- */}
          {currentPage === "review" && (
            <section className="glass-card">
              <div className="card-heading">
                <div className="section-icon">✓</div>
                <div>
                  <div className="section-number">SECTION 03</div>
                  <h2>Review & Complete</h2>
                  <p>
                    Your academic profile and project idea are ready for review.
                  </p>
                </div>
              </div>

              <div className="review-details">
                <p><strong>Student Name :</strong> {formData.name}</p>
                <p><strong>Department :</strong> {formData.department}</p>
                <p><strong>Academic Year :</strong> {formData.year}</p>
                <p><strong>Project Title :</strong> {projectData.title}</p>
                <p><strong>Project Category :</strong> {projectData.category}</p>
                <p>
                  <strong>Technical Skills :</strong>{" "}
                  {selectedSkills.length > 0
                    ? selectedSkills.join(", ")
                    : "No skills selected"}
                </p>
              </div>

              <div className="form-footer">
                <button type="button" onClick={() => setCurrentPage("project")}>
                  ← Back to Project
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={handleViewRecommendation}
                >
                  View Recommendation
                  <span className="button-arrow">→</span>
                </button>
              </div>
            </section>
          )}

          {/* --------------------------------------------------
            PROGRESS TRACKING - MILESTONE 3
            Percentage is calculated automatically by backend.
        -------------------------------------------------- */}
          {currentPage === "progress" && (
            <section className="glass-card progress-page-card">
              <div className="card-heading">
                <div className="section-icon">◔</div>
                <div>
                  <div className="section-number">MILESTONE 03</div>
                  <h2>Project Progress Tracking</h2>
                  <p>
                    Submit your weekly work. Your progress percentage is calculated
                    automatically from completed and pending tasks.
                  </p>
                </div>
              </div>

              <div className="progress-summary-grid">
                <div className="progress-stat-box">
                  <span>PROJECT</span>
                  <strong>{projectData.title || "Not submitted"}</strong>
                </div>
                <div className="progress-stat-box">
                  <span>WEEK</span>
                  <strong>{progressResult?.week || progressData.week || "Not updated"}</strong>
                </div>
                <div className="progress-stat-box">
                  <span>STATUS</span>
                  <strong>{progressResult?.status || "Waiting for update"}</strong>
                </div>
              </div>

              {timelineLoading && (
                <div
                  className="progress-result-box"
                  style={{ marginBottom: "18px" }}
                >
                  Loading your M2 week-wise project plan...
                </div>
              )}

              {timelineError && (
                <div
                  className="progress-error"
                  style={{ marginBottom: "18px" }}
                >
                  ⚠️ {timelineError}
                </div>
              )}

              {getWeekPlan(progressData.week) && (
                <div
                  className="progress-result-box"
                  style={{ marginBottom: "18px" }}
                >
                  <h3>✓ Week Plan</h3>
                  <p>
                    <strong>{getWeekPlan(progressData.week).milestone}</strong>
                  </p>
                  <p style={{ marginBottom: "8px" }}>
                    Tasks planned for {progressData.week}:
                  </p>
                  <ul style={{ marginTop: 0, paddingLeft: "20px" }}>
                    {getWeekPlan(progressData.week).tasks?.map((task, index) => (
                      <li key={index} style={{ marginBottom: "6px" }}>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <form className="progress-form-grid" onSubmit={handleProgressSubmit}>
                <div className="input-group">
                  <label>Week *</label>
                  <div className="input-wrap">
                    <select
                      name="week"
                      value={progressData.week}
                      onChange={handleProgressChange}
                    >
                      <option value="">Select week</option>
                      {timelineData?.weekly_plan?.map((weekPlan) => (
                        <option
                          key={weekPlan.week}
                          value={`Week ${weekPlan.week}`}
                        >
                          Week {weekPlan.week}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Current Task *</label>
                  <div className="input-wrap">
                    <select
                      name="currentTask"
                      value={progressData.currentTask}
                      onChange={handleProgressChange}
                      disabled={!getWeekPlan(progressData.week)?.tasks?.length}
                    >
                      <option value="">Select current task</option>
                      {(getWeekPlan(progressData.week)?.tasks || []).map(
                        (task, index) => (
                          <option key={index} value={task}>
                            {task}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Completed Tasks *</label>
                  <div className="input-wrap">
                    <textarea
                      name="completedTasks"
                      value={progressData.completedTasks}
                      onChange={handleProgressChange}
                      placeholder="Enter completed tasks. Separate multiple tasks with commas or new lines."
                      rows="3"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Pending Tasks</label>
                  <div className="input-wrap">
                    <textarea
                      name="pendingTasks"
                      value={progressData.pendingTasks}
                      onChange={handleProgressChange}
                      placeholder="Enter pending tasks."
                      rows="3"
                    />
                  </div>
                </div>

                <div className="input-group progress-full">
                  <label>Problems Faced</label>
                  <div className="input-wrap">
                    <textarea
                      name="problems"
                      value={progressData.problems}
                      onChange={handleProgressChange}
                      placeholder="Mention blockers or problems you faced."
                      rows="3"
                    />
                  </div>
                </div>

                <div className="progress-actions progress-full">
                  <button
                    type="button"
                    onClick={() => setCurrentPage("dashboard")}
                  >
                    ← Back to Dashboard
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={progressLoading}
                  >
                    {progressLoading
                      ? "Calculating Progress..."
                      : "Submit Weekly Progress"}
                    <span className="button-arrow">→</span>
                  </button>
                </div>
              </form>

              {progressError && (
                <div className="progress-error">
                  ⚠️ {progressError}
                </div>
              )}

              {progressResult && (
                <div className="progress-result-box">
                  <h3>✓ Automatic Progress Result</h3>
                  <p>
                    <strong>{progressResult.week}</strong> —{" "}
                    {progressResult.current_task}
                  </p>

                  <div className="backend-progress-track">
                    <div
                      className="backend-progress-fill"
                      style={{
                        width: `${progressResult.progress_percentage}%`,
                      }}
                    ></div>
                  </div>

                  <div className="progress-percent">
                    {progressResult.progress_percentage}%
                  </div>

                  <div className="progress-result-grid">
                    <div className="result-mini">
                      <span>Status</span>
                      <strong>{progressResult.status}</strong>
                    </div>
                    <div className="result-mini">
                      <span>Completed</span>
                      <strong>{progressResult.completed_count}</strong>
                    </div>
                    <div className="result-mini">
                      <span>Pending</span>
                      <strong>{progressResult.pending_count}</strong>
                    </div>
                    <div className="result-mini">
                      <span>Total Tasks</span>
                      <strong>{progressResult.total_tasks}</strong>
                    </div>
                  </div>

                  <p style={{ marginTop: "14px" }}>
                    <strong>Problems:</strong>{" "}
                    {progressResult.problems || "No problems reported"}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* --------------------------------------------------
            PROGRESS REPORT - MILESTONE 3
            Opens automatically after Submit Weekly Progress.
        -------------------------------------------------- */}
          {currentPage === "progress-report" && progressResult && (
            <section className="glass-card progress-report-page">
              <div className="card-heading">
                <div className="section-icon">◔</div>
                <div>
                  <div className="section-number">MILESTONE 03</div>
                  <h2>Weekly Progress Report</h2>
                  <p>Your weekly progress has been calculated automatically.</p>
                </div>
              </div>

              <div className="progress-report-top">
                <div className="progress-report-info">
                  <span>WEEK</span>
                  <strong>{progressResult.week}</strong>
                </div>
                <div className="progress-report-info">
                  <span>CURRENT TASK</span>
                  <strong>{progressResult.current_task}</strong>
                </div>
                <div className="progress-report-info">
                  <span>STATUS</span>
                  <strong>{progressResult.status}</strong>
                </div>
              </div>

              <div className="progress-graphs-grid">
                <div className="progress-graph-card">
                  <h3>Overall Progress</h3>
                  <div className="progress-circle-wrap">
                    <div
                      className="progress-circle"
                      style={{
                        background: `conic-gradient(from -90deg, #43e2c1 0%, #8a63ff ${progressResult.progress_percentage}%, rgba(255,255,255,0.08) ${progressResult.progress_percentage}% 100%)`,
                      }}
                    >
                      <div className="progress-circle-inner">
                        <strong>{progressResult.progress_percentage}%</strong>
                        <span>Completed</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="progress-graph-card">
                  <h3>Task Progress</h3>
                  <div className="task-bar-chart">
                    <div className="task-bar-row">
                      <div className="task-bar-label">
                        <span>Completed</span>
                        <strong>{progressResult.completed_count}</strong>
                      </div>
                      <div className="task-bar-track">
                        <div
                          className="task-bar-fill completed"
                          style={{
                            width: `${progressResult.total_tasks > 0 ? (progressResult.completed_count / progressResult.total_tasks) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="task-bar-row">
                      <div className="task-bar-label">
                        <span>Pending</span>
                        <strong>{progressResult.pending_count}</strong>
                      </div>
                      <div className="task-bar-track">
                        <div
                          className="task-bar-fill pending"
                          style={{
                            width: `${progressResult.total_tasks > 0 ? (progressResult.pending_count / progressResult.total_tasks) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="progress-chart-summary">
                    <div><span>Total Tasks</span><strong>{progressResult.total_tasks}</strong></div>
                    <div><span>Completed</span><strong>{progressResult.completed_count}</strong></div>
                    <div><span>Pending</span><strong>{progressResult.pending_count}</strong></div>
                  </div>
                </div>
              </div>

              <div className="progress-report-problems">
                <strong>Problems Faced</strong>
                <p>{progressResult.problems || "No problems reported"}</p>
              </div>

              {adjustedPlan && (
                <div
                  style={{
                    background: "rgba(235, 130, 60, 0.12)",
                    border: "1px solid rgba(235, 130, 60, 0.35)",
                    borderRadius: "10px",
                    padding: "18px",
                    margin: "18px 0"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fb923c", fontWeight: "700", marginBottom: "6px" }}>
                    <span>⚡ AI Mentor Plan Adjustment Triggered (Milestone 3)</span>
                  </div>
                  <p style={{ margin: "0 0 10px 0", color: "#fdba74", fontSize: "13px" }}>
                    {adjustedPlan.message || "Because delayed or pending tasks were reported, your project plan has been dynamically recalibrated to maintain feasibility."}
                  </p>
                  {adjustedPlan.delayed_tasks?.length > 0 && (
                    <div style={{ fontSize: "12px", color: "#ffedd5" }}>
                      <strong>Rescheduled Tasks (Moved forward):</strong>
                      <ul style={{ margin: "4px 0", paddingLeft: "20px" }}>
                        {adjustedPlan.delayed_tasks.map((d, idx) => (
                          <li key={idx}>Task "{d.task}" moved to next sprint</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {adjustedPlan.affected_tasks?.length > 0 && (
                    <div style={{ fontSize: "12px", color: "#fca5a5", marginTop: "8px" }}>
                      <strong>Affected Downstream Dependencies:</strong>
                      <ul style={{ margin: "4px 0", paddingLeft: "20px" }}>
                        {adjustedPlan.affected_tasks.map((a, idx) => (
                          <li key={idx}>Week {a.week}: "{a.task}" ({a.reason})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="form-footer">
                <button type="button" onClick={() => setCurrentPage("progress")}>
                  ← Back to Progress Tracking
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setCurrentPage("dashboard")}
                >
                  Go to Dashboard
                  <span className="button-arrow">→</span>
                </button>
              </div>
            </section>
          )}

          {/* --------------------------------------------------
            TECHNOLOGY RECOMMENDATION
        -------------------------------------------------- */}
          {currentPage === "technology" && (
            <section className="glass-card">
              <div className="card-heading">
                <div className="section-icon">⚙</div>
                <div>
                  <div className="section-number">SECTION 04</div>
                  <h2>Technology Recommendation</h2>
                  <p>Recommended technologies generated by the Technology Stack Recommendation Agent.</p>
                </div>
              </div>

              {technologyLoading && (
                <div className="technology-result-section">
                  <div className="technology-result-heading">
                    <span>🛠️</span>
                    <div>
                      <h3>Analyzing your project...</h3>
                      <p>Please wait while the Technology Agent generates your recommendation.</p>
                    </div>
                  </div>
                </div>
              )}

              {!technologyLoading && technologyError && (
                <>
                  <div className="error-message">⚠️ {technologyError}</div>
                  <div className="form-footer">
                    <button type="button" onClick={() => setCurrentPage("review")}>
                      ← Back to Review
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={handleViewRecommendation}
                    >
                      Try Again
                      <span className="button-arrow">→</span>
                    </button>
                  </div>
                </>
              )}

              {!technologyLoading && !technologyError && technologyResult && (
                <>
                  <div className="review-details">
                    <p><strong>Project Title :</strong> {projectData.title}</p>
                    <p><strong>Project Category :</strong> {projectData.category}</p>
                  </div>

                  <div className="technology-result-section">
                    <div className="technology-result-heading">
                      <span>🛠️</span>
                      <div>
                        <h3>Recommended Technology Stack</h3>
                        <p>Generated by the Technology Stack Recommendation Agent.</p>
                      </div>
                    </div>

                    <div className="technology-result">
                      {renderTechStackCards(technologyResult)}
                    </div>
                  </div>

                  <div className="form-footer">
                    <button type="button" onClick={() => setCurrentPage("review")}>
                      ← Back to Review
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={handleCompleteOnboarding}
                    >
                      Complete &amp; Go to Progress Tracking →
                    </button>
                  </div>
                </>
              )}
            </section>
          )}

          {/* --------------------------------------------------
            AI AGENTS PAGE
        -------------------------------------------------- */}
          {currentPage === "agents" && (
            <section className="agents-page">
              <div className="agents-flow-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
                <article className={`agent-big ${technologyResult ? "done" : ""}`}>
                  <span className="agent-step">MILESTONE 2</span>
                  <div className="agent-big-head">
                    <b className="agent-icon">◇</b>
                    <div>
                      <h2>Technology Recommendation Agent</h2>
                      <em className={technologyResult ? "status-complete" : technologyLoading ? "status-running" : "status-pending"}>{techStatus}</em>
                    </div>
                  </div>
                  <p>Analyzes your submitted project idea and suggests the best technology stack for frontend, backend, database and AI.</p>
                  <ul className="agent-points">
                    <li>Evaluates required programming language & frameworks</li>
                    <li>Recommends optimal database and AI libraries</li>
                    <li>Provides architectural justification for students</li>
                  </ul>
                  <button type="button" className="primary-button" disabled={technologyLoading} onClick={openTechnologyAgent}>
                    {technologyLoading ? "Analyzing..." : technologyResult ? "View Tech Stack" : "Run Agent"}
                    <span className="button-arrow">→</span>
                  </button>
                </article>

                <article className={`agent-big ${riskResult ? "done" : ""}`}>
                  <span className="agent-step">MILESTONE 3</span>
                  <div className="agent-big-head">
                    <b className="agent-icon">⚠</b>
                    <div>
                      <h2>Risk Assessment & Mitigation Agent</h2>
                      <em className={riskResult ? "status-complete" : riskLoading ? "status-running" : "status-pending"}>
                        {riskResult ? `Risk: ${riskResult.overall_risk}` : riskLoading ? "Evaluating..." : "Ready"}
                      </em>
                    </div>
                  </div>
                  <p>Identifies project bottlenecks across technical, timeline, data, and integration dimensions with mitigation strategies.</p>
                  <ul className="agent-points">
                    <li>Detects 8 realistic project risk categories</li>
                    <li>Calculates probability, impact, and severity</li>
                    <li>Gives actionable steps to avoid academic project delays</li>
                  </ul>
                  <button type="button" className="primary-button" disabled={riskLoading} onClick={() => { if (riskResult) setCurrentPage("risk"); else handleRunRiskAssessment(); }}>
                    {riskLoading ? "Assessing..." : riskResult ? "View Risk Report" : "Run Risk Agent"}
                    <span className="button-arrow">→</span>
                  </button>
                </article>

                <article className={`agent-big ${savedProgress.length ? "done" : ""}`}>
                  <span className="agent-step">MILESTONE 3</span>
                  <div className="agent-big-head">
                    <b className="agent-icon">◔</b>
                    <div>
                      <h2>Progress Tracking & Plan Adjustment</h2>
                      <em className={savedProgress.length ? "status-complete" : "status-pending"}>{savedProgress.length ? "Active" : "Ready"}</em>
                    </div>
                  </div>
                  <p>Calculates weekly progress, highlights blockers, and dynamically reschedules milestones when tasks are delayed.</p>
                  <ul className="agent-points">
                    <li>Automated completion percentage math</li>
                    <li>Detects delayed dependencies between tasks</li>
                    <li>Dynamically recalibrates your remaining sprint plan</li>
                  </ul>
                  <button type="button" className="primary-button" onClick={openProgressAgent}>
                    Open Progress Tracker
                    <span className="button-arrow">→</span>
                  </button>
                </article>

                <article className="agent-big done">
                  <span className="agent-step">MILESTONE 3</span>
                  <div className="agent-big-head">
                    <b className="agent-icon">✧</b>
                    <div>
                      <h2>Conversational AI Mentor</h2>
                      <em className="status-complete">Online</em>
                    </div>
                  </div>
                  <p>Your interactive academic guide for weekly check-ins, answering technical questions, and preparing for viva evaluations.</p>
                  <ul className="agent-points">
                    <li>Continuous guidance tailored to your project</li>
                    <li>Actionable advice for resolving tricky bugs</li>
                    <li>Pre-built prompts for academic defense prep</li>
                  </ul>
                  <button type="button" className="primary-button" onClick={() => setCurrentPage("mentor")}>
                    Chat with Mentor
                    <span className="button-arrow">→</span>
                  </button>
                </article>

                <article className="agent-big done">
                  <span className="agent-step">MILESTONE 3</span>
                  <div className="agent-big-head">
                    <b className="agent-icon">📄</b>
                    <div>
                      <h2>Documentation Generation Hub</h2>
                      <em className="status-complete">Available</em>
                    </div>
                  </div>
                  <p>Auto-generates publication-ready academic project documentation formatted for university requirements.</p>
                  <ul className="agent-points">
                    <li>Project Synopsis (Executive summary & scope)</li>
                    <li>System Methodology & Architecture details</li>
                    <li>Weekly Progress Reports with supervisor sign-off</li>
                  </ul>
                  <button type="button" className="primary-button" onClick={() => setCurrentPage("documentation")}>
                    Open Documentation Hub
                    <span className="button-arrow">→</span>
                  </button>
                </article>
              </div>
            </section>
          )}

          {/* --------------------------------------------------
            MILESTONE 3: RISK ASSESSMENT & MITIGATION AGENT PAGE
        -------------------------------------------------- */}
          {currentPage === "risk" && (
            <section className="glass-card risk-page">
              <div className="card-heading">
                <div className="section-icon" style={{ background: "#4a2a22", color: "#ff8264" }}>⚠</div>
                <div>
                  <div className="section-number">MILESTONE 03</div>
                  <h2>Project Risk Assessment & Mitigation Agent</h2>
                  <p>Evaluates execution blockers, technical dependencies, and recommends practical solutions.</p>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <button
                    type="button"
                    className="primary-button"
                    disabled={riskLoading}
                    onClick={handleRunRiskAssessment}
                  >
                    {riskLoading ? "Evaluating Project Risks..." : riskResult ? "Re-evaluate Risks" : "Run Risk Assessment"}
                    <span className="button-arrow">⚡</span>
                  </button>
                </div>
              </div>

              {riskError && (
                <div className="progress-error" style={{ marginBottom: "16px" }}>
                  ⚠️ {riskError}
                </div>
              )}

              {!riskResult && !riskLoading && (
                <div className="empty-chart-state" style={{ textAlign: "center", padding: "40px 20px" }}>
                  <strong>No Risk Assessment Generated Yet</strong>
                  <p>Click "Run Risk Assessment" to have the agent analyze your project feasibility, scope, and tech stack.</p>
                  <button
                    type="button"
                    className="primary-button"
                    style={{ marginTop: "16px" }}
                    onClick={handleRunRiskAssessment}
                  >
                    Start Risk Assessment Now →
                  </button>
                </div>
              )}

              {riskLoading && (
                <div className="progress-result-box" style={{ textAlign: "center", padding: "30px" }}>
                  <h3>🔍 AI Risk Analyst is evaluating your project...</h3>
                  <p>Analyzing technical feasibility, dataset availability, sprint timelines, and external API rate limits.</p>
                </div>
              )}

              {riskResult && (
                <div className="risk-results-wrap">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                    <div className="progress-stat-box" style={{ borderLeft: riskResult.overall_risk === "HIGH" ? "4px solid #f87171" : riskResult.overall_risk === "MEDIUM" ? "4px solid #fbbf24" : "4px solid #34d399" }}>
                      <span>OVERALL RISK LEVEL</span>
                      <strong style={{ color: riskResult.overall_risk === "HIGH" ? "#f87171" : riskResult.overall_risk === "MEDIUM" ? "#fbbf24" : "#34d399" }}>
                        {riskResult.overall_risk} RISK
                      </strong>
                      <small style={{ color: "#9ca9c3", display: "block", marginTop: "4px" }}>
                        Risk Index: {riskResult.overall_risk_score || 60}/100
                      </small>
                    </div>

                    <div className="progress-stat-box">
                      <span>EVALUATED PROJECT</span>
                      <strong>{projectData.title || "Academic Project"}</strong>
                      <small style={{ color: "#9ca9c3", display: "block", marginTop: "4px" }}>
                        {riskResult.risks?.length || 0} identified risk areas
                      </small>
                    </div>

                    <div className="progress-stat-box">
                      <span>AGENT STATUS</span>
                      <strong style={{ color: "#34d399" }}>Analysis Complete</strong>
                      <small style={{ color: "#9ca9c3", display: "block", marginTop: "4px" }}>
                        Mitigations Ready
                      </small>
                    </div>
                  </div>

                  {riskResult.summary && (
                    <div className="progress-result-box" style={{ marginBottom: "24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "18px", borderRadius: "10px" }}>
                      <h3 style={{ margin: "0 0 8px 0", color: "#eaf0ff" }}>📌 Executive Summary</h3>
                      <p style={{ margin: 0, color: "#cbd5ed", lineHeight: "1.6" }}>{riskResult.summary}</p>
                    </div>
                  )}

                  {riskResult.top_priority_actions?.length > 0 && (
                    <div style={{ marginBottom: "24px", background: "rgba(35, 127, 128, 0.1)", border: "1px solid rgba(35, 127, 128, 0.3)", borderRadius: "10px", padding: "18px" }}>
                      <h3 style={{ margin: "0 0 10px 0", color: "#6be5c7" }}>🎯 Top Priority Actions to De-Risk Project</h3>
                      <ul style={{ margin: 0, paddingLeft: "20px", color: "#d1fae5" }}>
                        {riskResult.top_priority_actions.map((action, idx) => (
                          <li key={idx} style={{ marginBottom: "8px", lineHeight: "1.5" }}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <h3 style={{ color: "#eaf0ff", margin: "20px 0 14px 0" }}>Detailed Risk Matrix & Mitigations</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                    {riskResult.risks?.map((r, i) => (
                      <div
                        key={r.id || i}
                        style={{
                          background: "rgba(20, 27, 44, 0.9)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "12px",
                          padding: "18px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#77e8d4", background: "rgba(119, 232, 212, 0.12)", padding: "3px 8px", borderRadius: "4px" }}>
                            {r.category}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "800",
                              padding: "3px 8px",
                              borderRadius: "4px",
                              background: r.severity === "HIGH" ? "rgba(248, 113, 113, 0.2)" : r.severity === "MEDIUM" ? "rgba(251, 191, 36, 0.2)" : "rgba(52, 211, 153, 0.2)",
                              color: r.severity === "HIGH" ? "#f87171" : r.severity === "MEDIUM" ? "#fbbf24" : "#34d399",
                            }}
                          >
                            {r.severity} SEVERITY
                          </span>
                        </div>

                        <h4 style={{ margin: "4px 0", color: "#f3f4f6", fontSize: "15px" }}>{r.risk}</h4>

                        <div style={{ fontSize: "12px", color: "#9ca9c3", display: "flex", gap: "14px" }}>
                          <span>Probability: <strong style={{ color: "#e5e7eb" }}>{r.probability}</strong></span>
                          <span>Impact: <strong style={{ color: "#e5e7eb" }}>{r.impact}</strong></span>
                        </div>

                        <div style={{ background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "6px", fontSize: "12px", color: "#cbd5e1" }}>
                          <div style={{ marginBottom: "6px" }}><strong>Reason:</strong> {r.reason}</div>
                          <div><strong>Possible Effect:</strong> {r.possible_effect}</div>
                        </div>

                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px" }}>
                          <div style={{ fontSize: "12px", color: "#a7f3d0", marginBottom: "6px" }}>
                            <strong>💡 Mitigation Strategy:</strong>
                            <p style={{ margin: "4px 0 0 0", color: "#e2e8f0" }}>{r.mitigation}</p>
                          </div>
                          {r.recommended_action && (
                            <div style={{ fontSize: "12px", color: "#93c5fd" }}>
                              <strong>👉 Recommended Action:</strong> {r.recommended_action}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {riskResult.final_recommendation && (
                    <div style={{ marginTop: "24px", padding: "16px", borderRadius: "8px", background: "rgba(138, 99, 255, 0.1)", border: "1px solid rgba(138, 99, 255, 0.3)", color: "#e0e7ff", fontSize: "13px" }}>
                      <strong>Mentor Recommendation:</strong> {riskResult.final_recommendation}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* --------------------------------------------------
            MILESTONE 3: ON-DEMAND DOCUMENTATION GENERATION HUB
        -------------------------------------------------- */}
          {currentPage === "documentation" && (
            <section className="glass-card documentation-page">
              <div className="card-heading">
                <div className="section-icon" style={{ background: "#253149", color: "#77a6f7" }}>📄</div>
                <div>
                  <div className="section-number">MILESTONE 03</div>
                  <h2>On-Demand Documentation Generation Hub</h2>
                  <p>Generate academic-standard Project Synopsis, Methodology, and Progress Reports.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "14px", marginBottom: "20px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={`segmented-button ${docTab === "synopsis" ? "active" : ""}`}
                  style={{ padding: "10px 18px", borderRadius: "6px", border: "1px solid", borderColor: docTab === "synopsis" ? "#43e2c1" : "rgba(255,255,255,0.15)", background: docTab === "synopsis" ? "rgba(67, 226, 193, 0.15)" : "transparent", color: docTab === "synopsis" ? "#43e2c1" : "#cbd5e1", fontWeight: "600" }}
                  onClick={() => setDocTab("synopsis")}
                >
                  📄 Project Synopsis
                </button>
                <button
                  type="button"
                  className={`segmented-button ${docTab === "methodology" ? "active" : ""}`}
                  style={{ padding: "10px 18px", borderRadius: "6px", border: "1px solid", borderColor: docTab === "methodology" ? "#43e2c1" : "rgba(255,255,255,0.15)", background: docTab === "methodology" ? "rgba(67, 226, 193, 0.15)" : "transparent", color: docTab === "methodology" ? "#43e2c1" : "#cbd5e1", fontWeight: "600" }}
                  onClick={() => setDocTab("methodology")}
                >
                  🛠️ System Methodology
                </button>
                <button
                  type="button"
                  className={`segmented-button ${docTab === "progress" ? "active" : ""}`}
                  style={{ padding: "10px 18px", borderRadius: "6px", border: "1px solid", borderColor: docTab === "progress" ? "#43e2c1" : "rgba(255,255,255,0.15)", background: docTab === "progress" ? "rgba(67, 226, 193, 0.15)" : "transparent", color: docTab === "progress" ? "#43e2c1" : "#cbd5e1", fontWeight: "600" }}
                  onClick={() => setDocTab("progress")}
                >
                  📊 Progress Report
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <strong style={{ color: "#f3f4f6", fontSize: "16px" }}>
                    {docTab === "synopsis" ? "Academic Project Synopsis" : docTab === "methodology" ? "System Methodology & Architecture" : "Weekly Progress Report"}
                  </strong>
                  <p style={{ margin: "4px 0 0 0", color: "#9ca9c3", fontSize: "12px" }}>
                    {docTab === "synopsis" ? "Complete project problem statement, objectives, tech stack, and expected outcomes." : docTab === "methodology" ? "Modular breakdown, architecture layers, API pipeline, and validation model." : "Weekly milestones, completed tasks, identified risks, and mentor sign-off sheet."}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="primary-button"
                    disabled={docLoading}
                    onClick={() => handleGenerateDoc(docTab)}
                  >
                    {docLoading ? "Generating with AI..." : docResult[docTab] ? "Regenerate Document" : "Generate Document"} ⚡
                  </button>
                  {docResult[docTab] && (
                    <>
                      <button
                        type="button"
                        style={{ padding: "10px 14px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.2)" }}
                        onClick={() => handleCopyDoc(docResult[docTab])}
                      >
                        {copySuccess ? "✓ Copied!" : "📋 Copy"}
                      </button>
                      <button
                        type="button"
                        style={{ padding: "10px 14px", borderRadius: "6px", background: "rgba(255,255,255,0.08)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.2)" }}
                        onClick={() => handleDownloadDoc(`${projectData.title || "project"}_${docTab}.md`, docResult[docTab])}
                      >
                        ⬇ Download .md
                      </button>
                    </>
                  )}
                </div>
              </div>

              {docError && (
                <div className="progress-error" style={{ marginBottom: "16px" }}>
                  ⚠️ {docError}
                </div>
              )}

              {!docResult[docTab] && !docLoading && (
                <div className="empty-chart-state" style={{ textAlign: "center", padding: "50px 20px" }}>
                  <strong>No Document Generated Yet for this Section</strong>
                  <p>Click "Generate Document" above to generate this report using your project data.</p>
                </div>
              )}

              {docLoading && (
                <div className="progress-result-box" style={{ textAlign: "center", padding: "40px" }}>
                  <h3>⏳ Formatting Academic Document...</h3>
                  <p>Generating structured headings, formal academic sections, and system specifications.</p>
                </div>
              )}

              {docResult[docTab] && (
                <div
                  style={{
                    background: "#0c1322",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    padding: "24px",
                    color: "#d1d5db",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontSize: "13px",
                    lineHeight: "1.7",
                    whiteSpace: "pre-wrap",
                    overflowX: "auto",
                    maxHeight: "650px",
                    overflowY: "auto"
                  }}
                >
                  {docResult[docTab]}
                </div>
              )}
            </section>
          )}

          {/* --------------------------------------------------
            SETTINGS PAGE
        -------------------------------------------------- */}
          {currentPage === "settings" && (
            <section className="settings-page settings-workspace">
              <div className="settings-hero">
                <div className="settings-hero-copy">
                  <span className="settings-eyebrow"><i /> YOUR WORKSPACE, YOUR RULES</span>
                  <h2>Make it feel like <em>yours.</em></h2>
                  <p>Personalize your profile, fine-tune your workspace, and choose how your AI Mentor supports you.</p>
                </div>
                <div className="settings-hero-orb" aria-hidden="true"><span>✳</span><i /><b /></div>
                <div className="settings-hero-foot"><span><i /> Preferences save automatically</span><span>WORKSPACE SETTINGS <b>•</b> PERSONAL</span></div>
              </div>
              <div className="settings-section-label"><span>01 / PERSONALIZATION</span><p>Your identity and how the app looks</p></div>
              <article className="settings-card settings-profile-card">
                <h2><span className="settings-heading-icon teal">◎</span><span>Profile<small>Your personal details</small></span></h2>
                <div className="settings-grid">
                  <div className="input-group">
                    <label htmlFor="set-name">Full Name</label>
                    <input id="set-name" name="name" value={formData.name} onChange={handleProfileChange} placeholder="Your name" />
                  </div>
                  <div className="input-group">
                    <label htmlFor="set-dept">Department</label>
                    <input id="set-dept" name="department" value={formData.department} onChange={handleProfileChange} placeholder="e.g. CSE" />
                  </div>
                  <div className="input-group">
                    <label htmlFor="set-email">Email</label>
                    <input id="set-email" value={auth.email} readOnly />
                  </div>
                </div>
              </article>

              <article className="settings-card settings-appearance-card">
                <h2><span className="settings-heading-icon violet">◐</span><span>Appearance<small>Shape your visual workspace</small></span></h2>
                <div className="settings-row">
                  <div><strong>Theme</strong><span>Choose dark or light interface</span></div>
                  <div className="segmented">
                    {["dark", "light"].map((t) => (
                      <button key={t} type="button" className={settings.theme === t ? "on" : ""} onClick={() => updateSetting("theme", t)}>{t === "dark" ? "🌙 Dark" : "☀️ Light"}</button>
                    ))}
                  </div>
                </div>
                <div className="settings-row">
                  <div><strong>Font size</strong><span>Make text bigger or smaller</span></div>
                  <div className="segmented">
                    {[["medium", "Medium"], ["large", "Large"], ["xl", "Extra Large"]].map(([v, label]) => (
                      <button key={v} type="button" className={settings.fontSize === v ? "on" : ""} onClick={() => updateSetting("fontSize", v)}>{label}</button>
                    ))}
                  </div>
                </div>
              </article>

              <div className="settings-section-label"><span>02 / PREFERENCES</span><p>Keep your workflow comfortable and focused</p></div>
              <article className="settings-card settings-notification-card">
                <h2><span className="settings-heading-icon amber">⌁</span><span>Notifications<small>Choose what deserves your attention</small></span></h2>
                <label className="settings-row toggle-row">
                  <div><strong>Agent updates</strong><span>Notify me when an agent completes</span></div>
                  <input type="checkbox" checked={settings.notifications} onChange={(e) => updateSetting("notifications", e.target.checked)} />
                </label>
                <label className="settings-row toggle-row">
                  <div><strong>Weekly progress reminder</strong><span>Remind me to submit weekly progress</span></div>
                  <input type="checkbox" checked={settings.weeklyReminder} onChange={(e) => updateSetting("weeklyReminder", e.target.checked)} />
                </label>
              </article>

              <article className="settings-card settings-mentor-card">
                <h2><span className="settings-heading-icon purple">✳</span><span>AI Mentor<small>Set the tone of your guidance</small></span></h2>
                <div className="settings-row">
                  <div><strong>Guidance style</strong><span>How detailed the mentor should be</span></div>
                  <div className="segmented">
                    {[["brief", "Brief"], ["detailed", "Detailed"]].map(([v, label]) => (
                      <button key={v} type="button" className={settings.mentorStyle === v ? "on" : ""} onClick={() => updateSetting("mentorStyle", v)}>{label}</button>
                    ))}
                  </div>
                </div>
                <button type="button" className="primary-button" onClick={() => setAiOpen(true)}>Open AI Mentor <span className="button-arrow">→</span></button>
              </article>

              <div className="settings-section-label"><span>03 / ACCOUNT</span><p>Manage access to your account</p></div>
              <article className="settings-card settings-account-card">
                <h2><span className="settings-heading-icon slate">⌑</span><span>Account<small>Your sign-in and session</small></span></h2>
                <div className="settings-row">
                  <div><strong>{auth.name}</strong><span>{auth.email}</span></div>
                  <button type="button" className="logout-button" onClick={handleLogout}>Logout</button>
                </div>
              </article>
            </section>
          )}

          {/* --------------------------------------------------
            AI PROJECT MENTOR — dedicated workspace
        -------------------------------------------------- */}
          {currentPage === "mentor" && (
            <section className="mentor-page">
              <div className="mentor-hero" style={{ marginBottom: "20px" }}>
                <div className="mentor-hero-copy">
                  <span className="mentor-kicker">CONVERSATIONAL ACADEMIC MENTOR</span>
                  <h2>One-on-One Project Guidance<br /><em>Whenever you need it.</em></h2>
                  <p>Discuss your architecture, troubleshoot tricky bugs, plan your upcoming sprints, and get viva evaluation prep.</p>
                  <div className="mentor-hero-actions">
                    <button className="mentor-primary" onClick={() => setCurrentPage(projectData.title ? "progress" : "project")}>
                      {projectData.title ? "Track Sprint Progress" : "Setup Project Workspace"} <span>→</span>
                    </button>
                    <button className="mentor-secondary" onClick={() => setCurrentPage("risk")}>View Risk Matrix</button>
                  </div>
                </div>
                <div className="mentor-orb-scene" aria-hidden="true">
                  <div className="mentor-orbit orbit-one"></div>
                  <div className="mentor-orbit orbit-two"></div>
                  <div className="mentor-orb"><span>✦</span></div>
                  <div className="mentor-orb-caption">AI MENTOR <small>ONLINE · CONTEXT-AWARE</small></div>
                </div>
              </div>

              {/* Live Conversational Chatroom */}
              <div className="glass-card" style={{ padding: "20px", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "14px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#168f8b", display: "grid", placeItems: "center", fontSize: "18px" }}>🤖</div>
                    <div>
                      <h3 style={{ margin: 0, color: "#f3f4f6", fontSize: "16px" }}>Academic Mentor Consultation</h3>
                      <small style={{ color: "#77e8d4" }}>
                        ● Active • Project Context: {projectData.title || "Standard Workspace"} ({progressData.week || "Week 1"})
                      </small>
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#9ca9c3", padding: "6px 12px", borderRadius: "6px", fontSize: "11px" }}
                    onClick={() => {
                      setMentorChatHistory([
                        {
                          sender: "mentor",
                          text: "👋 Hi! Session refreshed. What aspect of your academic project would you like to discuss?",
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      ]);
                    }}
                  >
                    Clear Chat
                  </button>
                </div>

                {/* Chat Thread */}
                <div
                  style={{
                    height: "380px",
                    overflowY: "auto",
                    padding: "12px",
                    background: "#0d1424",
                    borderRadius: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    marginBottom: "16px",
                    border: "1px solid rgba(255,255,255,0.06)"
                  }}
                >
                  {mentorChatHistory.map((msg, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: msg.sender === "student" ? "flex-end" : "flex-start",
                        maxWidth: "85%",
                        alignSelf: msg.sender === "student" ? "flex-end" : "flex-start"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", fontSize: "10px", color: "#8a96aa" }}>
                        <span>{msg.sender === "student" ? (formData.name || "Student") : "AI Project Mentor"}</span>
                        <span>•</span>
                        <span>{msg.timestamp || ""}</span>
                      </div>
                      <div
                        style={{
                          padding: "12px 16px",
                          borderRadius: msg.sender === "student" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                          background: msg.sender === "student" ? "linear-gradient(135deg, #2b6cb0, #4c51bf)" : "rgba(255,255,255,0.06)",
                          color: "#f3f4f6",
                          fontSize: "13px",
                          lineHeight: "1.6",
                          whiteSpace: "pre-wrap",
                          border: msg.sender === "student" ? "none" : "1px solid rgba(255,255,255,0.1)",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {mentorLoading && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#77e8d4", fontSize: "12px", padding: "8px" }}>
                      <span>🤖 AI Mentor is formulating advice...</span>
                    </div>
                  )}
                </div>

                {/* Quick Prompt Suggestions */}
                <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px", marginBottom: "12px", scrollbarWidth: "none" }}>
                  <span style={{ fontSize: "11px", color: "#9ca9c3", alignSelf: "center", whiteSpace: "nowrap" }}>Quick Prompts:</span>
                  {[
                    "How should I structure my weekly tasks?",
                    "Help me debug backend API errors",
                    "What questions will supervisor ask in viva?",
                    "How to connect MongoDB to Flask?"
                  ].map((promptText, idx) => (
                    <button
                      key={idx}
                      type="button"
                      style={{
                        whiteSpace: "nowrap",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "#cbd5e1",
                        borderRadius: "20px",
                        padding: "6px 12px",
                        fontSize: "11px",
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                      onClick={() => handleSendMentorMessage(promptText)}
                    >
                      💡 {promptText}
                    </button>
                  ))}
                </div>

                {/* Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMentorMessage();
                  }}
                  style={{ display: "flex", gap: "10px" }}
                >
                  <input
                    type="text"
                    placeholder="Ask a question about your project, report, or implementation..."
                    value={mentorInput}
                    onChange={(e) => setMentorInput(e.target.value)}
                    disabled={mentorLoading}
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      borderRadius: "8px",
                      background: "#0b1120",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#f3f4f6",
                      fontSize: "13px",
                      outline: "none"
                    }}
                  />
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={mentorLoading || !mentorInput.trim()}
                    style={{ padding: "0 22px" }}
                  >
                    Send ↗
                  </button>
                </form>
              </div>

              {/* Mentor Action Quick Links */}
              <div className="mentor-section-heading">
                <div><span>STRATEGIC PHASES</span><h2>Guiding your lifecycle</h2></div>
                <p>Key checkpoints for academic success</p>
              </div>
              <div className="mentor-action-grid">
                <article className="mentor-action-card mentor-idea">
                  <div className="mentor-action-icon">✦</div>
                  <span className="mentor-card-label">01 / IDEATE & SCOPE</span>
                  <h3>Refine Problem Statement</h3>
                  <p>Ensure your project scope is achievable within academic semester deadlines.</p>
                  <button onClick={() => handleSendMentorMessage("How can I narrow down my project scope to ensure it is finished on time?")}>
                    Ask Mentor <span>↗</span>
                  </button>
                </article>
                <article className="mentor-action-card mentor-plan">
                  <div className="mentor-action-icon">⌘</div>
                  <span className="mentor-card-label">02 / ARCHITECTURE</span>
                  <h3>Technology Alignment</h3>
                  <p>Verify that your frontend, backend, and database integrate with minimal friction.</p>
                  <button onClick={() => setCurrentPage("technology")}>
                    Review Tech Stack <span>↗</span>
                  </button>
                </article>
                <article className="mentor-action-card mentor-tech">
                  <div className="mentor-action-icon">⚡</div>
                  <span className="mentor-card-label">03 / RISK MITIGATION</span>
                  <h3>Blocker Management</h3>
                  <p>Proactively resolve API limits, data shortages, and integration issues.</p>
                  <button onClick={() => setCurrentPage("risk")}>
                    Inspect Risks <span>↗</span>
                  </button>
                </article>
                <article className="mentor-action-card mentor-progress">
                  <div className="mentor-action-icon">◷</div>
                  <span className="mentor-card-label">04 / DEFENSE & REPORTS</span>
                  <h3>Project Documentation</h3>
                  <p>Generate IEEE-formatted project synopsis and methodology documentation.</p>
                  <button onClick={() => setCurrentPage("documentation")}>
                    Open Doc Hub <span>↗</span>
                  </button>
                </article>
              </div>
            </section>
          )}

          {/* --------------------------------------------------
            DASHBOARD
        -------------------------------------------------- */}
          {currentPage === "faculty" && (() => {
            const plan = timelineData || DEFAULT_TIMELINE;
            const weeks = Array.isArray(plan.weekly_plan) ? plan.weekly_plan : [];
            const tasks = weeks.flatMap((week, wi) => (week.tasks || []).map((task, ti) => ({ id: `w${week.week ?? wi + 1}-t${ti}`, week: week.week ?? wi + 1, milestone: week.milestone || `Week ${week.week ?? wi + 1}`, task })));
            const checkedDone = tasks.filter(task => milestone4Completed[task.id]).length;
            const checkedPercent = tasks.length ? Math.round(checkedDone / tasks.length * 100) : 0;
            // Live student's progress = best of checklist and Progress Tracker; 100% means every task is Completed
            const myPercent = Math.max(checkedPercent, trackerPercent);
            const myAllDone = myPercent >= 100 && tasks.length > 0;
            const myDone = myAllDone ? tasks.length : Math.max(checkedDone, Math.round(myPercent / 100 * tasks.length));
            const myDoneIds = new Set(tasks.filter(t => milestone4Completed[t.id]).map(t => t.id));
            if (!myAllDone) { tasks.forEach(t => { if (myDoneIds.size < myDone && !myDoneIds.has(t.id)) myDoneIds.add(t.id); }); }
            // Cohort roster: first row is the live student (real data from this app); the rest is sample roster data for the faculty view.
            const roster = [
              { name: formData.name || auth?.name || "Student", project: projectData.title || plan.project_title || "AI Project Mentor", percent: myPercent, updated: "Today", blocker: "", live: true },
              { name: "Ananya Reddy", project: "Smart Attendance System", percent: 78, updated: "Yesterday", blocker: "", nextTask: "Complete the face-recognition module testing" },
              { name: "Karthik Varma", project: "Crop Disease Detector", percent: 52, updated: "2 days ago", blocker: "Dataset labelling is taking longer than planned.", nextTask: "Finish labelling and start model training" },
              { name: "Sneha Patel", project: "Campus Chatbot", percent: 91, updated: "Today", blocker: "", nextTask: "Prepare final demo and documentation" },
              { name: "Rohit Sharma", project: "Expense Tracker App", percent: 24, updated: "5 days ago", blocker: "API integration pending, no update this week.", nextTask: "Integrate the expense API with the frontend" },
              { name: "Meghana Rao", project: "Library Management Portal", percent: 100, updated: "3 days ago", blocker: "" }
            ].map((st, idx) => {
              const doneCount = st.live ? myDone : Math.round(st.percent / 100 * tasks.length);
              const doneIds = st.live ? null : new Set(tasks.slice(0, doneCount).map(t => t.id));
              const isDone = (t) => st.live ? (myAllDone || myDoneIds.has(t.id)) : doneIds.has(t.id);
              const next = tasks.find(t => !isDone(t));
              const health = st.percent >= 100 ? "Completed" : st.percent >= 60 ? "On Track" : st.percent >= 30 ? "Needs Attention" : "Behind";
              const cls = health === "Completed" ? "done" : health === "On Track" ? "ok" : health === "Needs Attention" ? "warn" : "bad";
              const summary = `${st.name} has completed ${doneCount} of ${tasks.length} planned tasks (${st.percent}%) on “${st.project}”. Status: ${health}. ` + (st.live ? (next ? `Next focus: Week ${next.week} — ${next.task}. ` : "All planned tasks are complete. ") : (st.nextTask ? `Next focus: ${st.nextTask}. ` : "All planned tasks are complete. ")) + (st.blocker ? `Reported blocker: ${st.blocker}` : "No blockers reported.");
              return { ...st, id: idx, doneCount, isDone, next, health, cls, summary };
            });
            const avg = Math.round(roster.reduce((a, r) => a + r.percent, 0) / roster.length);
            const onTrack = roster.filter(r => r.health === "On Track" || r.health === "Completed").length;
            const attention = roster.filter(r => r.health === "Needs Attention" || r.health === "Behind").length;
            return <section className="m4-workspace">
              <div className="m4-hero faculty-hero"><div><span className="m4-kicker">FACULTY MONITORING · MILESTONE 4</span><h2>Project health <em>at a glance.</em></h2><p>Monitor student progress, project health indicators and auto-generated mentor summaries in one place.</p></div><div className="m4-ring" style={{ "--progress": `${avg}%` }}><div><strong>{avg}%</strong><span>AVG PROGRESS</span></div></div></div>
              <div className="m4-metrics"><article><span>Students monitored</span><strong>{roster.length}</strong><small>Active project teams</small></article><article><span>On track</span><strong>{onTrack}</strong><small>Healthy or completed projects</small></article><article><span>Needs attention</span><strong>{attention}</strong><small>Behind or at risk</small></article><article><span>Average progress</span><strong>{avg}%</strong><small>Across all students</small></article></div>
              <div className="m4-section-head"><div><span>01 · PROJECT HEALTH</span><h3>Health indicators</h3></div><span className="m4-status">{roster.length} students</span></div>
              <div className="m4-table-wrap"><table className="m4-table"><thead><tr><th>Student</th><th>Project</th><th>Progress</th><th>Tasks</th><th>Last update</th><th>Health</th></tr></thead><tbody>{roster.map(r => <tr key={r.id}><td>{r.name}</td><td>{r.project}</td><td><div className="fac-bar"><i style={{ width: `${r.percent}%` }} /></div><small>{r.percent}%</small></td><td>{r.doneCount}/{tasks.length}</td><td>{r.updated}</td><td><span className={`fac-pill ${r.cls}`}>{r.health}</span></td></tr>)}</tbody></table></div>
              <div className="m4-section-head"><div><span>02 · AUTO-GENERATED INSIGHT</span><h3>Mentor summaries</h3></div></div>
              <div className="fac-summaries">{roster.map(r => <article className={`fac-summary ${r.cls}`} key={r.id}><div className="fac-summary-head"><strong>{r.name}</strong><span className={`fac-pill ${r.cls}`}>{r.health}</span></div><p>{r.summary}</p><small>Generated automatically from saved progress data.</small></article>)}</div>
              <div className="m4-section-head"><div><span>03 · ANALYTICS</span><h3>Progress graphs</h3></div><span className="m4-status">Live overview</span></div>
              <div className="fac-charts">
                <article className="fac-chart-card"><h4>Progress by student</h4>
                  <div className="fac-hbars">{roster.map(r => <div className="fac-hbar-row" key={r.id}><span className="fac-hbar-name">{r.name}</span><div className="fac-hbar-track"><i className={r.cls} style={{ width: `${r.percent}%` }} /></div><b>{r.percent}%</b></div>)}</div>
                </article>
                <article className="fac-chart-card"><h4>Health distribution</h4>
                  {(() => {
                    const c = { done: 0, ok: 0, warn: 0, bad: 0 }; roster.forEach(r => { c[r.cls]++; }); const n = roster.length || 1; const a = c.done / n * 100, b = a + c.ok / n * 100, d = b + c.warn / n * 100;
                    return <div className="fac-donut-wrap"><div className="fac-donut" style={{ background: `conic-gradient(#3b82f6 0 ${a}%, #16a34a ${a}% ${b}%, #f59e0b ${b}% ${d}%, #ef4444 ${d}% 100%)` }}><div><strong>{roster.length}</strong><span>students</span></div></div>
                      <ul className="fac-legend"><li><i style={{ background: "#3b82f6" }} />Completed <b>{c.done}</b></li><li><i style={{ background: "#16a34a" }} />On Track <b>{c.ok}</b></li><li><i style={{ background: "#f59e0b" }} />Needs Attention <b>{c.warn}</b></li><li><i style={{ background: "#ef4444" }} />Behind <b>{c.bad}</b></li></ul></div>;
                  })()}
                </article>
                <article className="fac-chart-card"><h4>Tasks completed vs remaining</h4>
                  <div className="fac-stack-list">{roster.map(r => <div className="fac-stack-row" key={r.id}><span>{r.name}</span><div className="fac-stack"><i className="d" style={{ width: `${tasks.length ? r.doneCount / tasks.length * 100 : 0}%` }} /><i className="p" style={{ width: `${tasks.length ? (tasks.length - r.doneCount) / tasks.length * 100 : 0}%` }} /></div><b>{r.doneCount}/{tasks.length}</b></div>)}</div>
                  <div className="fac-stack-key"><span><i className="d" />Completed</span><span><i className="p" />Remaining</span></div>
                </article>
                <article className="fac-chart-card"><h4>Weekly completion · {roster[0].name}</h4>
                  <div className="fac-columns">{weeks.map((w, wi) => { const wn = w.week ?? wi + 1; const wt = tasks.filter(t => t.week === wn); const wd = wt.filter(t => roster[0].isDone(t)).length; const pc = wt.length ? Math.round(wd / wt.length * 100) : 0; return <div className="fac-col" key={wn}><b>{pc}%</b><div className="fac-col-track"><i style={{ height: `${pc}%` }} /></div><span>W{wn}</span></div>; })}</div>
                </article>
              </div>
              <div className="m4-section-head"><div><span>04 · MILESTONE 4 · PROGRESS TRACKING</span><h3>Weekly task checklist · {roster[0].name}</h3></div><span className="m4-status">{roster[0].doneCount} of {tasks.length} complete</span></div>
              {weeks.length ? weeks.map((week, wi) => {
                const wn = week.week ?? wi + 1;
                const weekTasks = tasks.filter(task => task.week === wn);
                const weekDone = weekTasks.filter(task => roster[0].isDone(task)).length;
                return <article className="m4-week" key={wn}><div className="m4-week-head"><div><span>WEEK {wn}</span><h3>{week.milestone || `Week ${wn}`}</h3></div><span>{weekDone}/{weekTasks.length} tasks</span></div>
                  {weekTasks.map(task => { const d = roster[0].isDone(task); return <label className={`m4-task ${d ? "is-done" : ""}`} key={task.id}><input type="checkbox" checked={d} onChange={() => { if (!myAllDone) setMilestone4Completed(previous => { const next = { ...previous, [task.id]: !previous[task.id] }; try { localStorage.setItem("apm_milestone4_completed", JSON.stringify(next)); } catch { } return next; }); }} /><span className="m4-task-check">{d ? "✓" : ""}</span><span>{task.task}</span><small>{d ? "Completed" : "Pending"}</small></label>; })}
                </article>;
              }) : <div className="m4-empty">No timeline tasks found. Generate or load your project roadmap first.</div>}
              <p className="m4-note">Note: task completion is saved in this browser. 100% in the Progress Tracker marks every task Completed.</p>
              <div className="m4-section-head"><div><span>05 · TASK REPORT</span><h3>Task report · {roster[0].name}</h3></div></div>
              {[roster[0]].map(r => <details className="fac-detail" key={r.id} open><summary><span>{r.name}</span><small>{r.doneCount}/{tasks.length} tasks · {r.percent}%</small></summary><div className="m4-table-wrap"><table className="m4-table"><thead><tr><th>Week</th><th>Milestone</th><th>Task</th><th>Status</th></tr></thead><tbody>{tasks.map(task => <tr key={task.id}><td>Week {task.week}</td><td>{task.milestone}</td><td>{task.task}</td><td><span className={r.isDone(task) ? "m4-pill done" : "m4-pill pending"}>{r.isDone(task) ? "Completed" : "Pending"}</span></td></tr>)}</tbody></table></div></details>)}
            </section>;
          })()}

          {currentPage === "dashboard" && (
            <section className="dashboard-page">
              <div className="dashboard-spotlight">
                <div className="spotlight-copy">
                  <span className="spotlight-eyebrow"><i /> YOUR PROJECT COMMAND CENTER</span>
                  <h2>{projectData.title ? `Make ${projectData.title} happen.` : "Your next big idea starts here."}</h2>
                  <p>{projectData.title ? "Your workspace is ready. Keep the momentum going with a focused next step." : "Create your project, map the milestones, and turn a big idea into small wins."}</p>
                  <div className="spotlight-actions">
                    <button className="spotlight-primary" onClick={() => setCurrentPage(projectData.title ? (technologyResult ? "progress" : "technology") : "project")}>{projectData.title ? (technologyResult ? "Update progress" : "Continue project") : "Create a project"} <span>↗</span></button>
                    <button className="spotlight-secondary" onClick={() => setCurrentPage("mentor")}>Meet your AI Mentor</button>
                  </div>
                  <div className="spotlight-meta"><span><i className="meta-dot teal-dot" /> Personal workspace</span><span><i className="meta-dot violet-dot" /> AI-powered guidance</span></div>
                </div>
                <div className="spotlight-progress-card">
                  <div className="spotlight-card-head"><span>PROJECT COMPLETION</span><b>LIVE OVERVIEW</b></div>
                  <div className="spotlight-ring-row">
                    <div className="spotlight-ring" style={{ "--progress": `${savedProgress.length ? (savedProgress[savedProgress.length - 1].progress_percentage || 0) : 0}%` }}><div className="spotlight-ring-center"><strong>{savedProgress.length ? (savedProgress[savedProgress.length - 1].progress_percentage || 0) : 0}<small>%</small></strong><span>completed</span></div></div>
                    <div className="spotlight-ring-details"><strong>{savedProgress.length ? "Momentum is building" : projectData.title ? "Ready for your first update" : "Your journey awaits"}</strong><p>{savedProgress.length ? `${completedTotal} tasks completed so far` : "Your progress graph will grow as you log weekly wins."}</p><div className="ring-legend"><span><i className="legend-teal" /> Completed</span><span><i className="legend-track" /> Remaining</span></div></div>
                  </div>
                  <div className="spotlight-card-foot"><span>Current project</span><strong>{projectData.title || "No project submitted yet"}</strong></div>
                </div>
              </div>
              <div className="stats-grid">
                <article className="stat-card"><div className="stat-icon">▱</div><div><span>Total Projects</span><strong>{projectData.title ? "1" : "0"}</strong><small className="positive">{projectData.title ? "Project submitted" : "No projects yet"}</small></div></article>
                <article className="stat-card"><div className="stat-icon">✓</div><div><span>Completed Tasks</span><strong>{completedTotal} <small>/ {totalTasks}</small></strong><small>{savedProgress.length ? "Progress submitted" : "No tasks completed"}</small><div className="mini-progress"><i style={{ width: `${savedProgress.length ? (savedProgress[savedProgress.length - 1].progress_percentage || 0) : 0}%` }} /></div></div></article>
                <article className="stat-card"><div className="stat-icon">▣</div><div><span>Active Agents</span><strong>{(technologyResult ? 1 : 0) + (savedProgress.length ? 1 : 0)} <small>/ 2</small></strong><small><b className="green-dot" /> {technologyResult ? 1 : 0} recommendation · {savedProgress.length ? 1 : 0} progress</small></div></article>
                <article className="stat-card"><div className="stat-icon">↗</div><div><span>Project Progress</span><strong>{savedProgress.length ? `${savedProgress[savedProgress.length - 1].progress_percentage || 0}%` : "0%"}</strong><small>On track</small><div className="mini-progress"><i style={{ width: `${savedProgress.length ? savedProgress[savedProgress.length - 1].progress_percentage || 0 : 0}%` }} /></div></div></article>
              </div>
              <div className="dashboard-columns">
                <article className="dash-panel progress-overview"><div className="panel-title"><h2>♧ &nbsp; Project Progress Overview</h2><select aria-label="Progress time range" defaultValue="Last 7 Days"><option>Last 7 Days</option><option>Last 30 Days</option><option>This Year</option></select></div>{!projectData.title && !savedProgress.length ? <div className="empty-chart-state"><span className="empty-state-orbit">↗</span><strong>Your progress story starts here</strong><p>Submit your first project and weekly updates to see your progress chart.</p><button className="empty-state-action" onClick={() => setCurrentPage("project")}>Create your first project <span>→</span></button></div> : <><div className="chart-area"><div className="y-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><svg viewBox="0 0 520 180" role="img" aria-label="Project progress line chart" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity=".18" /><stop offset="100%" stopColor="#2563eb" stopOpacity="0" /></linearGradient></defs>{[12, 52, 92, 132, 172].map(y => <line key={y} x1="0" y1={y} x2="520" y2={y} stroke="#e8eef8" strokeWidth="1" />)}{[0, 74, 148, 222, 296, 370, 444, 520].map(x => <line key={x} x1={x} y1="8" x2={x} y2="172" stroke="#edf1f8" strokeWidth="1" />)}<path d="M0 145 L74 115 L148 102 L222 121 L296 95 L370 108 L444 72 L520 45 L520 172 L0 172Z" fill="url(#chartFill)" /><polyline points="0,145 74,115 148,102 222,121 296,95 370,108 444,72 520,45" fill="none" stroke="#2670ed" strokeWidth="2.5" />{[[0, 145], [74, 115], [148, 102], [222, 121], [296, 95], [370, 108], [444, 72], [520, 45]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill="#2670ed" />)}</svg></div><div className="chart-dates"><span>Day 1</span><span>Day 2</span><span>Day 3</span><span>Day 4</span><span>Day 5</span><span>Day 6</span><span>Day 7</span></div></>}</article>
                <article className="dash-panel agents-panel"><div className="panel-title"><h2>♧ &nbsp; AI Agents Status</h2><button onClick={() => setCurrentPage("agents")}>View All →</button></div><div className="agent-grid two-agent-grid"><div className="agent-card"><b className="agent-icon">◇</b><strong>Technology Recommendation Agent</strong><em className={technologyResult ? "status-complete" : "status-pending"}>{techStatus}</em><p>{technologyResult ? "Technology suggestions are ready to review." : "Fill in project details and submit to generate recommendations."}</p><button className="agent-action" onClick={() => setCurrentPage("technology")}>Open Agent →</button></div><span className="agent-arrow">→</span><div className="agent-card"><b className="agent-icon">↗</b><strong>Progress Tracking Agent</strong><em className={savedProgress.length ? "status-complete" : "status-pending"}>{progressLocked ? "Locked" : savedProgress.length ? "Updated" : "Not started"}</em><p>{progressLocked ? "Complete the Technology Recommendation Agent to unlock this agent." : savedProgress.length ? "Your submitted progress is available." : "Submit weekly progress details to calculate project progress."}</p><button className="agent-action" disabled={progressLocked} onClick={openProgressAgent}>{progressLocked ? "🔒 Locked" : "Open Agent →"}</button></div></div></article>
                <article className="dash-panel milestones-panel"><div className="panel-title"><h2>◷ &nbsp; Project Milestones</h2><button onClick={() => setCurrentPage("review")}>View Roadmap →</button></div>{projectData.title ? <div className="milestones"><div className="milestone done"><b>✓</b><strong>Project Idea</strong><small>Project created</small><em>Completed</em></div><div className={`milestone ${technologyResult ? "done" : "active"}`}><b>{technologyResult ? "✓" : "2"}</b><strong>Technology Recommendation</strong><small>{technologyResult ? "Recommendations ready" : "Next step"}</small><em>{technologyResult ? "Completed" : "In Progress"}</em></div><div className={`milestone ${savedProgress.length ? "done" : ""}`}><b>{savedProgress.length ? "✓" : "3"}</b><strong>Progress Tracking</strong><small>{savedProgress.length ? "Weekly update saved" : "Coming up next"}</small><em>{savedProgress.length ? "Updated" : "Upcoming"}</em></div></div> : <div className="empty-panel-state"><span>✦</span><strong>No milestones yet</strong><p>Your roadmap will appear after you create a project.</p><button onClick={() => setCurrentPage("project")}>Start a project →</button></div>}</article>
                <article className="dash-panel activity-panel"><div className="panel-title"><h2>◷ &nbsp; Recent Activity</h2><button onClick={() => alert("Showing recent project activity.")}>View All →</button></div>{projectData.title || savedProgress.length ? <div className="activity-list">{projectData.title && <div><small>Project workspace</small><b className="activity-icon">✓</b><p><strong>{projectData.title}</strong><span>Your project details are saved in this workspace.</span></p></div>}{technologyResult && <div><small>Recommendation</small><b className="activity-icon">✦</b><p><strong>Technology recommendations ready</strong><span>Your suggested technology stack is available.</span></p></div>}{savedProgress.length > 0 && <div><small>Progress update</small><b className="activity-icon">↗</b><p><strong>Weekly progress saved</strong><span>Your latest progress update is available.</span></p></div>}</div> : <div className="empty-panel-state"><span>◷</span><strong>A fresh start</strong><p>Project updates and agent activity will show here as you work.</p><button onClick={() => setCurrentPage("project")}>Add project details →</button></div>}</article>
              </div>
            </section>
          )}

          {/* --------------------------------------------------
            AI MENTOR MODAL
        -------------------------------------------------- */}
          {aiOpen && (
            <div className="ai-modal-overlay">
              <div className="ai-modal">
                <button
                  className="ai-close"
                  onClick={() => setAiOpen(false)}
                  aria-label="Close AI Mentor"
                >
                  ✕
                </button>

                <div className="ai-modal-icon">🤖</div>
                <h2>AI Mentor</h2>
                <p>
                  Hi! I&apos;m your AI Project Mentor. Choose an option below to
                  get guidance for your academic project.
                </p>

                <div className="ai-options">
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "AI Mentor: Start by defining your project problem, target users, and expected outcome."
                      )
                    }
                  >
                    💡 Suggest Project Ideas
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "AI Mentor: Break your project into milestones such as planning, design, development, testing, and deployment."
                      )
                    }
                  >
                    📋 Create Project Plan
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage("project")}
                  >
                    🛠️ Recommend Technologies
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAiOpen(false);
                      openProgressAgent();
                    }}
                  >
                    🎯 Track Project Progress
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
