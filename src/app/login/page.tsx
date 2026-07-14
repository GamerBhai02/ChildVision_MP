"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Activity, 
  ArrowRight,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    setIsConfigured(isFirebaseConfigured());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isConfigured) {
      setError("Firebase is not configured. Please create a .env.local file in your project root with your credentials.");
      setLoading(false);
      return;
    }

    const { email, password } = formData;

    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      if (!auth) {
        throw new Error("Firebase SDK was not initialized correctly.");
      }

      // Authenticate user against Firebase Authentication service
      await signInWithEmailAndPassword(auth!, email, password);

      setLoading(false);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message || "An unexpected error occurred during login.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="logo-container" style={{ justifyContent: "center", marginBottom: "0.5rem" }} onClick={() => router.push("/")}>
            <Activity className="logo-icon" />
            <span>Child<span className="text-gradient-purple">Vision</span></span>
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to access your parent dashboard</p>
        </div>

        {/* Warning if Firebase is not configured */}
        {!isConfigured && (
          <div className="alert-banner alert-danger" style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong style={{ display: "block", marginBottom: "0.25rem" }}>Firebase Missing</strong>
              Please configure environment variables in <code>.env.local</code> to enable signing in. See <code>.env.example</code>.
            </div>
          </div>
        )}

        {error && (
          <div className="alert-banner alert-danger" id="login-error-banner">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }} id="login-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-container">
              <Mail className="input-icon left" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input input-icon-left"
                placeholder="parent@example.com"
                id="login-email"
                disabled={!isConfigured}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label">Password</label>
              <a href="#" style={{ fontSize: "0.8rem", color: "var(--primary)" }} onClick={(e) => { e.preventDefault(); alert("Please reset your password in the Firebase Console if you forgot it."); }}>
                Forgot Password?
              </a>
            </div>
            <div className="input-container">
              <Lock className="input-icon left" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input input-icon-left input-icon-right"
                placeholder="••••••••"
                id="login-password"
                disabled={!isConfigured}
                required
              />
              <span 
                className="input-icon right" 
                onClick={() => setShowPassword(!showPassword)}
                id="login-toggle-password"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={loading || !isConfigured}
            id="login-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Signing In...
              </>
            ) : (
              <>
                Sign In & Launch Dashboard <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link href="/signup" className="auth-link" id="login-signup-redirect">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
