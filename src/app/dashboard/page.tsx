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
  Play,
  Trash2,
  Plus,
  HelpCircle,
  Check,
  AlertCircle,
  Loader2
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { 
  calculateGrowthMetrics, 
  saveGrowthRecord, 
  fetchGrowthRecords, 
  deleteGrowthRecord, 
  GrowthRecord 
} from "@/lib/growth";
import { getWhoReferenceCurve, CurvePoint } from "@/lib/whoCurves";
import GrowthChart from "./GrowthChart";

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

  // Growth Monitoring States
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [submittingRecord, setSubmittingRecord] = useState(false);
  const [whoReferenceCurves, setWhoReferenceCurves] = useState<{
    hfa: CurvePoint[];
    wfa: CurvePoint[];
    bfa: CurvePoint[];
  }>({ hfa: [], wfa: [], bfa: [] });

  const [activeChartTab, setActiveChartTab] = useState<"hfa" | "wfa" | "bfa">("hfa");
  const [accordionOpen, setAccordionOpen] = useState<"height" | "weight" | null>(null);

  const [measurementForm, setMeasurementForm] = useState({
    date: new Date().toISOString().split("T")[0],
    height: "",
    weight: "",
    headCircumference: "",
  });

  const handleAddMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionUser) return;
    
    const heightVal = parseFloat(measurementForm.height);
    const weightVal = parseFloat(measurementForm.weight);
    const headCircVal = measurementForm.headCircumference ? parseFloat(measurementForm.headCircumference) : undefined;
    
    if (isNaN(heightVal) || isNaN(weightVal) || heightVal <= 0 || weightVal <= 0) {
      showToastMessage("Please enter valid height and weight values.", "info");
      return;
    }
    
    setSubmittingRecord(true);
    try {
      const gender = sessionUser.childGender === "female" ? "female" : "male";
      const dob = new Date(sessionUser.childDob);
      const measurementDate = new Date(measurementForm.date);
      
      const metrics = await calculateGrowthMetrics(
        gender,
        dob,
        measurementDate,
        weightVal,
        heightVal,
        headCircVal
      );
      
      const newRecord: Omit<GrowthRecord, "id"> = {
        dateOfMeasurement: measurementDate.toISOString(),
        ageInDays: metrics.ageInDays,
        ageInMonths: metrics.ageInMonths,
        weight: weightVal,
        height: heightVal,
        headCircumference: headCircVal,
        bmi: metrics.bmi,
        zScores: {
          wfa: metrics.wfa.zScore,
          hfa: metrics.hfa.zScore,
          bfa: metrics.bfa.zScore,
        },
        percentiles: {
          wfa: metrics.wfa.percentile,
          hfa: metrics.hfa.percentile,
          bfa: metrics.bfa.percentile,
        },
        classifications: {
          wfa: { label: metrics.wfa.label, severity: metrics.wfa.severity },
          hfa: { label: metrics.hfa.label, severity: metrics.hfa.severity },
          bfa: { label: metrics.bfa.label, severity: metrics.bfa.severity },
        }
      };
      
      const firebaseUser = auth?.currentUser;
      if (firebaseUser) {
        await saveGrowthRecord(firebaseUser.uid, newRecord);
        showToastMessage("Growth measurement saved successfully!", "success");
        
        // Refresh records
        const records = await fetchGrowthRecords(firebaseUser.uid);
        setGrowthRecords(records);
        
        // Reset form
        setMeasurementForm({
          date: new Date().toISOString().split("T")[0],
          height: "",
          weight: "",
          headCircumference: "",
        });
      }
    } catch (err) {
      console.error("Error saving growth record:", err);
      showToastMessage("Failed to save growth record. Please try again.", "info");
    } finally {
      setSubmittingRecord(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!sessionUser) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this growth measurement?");
    if (!confirmDelete) return;
    
    try {
      const firebaseUser = auth?.currentUser;
      if (firebaseUser) {
        await deleteGrowthRecord(firebaseUser.uid, recordId);
        showToastMessage("Growth measurement deleted.", "success");
        // Refresh records
        const records = await fetchGrowthRecords(firebaseUser.uid);
        setGrowthRecords(records);
      }
    } catch (err) {
      console.error("Error deleting growth record:", err);
      showToastMessage("Failed to delete growth record.", "info");
    }
  };

  const toggleAccordion = (section: "height" | "weight") => {
    setAccordionOpen(accordionOpen === section ? null : section);
  };

  const getClassificationDisplay = (record: GrowthRecord | null, indicator: "hfa" | "wfa" | "bfa") => {
    if (!record) return { label: "No logs recorded", color: "var(--text-dim)", bg: "rgba(255,255,255,0.02)" };
    
    const info = record.classifications[indicator];
    let color = "var(--text-main)";
    let bg = "rgba(255,255,255,0.03)";
    
    if (info.severity === "adequate" || info.label.toLowerCase().includes("normal") || info.label.toLowerCase().includes("adequate") || info.label.toLowerCase().includes("eutroph")) {
      color = "var(--success)";
      bg = "rgba(16, 185, 129, 0.1)";
    } else if (info.severity === "low" || info.severity === "high" || info.label.toLowerCase().includes("overweight") || info.label.toLowerCase().includes("tall") || info.label.toLowerCase().includes("underweight") || info.label.toLowerCase().includes("stunted") || info.label.toLowerCase().includes("wasted")) {
      color = "var(--warning)";
      bg = "rgba(245, 158, 11, 0.1)";
    } else if (info.severity === "very-low" || info.severity === "very-high" || info.severity === "risk" || info.label.toLowerCase().includes("severe") || info.label.toLowerCase().includes("obes")) {
      color = "var(--danger)";
      bg = "rgba(239, 68, 68, 0.1)";
    }
    
    return { label: info.label, color, bg };
  };

  // Sort and fetch latest record
  const sortedRecords = [...growthRecords].sort((a, b) => new Date(b.dateOfMeasurement).getTime() - new Date(a.dateOfMeasurement).getTime());
  const latestRecord = sortedRecords[0] || null;

  // Calculate Wellness Score
  let wellnessScore: number | null = null;
  let wellnessLabel = "Pending first scan";
  let wellnessColor = "var(--text-dim)";

  if (latestRecord) {
    let score = 100;
    // Check WFA
    if (Math.abs(latestRecord.zScores.wfa) > 2) {
      score -= 20;
    }
    // Check HFA
    if (Math.abs(latestRecord.zScores.hfa) > 2) {
      score -= 20;
    }
    // Check BFA
    if (Math.abs(latestRecord.zScores.bfa) > 2) {
      score -= 20;
    }
    wellnessScore = Math.max(10, score);
    if (wellnessScore >= 85) {
      wellnessLabel = "Healthy Growth";
      wellnessColor = "var(--success)";
    } else if (wellnessScore >= 60) {
      wellnessLabel = "Monitor Trends";
      wellnessColor = "var(--warning)";
    } else {
      wellnessLabel = "Growth Warning";
      wellnessColor = "var(--danger)";
    }
  }

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

          // Fetch Growth Records
          setLoadingRecords(true);
          const records = await fetchGrowthRecords(firebaseUser.uid);
          setGrowthRecords(records);
          setLoadingRecords(false);

          // Load reference curves
          const gender = userData.childGender === "female" ? "female" : "male";
          const hfaCurve = await getWhoReferenceCurve("length-height-for-age", gender);
          const wfaCurve = await getWhoReferenceCurve("weight-for-age", gender);
          const bfaCurve = await getWhoReferenceCurve("bmi-for-age", gender);
          setWhoReferenceCurves({ hfa: hfaCurve, wfa: wfaCurve, bfa: bfaCurve });

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
                      <div className="metric-value">
                        {latestRecord ? latestRecord.height.toFixed(1) : "--"}{" "}
                        <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>cm</span>
                      </div>
                      <div className="metric-trend text-dim" style={{ color: latestRecord ? "var(--text-muted)" : "var(--text-dim)" }}>
                        <Info size={12} /> {latestRecord ? `Percentile: ${Math.round(latestRecord.percentiles.hfa)}th (Z: ${latestRecord.zScores.hfa.toFixed(1)})` : "Pending first scan"}
                      </div>
                    </div>

                    {/* Weight Metric */}
                    <div className="metric-panel glass-panel" id="overview-metric-weight">
                      <div className="metric-header">
                        <span>Toddler Weight</span>
                        <Scale size={16} />
                      </div>
                      <div className="metric-value">
                        {latestRecord ? latestRecord.weight.toFixed(1) : "--"}{" "}
                        <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>kg</span>
                      </div>
                      <div className="metric-trend text-dim" style={{ color: latestRecord ? "var(--text-muted)" : "var(--text-dim)" }}>
                        <Info size={12} /> {latestRecord ? `Percentile: ${Math.round(latestRecord.percentiles.wfa)}th (Z: ${latestRecord.zScores.wfa.toFixed(1)})` : "Pending first scan"}
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
                      <path 
                        className="circle-fill" 
                        style={{ strokeDasharray: latestRecord && wellnessScore ? `${wellnessScore}, 100` : "0, 100" }} 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      />
                    </svg>
                    <div className="score-text">
                      <span>{latestRecord && wellnessScore ? wellnessScore : "--"}</span>
                      <span className="score-label-sub">{latestRecord ? "Calculated" : "Pending"}</span>
                    </div>
                  </div>

                  <div className="score-meta">
                    <span className="score-status-text" style={{ color: wellnessColor }}>{wellnessLabel}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {latestRecord 
                        ? `Computed based on height, weight, and BMI Z-score deviations.`
                        : `Please log growth measurements in the Physical tab to calculate scoring.`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MODULE 1 PHYSICAL */}
          {activeTab === "physical" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }} id="view-content-physical">
              
              {/* Dynamic Status Badges (Stunting, Wasting, Underweight Indices) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                {/* Height-for-Age (Stunting Index) */}
                {(() => {
                  const status = getClassificationDisplay(latestRecord, "hfa");
                  return (
                    <div className="metric-panel glass-panel" style={{ borderLeft: `4px solid ${status.color}`, padding: "1.25rem" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Stunting Index (Height-for-Age)</span>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem" }}>
                        <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: status.color }}>{status.label}</span>
                        {latestRecord ? (
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Z: {latestRecord.zScores.hfa.toFixed(2)}</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })()}

                {/* Weight-for-Age (Underweight Index) */}
                {(() => {
                  const status = getClassificationDisplay(latestRecord, "wfa");
                  return (
                    <div className="metric-panel glass-panel" style={{ borderLeft: `4px solid ${status.color}`, padding: "1.25rem" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Underweight Index (Weight-for-Age)</span>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem" }}>
                        <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: status.color }}>{status.label}</span>
                        {latestRecord ? (
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Z: {latestRecord.zScores.wfa.toFixed(2)}</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })()}

                {/* BMI-for-Age (Wasting / Weight-for-Height Index) */}
                {(() => {
                  const status = getClassificationDisplay(latestRecord, "bfa");
                  return (
                    <div className="metric-panel glass-panel" style={{ borderLeft: `4px solid ${status.color}`, padding: "1.25rem" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Wasting Index (BMI-for-Age)</span>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem" }}>
                        <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: status.color }}>{status.label}</span>
                        {latestRecord ? (
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Z: {latestRecord.zScores.bfa.toFixed(2)}</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Two Column Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
                
                {/* Left Column: Growth Curves & Plotting */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div className="glass-panel" style={{ borderRadius: "16px", padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
                      <h3 style={{ fontSize: "1.15rem", fontWeight: "700" }}>WHO Percentile Growth Curves</h3>
                      
                      {/* Sub-navigation tabs */}
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button 
                          className={`btn ${activeChartTab === "hfa" ? "btn-primary" : "btn-secondary"}`}
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", borderRadius: "8px" }}
                          onClick={() => setActiveChartTab("hfa")}
                        >
                          Height-for-Age
                        </button>
                        <button 
                          className={`btn ${activeChartTab === "wfa" ? "btn-primary" : "btn-secondary"}`}
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", borderRadius: "8px" }}
                          onClick={() => setActiveChartTab("wfa")}
                        >
                          Weight-for-Age
                        </button>
                        <button 
                          className={`btn ${activeChartTab === "bfa" ? "btn-primary" : "btn-secondary"}`}
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", borderRadius: "8px" }}
                          onClick={() => setActiveChartTab("bfa")}
                        >
                          BMI-for-Age
                        </button>
                      </div>
                    </div>

                    {whoReferenceCurves[activeChartTab] && whoReferenceCurves[activeChartTab].length > 0 ? (
                      <GrowthChart 
                        records={growthRecords}
                        curve={whoReferenceCurves[activeChartTab]}
                        indicator={activeChartTab}
                        sex={sessionUser.childGender === "female" ? "female" : "male"}
                      />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", color: "var(--text-muted)" }}>
                        <Loader2 className="animate-spin" size={24} style={{ marginRight: "0.5rem" }} />
                        Loading WHO reference charts...
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Log Input Form & Guidelines */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  
                  {/* Input Form Card */}
                  <div className="glass-panel" style={{ borderRadius: "16px", padding: "1.5rem" }} id="growth-log-form">
                    <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Calendar size={18} style={{ color: "var(--primary)" }} />
                      Log Measurement
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                      Record your toddler's height and weight.
                    </p>

                    <form onSubmit={handleAddMeasurement} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div className="form-group">
                        <label className="form-label">Measurement Date</label>
                        <input 
                          type="date" 
                          className="form-input" 
                          value={measurementForm.date}
                          onChange={(e) => setMeasurementForm({...measurementForm, date: e.target.value})}
                          max={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Height / Length (cm)</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          min="30"
                          max="150"
                          className="form-input" 
                          placeholder="e.g. 75.4"
                          value={measurementForm.height}
                          onChange={(e) => setMeasurementForm({...measurementForm, height: e.target.value})}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Weight (kg)</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          min="1"
                          max="50"
                          className="form-input" 
                          placeholder="e.g. 9.8"
                          value={measurementForm.weight}
                          onChange={(e) => setMeasurementForm({...measurementForm, weight: e.target.value})}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Head Circumference (cm, optional)</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          min="20"
                          max="70"
                          className="form-input" 
                          placeholder="e.g. 45.2"
                          value={measurementForm.headCircumference}
                          onChange={(e) => setMeasurementForm({...measurementForm, headCircumference: e.target.value})}
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: "100%", marginTop: "0.5rem" }}
                        disabled={submittingRecord}
                      >
                        {submittingRecord ? (
                          <>
                            <Loader2 className="animate-spin" size={16} /> Saving Record...
                          </>
                        ) : (
                          <>
                            <Plus size={16} /> Save Growth Log
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* CDC Guidelines Accordion */}
                  <div className="glass-panel" style={{ borderRadius: "16px", padding: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <HelpCircle size={16} style={{ color: "var(--secondary)" }} />
                      How to Measure Accurately
                    </h3>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                      Following CDC standards ensures precise Z-score calculations.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {/* Height Section */}
                      <div>
                        <button 
                          type="button"
                          className="btn btn-secondary"
                          style={{ width: "100%", justifyContent: "space-between", padding: "0.5rem 0.75rem", fontSize: "0.85rem", borderRadius: "8px" }}
                          onClick={() => toggleAccordion("height")}
                        >
                          <span>Measuring Height / Length</span>
                          <ChevronDown size={14} style={{ transform: accordionOpen === "height" ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                        </button>
                        {accordionOpen === "height" && (
                          <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-light)", borderTop: "none", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                            <div>• Remove the child's shoes, heavy clothing, and hair accessories.</div>
                            <div>• Stand the child flat on a hard floor against a flat wall.</div>
                            <div>• Ensure feet are flat, heels touching the wall, shoulders level.</div>
                            <div>• Child looks straight ahead (line of sight parallel to floor).</div>
                            <div>• Place a flat tool (like a book) level on the child's head, mark the wall, and measure with a tape.</div>
                          </div>
                        )}
                      </div>

                      {/* Weight Section */}
                      <div>
                        <button 
                          type="button"
                          className="btn btn-secondary"
                          style={{ width: "100%", justifyContent: "space-between", padding: "0.5rem 0.75rem", fontSize: "0.85rem", borderRadius: "8px" }}
                          onClick={() => toggleAccordion("weight")}
                        >
                          <span>Measuring Weight</span>
                          <ChevronDown size={14} style={{ transform: accordionOpen === "weight" ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                        </button>
                        {accordionOpen === "weight" && (
                          <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-light)", borderTop: "none", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                            <div>• Use a digital scale placed on a flat, hard floor (not carpet).</div>
                            <div>• Remove the child's shoes and heavy outer clothing.</div>
                            <div>• Have the child stand still in the center of the scale platform.</div>
                            <div>• Record the weight to the nearest decimal (0.1 kg).</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Longitudinal History Table */}
              <div className="glass-panel" style={{ borderRadius: "16px", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "1rem" }}>Growth Measurement Log</h3>
                
                {loadingRecords ? (
                  <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                    <Loader2 className="animate-spin" style={{ margin: "0 auto 0.5rem" }} /> Loading records...
                  </div>
                ) : growthRecords.length === 0 ? (
                  <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    No growth records logged yet. Enter your child's first measurement above to start tracking.
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-light)", color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>
                          <th style={{ padding: "0.75rem 1rem" }}>Date</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Age</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Height (cm)</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Weight (kg)</th>
                          <th style={{ padding: "0.75rem 1rem" }}>BMI</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Status Details</th>
                          <th style={{ padding: "0.75rem 1rem" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...growthRecords]
                          .sort((a, b) => new Date(b.dateOfMeasurement).getTime() - new Date(a.dateOfMeasurement).getTime())
                          .map((rec) => {
                            const dateStr = new Date(rec.dateOfMeasurement).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            });
                            return (
                              <tr key={rec.id} style={{ borderBottom: "1px solid var(--border-light)", transition: "background 0.2s" }} className="table-row-hover">
                                <td style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>{dateStr}</td>
                                <td style={{ padding: "0.75rem 1rem" }}>{rec.ageInMonths} months</td>
                                <td style={{ padding: "0.75rem 1rem" }}>
                                  {rec.height.toFixed(1)} cm
                                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                                    P: {Math.round(rec.percentiles.hfa)}th (Z: {rec.zScores.hfa.toFixed(1)})
                                  </span>
                                </td>
                                <td style={{ padding: "0.75rem 1rem" }}>
                                  {rec.weight.toFixed(1)} kg
                                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                                    P: {Math.round(rec.percentiles.wfa)}th (Z: {rec.zScores.wfa.toFixed(1)})
                                  </span>
                                </td>
                                <td style={{ padding: "0.75rem 1rem" }}>
                                  {rec.bmi.toFixed(1)}
                                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                                    P: {Math.round(rec.percentiles.bfa)}th (Z: {rec.zScores.bfa.toFixed(1)})
                                  </span>
                                </td>
                                <td style={{ padding: "0.75rem 1rem" }}>
                                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                                    <span className="module-badge" style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem", background: getClassificationDisplay(rec, "hfa").bg, color: getClassificationDisplay(rec, "hfa").color }}>
                                      {rec.classifications.hfa.label}
                                    </span>
                                    <span className="module-badge" style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem", background: getClassificationDisplay(rec, "wfa").bg, color: getClassificationDisplay(rec, "wfa").color }}>
                                      {rec.classifications.wfa.label}
                                    </span>
                                  </div>
                                </td>
                                <td style={{ padding: "0.75rem 1rem" }}>
                                  <button
                                    onClick={() => rec.id && handleDeleteRecord(rec.id)}
                                    className="btn btn-secondary"
                                    style={{ padding: "0.3rem 0.5rem", borderRadius: "6px", color: "var(--danger)", border: "1px solid rgba(239, 68, 68, 0.15)", background: "rgba(239, 68, 68, 0.02)" }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
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
