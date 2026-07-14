"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Activity, 
  Heart, 
  Brain, 
  ShieldAlert, 
  Settings, 
  LogOut, 
  User, 
  Baby, 
  Calendar,
  ChevronDown,
  Bell,
  Scale,
  Ruler,
  AlertTriangle,
  FileDown,
  Sparkles,
  Info,
  Layers,
  Database,
  Camera,
  Play
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type ModuleTab = "overview" | "physical" | "nutrition" | "behavior" | "safety" | "settings";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ModuleTab>("overview");
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [childAgeMonths, setChildAgeMonths] = useState<number>(0);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: "success" | "info" }>({
    show: false,
    msg: "",
    type: "info"
  });

  // Database Connection settings form states (retained for UI config updates)
  const [dbConfig, setDbConfig] = useState({
    dbType: "firebase",
    connectionString: "",
    firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    firebaseStorageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ""
  });

  useEffect(() => {
    if (!auth || !db) {
      // If Firebase SDK is not initialized (e.g. missing configs)
      router.push("/login");
      return;
    }

    // Subscribe to Firebase Authentication state observer
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/login");
        return;
      }

      try {
        // Fetch user data document from Firestore collection
        const docRef = doc(db!, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setSessionUser(userData);

          // Calculate Child's Age in Months
          if (userData.childDob) {
            const dob = new Date(userData.childDob);
            const now = new Date();
            const diffYears = now.getFullYear() - dob.getFullYear();
            const diffMonths = now.getMonth() - dob.getMonth();
            const ageMonths = diffYears * 12 + diffMonths;
            setChildAgeMonths(ageMonths >= 0 ? ageMonths : 0);
          }
        } else {
          console.error("No user profile found in Firestore.");
          router.push("/login");
        }
      } catch (err) {
        console.error("Error reading Firestore profile:", err);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const showToastMessage = (msg: string, type: "success" | "info" = "info") => {
    setToast({ show: true, msg, type });
    setTimeout(() => {
      setToast({ show: false, msg: "", type: "info" });
    }, 3000);
  };

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      router.push("/");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleSaveDbConfig = (e: React.FormEvent) => {
    e.preventDefault();
    showToastMessage("Database Configuration saved! Real connections will run in subsequent phases.", "success");
  };

  if (!sessionUser) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "var(--font-display)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <Activity className="logo-icon animate-spin" style={{ width: "40px", height: "40px" }} />
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Verifying session & loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Toast Notification */}
      {toast.show && (
        <div 
          className="alert-banner" 
          style={{ 
            position: "fixed", 
            top: "20px", 
            right: "20px", 
            zIndex: 999, 
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            background: toast.type === "success" ? "rgba(16, 185, 129, 0.95)" : "rgba(139, 92, 246, 0.95)",
            borderColor: toast.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(139, 92, 246, 0.2)",
            color: "#ffffff",
            backdropFilter: "blur(5px)",
            padding: "0.75rem 1.5rem"
          }}
        >
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? "mobile-open" : ""}`} id="sidebar-container">
        <div className="sidebar-brand" onClick={() => setActiveTab("overview")}>
          <div className="logo-container">
            <Activity className="logo-icon" />
            <span>Child<span className="text-gradient-purple">Vision</span></span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div 
            className={`sidebar-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => { setActiveTab("overview"); setSidebarOpen(false); }}
            id="sidebar-tab-overview"
          >
            <Layers size={18} />
            <span>Overview</span>
          </div>

          <div 
            className={`sidebar-item ${activeTab === "physical" ? "active" : ""}`}
            onClick={() => { setActiveTab("physical"); setSidebarOpen(false); }}
            id="sidebar-tab-physical"
          >
            <Activity size={18} />
            <span>Physical Growth</span>
          </div>

          <div 
            className={`sidebar-item ${activeTab === "nutrition" ? "active" : ""}`}
            onClick={() => { setActiveTab("nutrition"); setSidebarOpen(false); }}
            id="sidebar-tab-nutrition"
          >
            <Heart size={18} />
            <span>Nutritional Health</span>
          </div>

          <div 
            className={`sidebar-item ${activeTab === "behavior" ? "active" : ""}`}
            onClick={() => { setActiveTab("behavior"); setSidebarOpen(false); }}
            id="sidebar-tab-behavior"
          >
            <Brain size={18} />
            <span>Behavior & Cognitive</span>
          </div>

          <div 
            className={`sidebar-item ${activeTab === "safety" ? "active" : ""}`}
            onClick={() => { setActiveTab("safety"); setSidebarOpen(false); }}
            id="sidebar-tab-safety"
          >
            <ShieldAlert size={18} />
            <span>Environment & Safety</span>
          </div>

          <div 
            className={`sidebar-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => { setActiveTab("settings"); setSidebarOpen(false); }}
            id="sidebar-tab-settings"
          >
            <Settings size={18} />
            <span>Settings</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="btn btn-secondary" 
            style={{ width: "100%", justifyContent: "flex-start", padding: "0.5rem 1rem", borderRadius: "8px" }}
            onClick={handleLogout}
            id="sidebar-logout-btn"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="dashboard-main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button 
              className="icon-btn" 
              style={{ display: "none" }} /* Styled/toggled in mobile views */
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <ChevronDown size={18} style={{ transform: sidebarOpen ? "rotate(180deg)" : "none" }} />
            </button>
            <h2 className="view-title" id="view-title">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "physical" && "Module 1: Physical Growth Monitoring"}
              {activeTab === "nutrition" && "Module 2: Nutritional Health Screening"}
              {activeTab === "behavior" && "Module 3: Behavioral & Cognitive Monitoring"}
              {activeTab === "safety" && "Module 4: Environment Interaction & Safety"}
              {activeTab === "settings" && "Portal Settings"}
            </h2>
          </div>

          <div className="topbar-right">
            {/* Child Profile Selector */}
            <div 
              className="child-selector" 
              onClick={() => showToastMessage("Add or edit child profiles will be available in later phases.")}
              id="topbar-child-selector"
            >
              <Baby size={16} style={{ color: "var(--primary)" }} />
              <span>{sessionUser.childName} ({childAgeMonths}m)</span>
              <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
            </div>

            {/* Notification Bell */}
            <button 
              className="icon-btn" 
              onClick={() => showToastMessage("No new notifications.", "info")}
              id="topbar-notif-btn"
            >
              <Bell size={18} />
            </button>

            {/* Avatar / Profile */}
            <div 
              className="profile-trigger" 
              onClick={() => setActiveTab("settings")}
              id="topbar-profile"
            >
              <div className="profile-avatar">
                {sessionUser.parentName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="dashboard-content">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }} id="view-content-overview">
              
              {/* Welcome Banner */}
              <div className="welcome-banner glass-panel">
                <div className="welcome-text">
                  <h3 className="welcome-title">Welcome back, {sessionUser.parentName}!</h3>
                  <p className="welcome-desc">
                    Here is the daily development snapshot for your toddler, <strong>{sessionUser.childName}</strong>. Ready to set up monitoring.
                  </p>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => showToastMessage("PDF reports will compile visual charts once scanning features are active.", "info")}
                  id="dashboard-pdf-export"
                >
                  <FileDown size={16} /> Export PDF Report
                </button>
              </div>

              {/* Grid Layout */}
              <div className="overview-grid">
                {/* Left Side: Summary Metrics */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div className="metrics-row">
                    
                    {/* Height Metric */}
                    <div className="metric-panel glass-panel" id="overview-metric-height">
                      <div className="metric-header">
                        <span>Toddler Height</span>
                        <Ruler size={16} />
                      </div>
                      <div className="metric-value">-- <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>cm</span></div>
                      <div className="metric-trend text-dim">
                        <Info size={12} /> Pending first scan
                      </div>
                    </div>

                    {/* Weight Metric */}
                    <div className="metric-panel glass-panel" id="overview-metric-weight">
                      <div className="metric-header">
                        <span>Toddler Weight</span>
                        <Scale size={16} />
                      </div>
                      <div className="metric-value">-- <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>kg</span></div>
                      <div className="metric-trend text-dim">
                        <Info size={12} /> Pending first scan
                      </div>
                    </div>

                    {/* Safety Status */}
                    <div className="metric-panel glass-panel" id="overview-metric-safety">
                      <div className="metric-header">
                        <span>Safety Alerts</span>
                        <ShieldAlert size={16} />
                      </div>
                      <div className="metric-value" style={{ color: "var(--success)" }}>Safe</div>
                      <div className="metric-trend text-dim">
                        <Info size={12} /> 0 Active safety violations
                      </div>
                    </div>

                  </div>

                  {/* Modules Checklist / Skeletons */}
                  <div className="skeleton-modules-container">
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.5rem" }}>Core Monitoring Modules</h3>
                    
                    {/* Module 1 Physical */}
                    <div className="skeleton-module-row glass-panel" onClick={() => setActiveTab("physical")}>
                      <div className="skeleton-module-left">
                        <div className="module-badge badge-purple">Module 1</div>
                        <div className="skeleton-module-details">
                          <span className="skeleton-module-title">Physical Growth Monitoring</span>
                          <span className="skeleton-module-subtitle">Height & Weight estimation, WHO Z-Score tracking</span>
                        </div>
                      </div>
                      <span className="skeleton-module-status">Skeleton Connected</span>
                    </div>

                    {/* Module 2 Nutrition */}
                    <div className="skeleton-module-row glass-panel" onClick={() => setActiveTab("nutrition")}>
                      <div className="skeleton-module-left">
                        <div className="module-badge badge-cyan">Module 2</div>
                        <div className="skeleton-module-details">
                          <span className="skeleton-module-title">Nutritional Health Screening</span>
                          <span className="skeleton-module-subtitle">Anaemia conjunctiva pallor, MUAC estimation, meal logging</span>
                        </div>
                      </div>
                      <span className="skeleton-module-status">Skeleton Connected</span>
                    </div>

                    {/* Module 3 Behavior */}
                    <div className="skeleton-module-row glass-panel" onClick={() => setActiveTab("behavior")}>
                      <div className="skeleton-module-left">
                        <div className="module-badge badge-rose">Module 3</div>
                        <div className="skeleton-module-details">
                          <span className="skeleton-module-title">Behavioral & Cognitive Milestones</span>
                          <span className="skeleton-module-subtitle">Motor milestones, Gaze tracking, Sound-response</span>
                        </div>
                      </div>
                      <span className="skeleton-module-status">Skeleton Connected</span>
                    </div>

                    {/* Module 4 Safety */}
                    <div className="skeleton-module-row glass-panel" onClick={() => setActiveTab("safety")}>
                      <div className="skeleton-module-left">
                        <div className="module-badge badge-emerald">Module 4</div>
                        <div className="skeleton-module-details">
                          <span className="skeleton-module-title">Environment Interaction & Safety</span>
                          <span className="skeleton-module-subtitle">Danger boundary zones, screen time, fall detection</span>
                        </div>
                      </div>
                      <span className="skeleton-module-status">Skeleton Connected</span>
                    </div>

                  </div>
                </div>

                {/* Right Side: Circular Wellness Score */}
                <div className="score-panel glass-panel" id="overview-wellness-score">
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Wellness Score</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Composite score across all modules</p>
                  
                  <div className="circular-chart">
                    <svg viewBox="0 0 36 36">
                      <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#c084fc" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                      <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="circle-fill" style={{ strokeDasharray: "0, 100" }} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="score-text">
                      <span>--</span>
                      <span className="score-label-sub">Pending</span>
                    </div>
                  </div>

                  <div className="score-meta">
                    <span className="score-status-text" style={{ color: "var(--text-dim)" }}>Scans Required</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Please upload toddler media in the modules to calculate health scoring.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MODULE 1 PHYSICAL */}
          {activeTab === "physical" && (
            <div className="glass-panel" style={{ borderRadius: "18px", padding: "2rem" }} id="view-content-physical">
              <div className="module-empty-state">
                <div className="empty-state-icon-box">
                  <Activity size={36} />
                </div>
                <h3 className="empty-state-title">Physical Growth Monitoring</h3>
                <p className="empty-state-description">
                  Once active, this module allows parents to upload standing photos/videos of their child. The system extracts body skeleton keypoints (crown to ankle) and maps relative depth through monocular depth estimations to approximate Height, Weight, and Head-to-Body ratios.
                </p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "450px", textAlign: "left", background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>Expected Features:</div>
                  <div style={{ fontSize: "0.9rem" }}>• Camera-based Height estimation with 30cm reference object calibration</div>
                  <div style={{ fontSize: "0.9rem" }}>• Body Volume Approximation for Weight calculation</div>
                  <div style={{ fontSize: "0.9rem" }}>• WHO Growth Chart Comparison (Z-score statistics)</div>
                  <div style={{ fontSize: "0.9rem" }}>• ResNet-50 Malnutrition (Stunted / Wasted / SAM) CNN classification</div>
                </div>

                <div className="tech-pill-container">
                  <span className="tech-pill">MediaPipe Pose (33 Landmarks)</span>
                  <span className="tech-pill">Intel MiDaS Depth</span>
                  <span className="tech-pill">ResNet-50 Classifier</span>
                  <span className="tech-pill">WHO Z-score standard tables</span>
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={() => showToastMessage("Module 1 Camera setup will be implemented in subsequent phases.", "info")}
                  style={{ marginTop: "1rem" }}
                >
                  <Camera size={16} /> Configure Camera Scan
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MODULE 2 NUTRITION */}
          {activeTab === "nutrition" && (
            <div className="glass-panel" style={{ borderRadius: "18px", padding: "2rem" }} id="view-content-nutrition">
              <div className="module-empty-state">
                <div className="empty-state-icon-box">
                  <Heart size={36} />
                </div>
                <h3 className="empty-state-title">Nutritional Health Screening</h3>
                <p className="empty-state-description">
                  Once active, this module processes close-up facial features and arm segments to spot micro-nutritional deficiencies and acute malnutrition (using Mid-Upper Arm Circumference) without blood tests.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "450px", textAlign: "left", background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>Expected Features:</div>
                  <div style={{ fontSize: "0.9rem" }}>• Lower eyelid conjunctiva segmentation & LAB color space pallor analysis (Anaemia)</div>
                  <div style={{ fontSize: "0.9rem" }}>• Eyelid and cheek swelling indicators for Kwashiorkor Oedema</div>
                  <div style={{ fontSize: "0.9rem" }}>• Dual-angle MUAC arm segmentation with A4 calibration reference</div>
                  <div style={{ fontSize: "0.9rem" }}>• Food photo recognition + USDA Food API nutritional cross-referencing</div>
                </div>

                <div className="tech-pill-container">
                  <span className="tech-pill">MediaPipe Face Mesh (468 landmarks)</span>
                  <span className="tech-pill">Mask R-CNN Segmentation</span>
                  <span className="tech-pill">Food-101 Classifier</span>
                  <span className="tech-pill">USDA API</span>
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={() => showToastMessage("Module 2 meal recognition will be implemented in subsequent phases.", "info")}
                  style={{ marginTop: "1rem" }}
                >
                  <Play size={16} /> Log Toddler's Meal
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MODULE 3 BEHAVIOR */}
          {activeTab === "behavior" && (
            <div className="glass-panel" style={{ borderRadius: "18px", padding: "2rem" }} id="view-content-behavior">
              <div className="module-empty-state">
                <div className="empty-state-icon-box">
                  <Brain size={36} />
                </div>
                <h3 className="empty-state-title">Behavioral & Cognitive Milestones</h3>
                <p className="empty-state-description">
                  Our most differentiating module utilizes temporal video pipelines and audio markers to cross-reference motor coordination, attention, and sensory response rates with typical child milestones.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "450px", textAlign: "left", background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>Expected Features:</div>
                  <div style={{ fontSize: "0.9rem" }}>• Motor milestones (crawling, walking, running) via skeleton time-series</div>
                  <div style={{ fontSize: "0.9rem" }}>• Gaze orientation & iris tracking for social eye contact (ASD screening flags)</div>
                  <div style={{ fontSize: "0.9rem" }}>• Sound-response latency tracking (head yaw/pitch tracking after stimulus)</div>
                  <div style={{ fontSize: "0.9rem" }}>• Whisper language checks (babble/first words detection)</div>
                  <div style={{ fontSize: "0.9rem" }}>• Play classification (Solitary, Parallel, Interactive) via VideoMAE</div>
                  <div style={{ fontSize: "0.9rem" }}>• Emotion Regulation curves (facial expression analysis over time)</div>
                </div>

                <div className="tech-pill-container">
                  <span className="tech-pill">ViTPose Skeleton</span>
                  <span className="tech-pill">YOLOv8-pose Multi-person</span>
                  <span className="tech-pill">SlowFast / VideoMAE</span>
                  <span className="tech-pill">OpenAI Whisper</span>
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={() => showToastMessage("Module 3 milestone assessment will be implemented in subsequent phases.", "info")}
                  style={{ marginTop: "1rem" }}
                >
                  <Play size={16} /> Start Milestone Assessment
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: MODULE 4 SAFETY */}
          {activeTab === "safety" && (
            <div className="glass-panel" style={{ borderRadius: "18px", padding: "2rem" }} id="view-content-safety">
              <div className="module-empty-state">
                <div className="empty-state-icon-box">
                  <ShieldAlert size={36} style={{ color: "var(--danger)" }} />
                </div>
                <h3 className="empty-state-title">Environment Interaction & Safety</h3>
                <p className="empty-state-description">
                  Once active, this module operates as a continuous home security layer. By setting room parameters, the system alerts parents to dynamic hazards or safety violations.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "450px", textAlign: "left", background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>Expected Features:</div>
                  <div style={{ fontSize: "0.9rem" }}>• Polygon danger zone definition and child intersection tracking (e.g., stairs)</div>
                  <div style={{ fontSize: "0.9rem" }}>• Object interaction timers and cognitive stimulation scoring</div>
                  <div style={{ fontSize: "0.9rem" }}>• Hand-to-mouth keypoint proximity to prevent choking hazards</div>
                  <div style={{ fontSize: "0.9rem" }}>• Fall detection and night-mode prone sleep alerts</div>
                  <div style={{ fontSize: "0.9rem" }}>• Screen time counter (screen presence fused with face direction vectors)</div>
                </div>

                <div className="tech-pill-container">
                  <span className="tech-pill">YOLOv8-GELAN detector</span>
                  <span className="tech-pill">OpenCV polygon operations</span>
                  <span className="tech-pill">MediaPipe Face Mesh</span>
                  <span className="tech-pill">Firebase Cloud Messaging</span>
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={() => showToastMessage("Module 4 boundary configurations will be implemented in subsequent phases.", "info")}
                  style={{ marginTop: "1rem" }}
                >
                  <Settings size={16} /> Set Room Safety Zones
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS (Includes Database Integration) */}
          {activeTab === "settings" && (
            <div className="settings-container" id="view-content-settings">
              
              {/* Profile Config */}
              <div className="settings-card glass-panel">
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Parent & Toddler Profile</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                  Review details registered during account creation.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Parent Name</label>
                    <input type="text" className="form-input" value={sessionUser.parentName} disabled />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" value={sessionUser.email} disabled />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Toddler Name</label>
                    <input type="text" className="form-input" value={sessionUser.childName} disabled />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Toddler Birthdate</label>
                    <input type="date" className="form-input" value={sessionUser.childDob} disabled />
                  </div>
                </div>
              </div>

              {/* Database Settings (For End Product Deployments) */}
              <div className="settings-card glass-panel" id="settings-db-card">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Database size={20} style={{ color: "var(--primary)" }} />
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Database Connection Settings</h3>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                  Your database is configured using Firebase environment variables. Real connections for longitudinal metrics are active.
                </p>

                <form onSubmit={handleSaveDbConfig} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div className="form-group">
                    <label className="form-label">Database Mode</label>
                    <select 
                      className="form-input"
                      value={dbConfig.dbType}
                      disabled
                      style={{ height: "45px", background: "rgba(255, 255, 255, 0.02)" }}
                    >
                      <option value="firebase" style={{ background: "#0f111c" }}>Firebase Cloud Store / Auth (Active)</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div className="form-group">
                      <label className="form-label">Firebase Web API Key</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={dbConfig.firebaseApiKey}
                        disabled
                        placeholder="Configured in env" 
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div className="form-group">
                        <label className="form-label">Firebase Project ID</label>
                        <input 
                          type="text" 
                          className="form-input"
                          value={dbConfig.firebaseProjectId}
                          disabled
                          placeholder="Configured in env" 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Storage Bucket</label>
                        <input 
                          type="text" 
                          className="form-input"
                          value={dbConfig.firebaseStorageBucket}
                          disabled
                          placeholder="Configured in env" 
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
