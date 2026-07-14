"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Activity, 
  ArrowRight,
  Loader2
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { email, password } = formData;

    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      // Retrieve existing users from localStorage
      const existingUsersRaw = localStorage.getItem("childvision_users");
      const existingUsers = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];

      // Look up user
      const user = existingUsers.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!user) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      // Set active session
      localStorage.setItem("childvision_session", JSON.stringify(user));

      // Simulate a small network delay for realistic visual feedback
      setTimeout(() => {
        setLoading(false);
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
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
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label">Password</label>
              <a href="#" style={{ fontSize: "0.8rem", color: "var(--primary)" }} onClick={(e) => { e.preventDefault(); alert("Mock password reset link clicked! For Phase 0, please create a new account if you forgot your credentials."); }}>
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
            disabled={loading}
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
