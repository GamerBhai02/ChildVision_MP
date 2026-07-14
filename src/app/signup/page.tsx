"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Lock, 
  Baby, 
  Calendar, 
  Eye, 
  EyeOff, 
  Activity, 
  Sparkles, 
  ArrowRight,
  Loader2
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    parentName: "",
    email: "",
    password: "",
    confirmPassword: "",
    childName: "",
    childDob: "",
    childGender: "male",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { parentName, email, password, confirmPassword, childName, childDob, childGender } = formData;

    // Validation
    if (!parentName || !email || !password || !confirmPassword || !childName || !childDob) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      // Retrieve existing users from localStorage
      const existingUsersRaw = localStorage.getItem("childvision_users");
      const existingUsers = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];

      // Check if user already exists
      const userExists = existingUsers.some((user: any) => user.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        setError("An account with this email already exists.");
        setLoading(false);
        return;
      }

      // Create new user object
      const newUser = {
        id: Date.now().toString(),
        parentName,
        email,
        password, // stored locally as plaintext for Phase 0 mock authentication
        childName,
        childDob,
        childGender,
        createdAt: new Date().toISOString(),
      };

      // Add to array and save
      existingUsers.push(newUser);
      localStorage.setItem("childvision_users", JSON.stringify(existingUsers));

      // Set active session
      localStorage.setItem("childvision_session", JSON.stringify(newUser));

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
          <h2 className="auth-title">Create your Account</h2>
          <p className="auth-subtitle">Monitor and safeguard your toddler's milestones</p>
        </div>

        {error && (
          <div className="alert-banner alert-danger" id="signup-error-banner">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }} id="signup-form">
          {/* Parent Info */}
          <div className="form-group">
            <label className="form-label">Parent / Guardian Name</label>
            <div className="input-container">
              <User className="input-icon left" size={18} />
              <input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                className="form-input input-icon-left"
                placeholder="John Doe"
                id="signup-parent-name"
                required
              />
            </div>
          </div>

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
                id="signup-email"
                required
              />
            </div>
          </div>

          {/* Child Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Toddler's Name</label>
              <div className="input-container">
                <Baby className="input-icon left" size={18} />
                <input
                  type="text"
                  name="childName"
                  value={formData.childName}
                  onChange={handleChange}
                  className="form-input input-icon-left"
                  placeholder="Leo"
                  id="signup-child-name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                name="childGender"
                value={formData.childGender}
                onChange={handleChange}
                className="form-input"
                id="signup-child-gender"
                style={{ height: "45px", background: "rgba(255, 255, 255, 0.02)" }}
              >
                <option value="male" style={{ background: "#0f111c" }}>Male</option>
                <option value="female" style={{ background: "#0f111c" }}>Female</option>
                <option value="other" style={{ background: "#0f111c" }}>Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <div className="input-container">
              <Calendar className="input-icon left" size={18} />
              <input
                type="date"
                name="childDob"
                value={formData.childDob}
                onChange={handleChange}
                className="form-input input-icon-left"
                id="signup-child-dob"
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          {/* Password Fields */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-container">
              <Lock className="input-icon left" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input input-icon-left input-icon-right"
                placeholder="••••••••"
                id="signup-password"
                required
              />
              <span 
                className="input-icon right" 
                onClick={() => setShowPassword(!showPassword)}
                id="signup-toggle-password"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-container">
              <Lock className="input-icon left" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input input-icon-left"
                placeholder="••••••••"
                id="signup-confirm-password"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={loading}
            id="signup-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Creating Account...
              </>
            ) : (
              <>
                Register & Enter Portal <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link href="/login" className="auth-link" id="signup-login-redirect">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
