import Link from "next/link";
import { 
  Activity, 
  Heart, 
  Brain, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  CheckCircle2 
} from "lucide-react";

export default function LandingPage() {
  return (
    <>
      {/* Navigation Header */}
      <header className="landing-header">
        <div className="logo-container" id="landing-logo">
          <Activity className="logo-icon" />
          <span>Child<span className="text-gradient-purple">Vision</span></span>
        </div>
        <nav className="nav-actions">
          <Link href="/login" className="nav-link" id="nav-login-btn">
            Sign In
          </Link>
          <Link href="/signup" className="btn btn-primary" id="nav-signup-btn">
            Get Started <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-tagline">
          <Sparkles size={14} />
          Next-Gen AI Pediatric Development Screening
        </div>
        
        <h1 className="hero-title">
          Holistic Growth & <span className="text-gradient-rainbow">Developmental AI</span> Monitoring for Toddlers
        </h1>
        
        <p className="hero-subtitle">
          An advanced multi-modal AI system designed for parents and pediatricians. Track physical metrics, monitor nutritional health, log behavioral milestones, and ensure environmental safety—all from your camera and audio feeds.
        </p>
        
        <div className="hero-actions">
          <Link href="/signup" className="btn btn-primary" id="hero-cta-signup">
            Create Free Account <ArrowRight size={18} />
          </Link>
          <Link href="/login" className="btn btn-secondary" id="hero-cta-login">
            Access Dashboard
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <section className="features-container" id="features">
          <div className="section-header">
            <h2 className="section-title">Four Intelligent Modules, One Central Platform</h2>
            <p className="section-subtitle">
              Independently powerful engines feeding directly into a unified dashboard for comprehensive monitoring.
            </p>
          </div>

          <div className="features-grid">
            {/* Module 1 */}
            <div className="feature-card glass-panel" id="feature-m1">
              <div className="feature-icon-wrapper">
                <Activity size={24} />
              </div>
              <h3 className="feature-title">Physical Growth</h3>
              <p className="feature-desc">
                AI height & weight estimation using pose keypoint scaling and body volume calculations. Direct WHO Z-score tracking to screen for stunting and wasting.
              </p>
              <div className="tech-pill-container">
                <span className="tech-pill">MediaPipe Pose</span>
                <span className="tech-pill">MiDaS Depth</span>
                <span className="tech-pill">ResNet-50</span>
              </div>
            </div>

            {/* Module 2 */}
            <div className="feature-card glass-panel" id="feature-m2">
              <div className="feature-icon-wrapper">
                <Heart size={24} />
              </div>
              <h3 className="feature-title">Nutritional Health</h3>
              <p className="feature-desc">
                Screen for anemia conjunctiva pallor in the LAB color space, measure edema swelling ratios, estimate MUAC, and analyze meal diversity via food recognition.
              </p>
              <div className="tech-pill-container">
                <span className="tech-pill">Mask R-CNN</span>
                <span className="tech-pill">LAB Color Analysis</span>
                <span className="tech-pill">Food-101</span>
              </div>
            </div>

            {/* Module 3 */}
            <div className="feature-card glass-panel" id="feature-m3">
              <div className="feature-icon-wrapper">
                <Brain size={24} />
              </div>
              <h3 className="feature-title">Behavioral & Cognitive</h3>
              <p className="feature-desc">
                Evaluate milestones through gross motor classification, track gaze patterns for early ASD screening, verify sound-responses, and analyze play dynamics.
              </p>
              <div className="tech-pill-container">
                <span className="tech-pill">ViTPose</span>
                <span className="tech-pill">SlowFast Transformers</span>
                <span className="tech-pill">Whisper</span>
              </div>
            </div>

            {/* Module 4 */}
            <div className="feature-card glass-panel" id="feature-m4">
              <div className="feature-icon-wrapper">
                <ShieldAlert size={24} />
              </div>
              <h3 className="feature-title">Environment & Safety</h3>
              <p className="feature-desc">
                Define room boundaries with real-time OpenCV polygons. Receive immediate alerts if a child enters danger zones, falls, or displays prone sleep positions.
              </p>
              <div className="tech-pill-container">
                <span className="tech-pill">YOLOv8 Object</span>
                <span className="tech-pill">OpenCV Boundary</span>
                <span className="tech-pill">Fall Velocity</span>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits/Overview Section */}
        <section className="features-container" style={{ paddingTop: 0 }}>
          <div className="section-header">
            <h2 className="section-title">Built for Pediatric Compliance</h2>
            <p className="section-subtitle">
              Strictly aligned with established healthcare guidelines and standard metrics.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '600px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CheckCircle2 style={{ color: 'var(--success)' }} />
              <span>Full compliance with WHO Child Growth Standards</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CheckCircle2 style={{ color: 'var(--success)' }} />
              <span>Non-invasive screening tools (no blood tests, zero cost)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CheckCircle2 style={{ color: 'var(--success)' }} />
              <span>Seamless data exports for direct pediatrician review</span>
            </div>
          </div>
        </section>
      </main>

      {/* Landing Footer */}
      <footer style={{ borderTop: "1px solid var(--border-light)", padding: "2rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
        <p>&copy; {new Date().getFullYear()} ChildVision. Designed for holistic infant health and safety. All rights reserved.</p>
      </footer>
    </>
  );
}
