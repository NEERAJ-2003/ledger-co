import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { LockIcon, UserIcon, ArrowRightIcon, SparklesIcon } from "../components/Icons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back to Ledger & Co.");
      navigate("/products");
    } catch (err) {
      toast.error(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setEmail("admin@ledger.co");
    setPassword("admin123");
    setLoading(true);
    try {
      await login("admin@ledger.co", "admin123");
      toast.success("Logged in as Demo Store Administrator.");
      navigate("/admin");
    } catch (err) {
      toast.error(err.message || "Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-shell">
        <div className="auth-seal">L</div>
        <h1>Welcome Back</h1>
        <p className="auth-sub">
          Sign in to your client account to track dispatches and access your bag.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="field" style={{ textAlign: "left" }}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="artisan@domain.com"
              required
            />
          </div>

          <div className="field" style={{ textAlign: "left" }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Sign In to Account"}
          </button>
        </form>

        <p style={{ marginTop: "22px", fontSize: "14px", color: "var(--ink-soft)" }}>
          New collector? <Link to="/register" style={{ fontWeight: 600, color: "var(--brass)" }}>Create an account</Link>
        </p>

        {/* 1-Click Demo Admin Button */}
        <div className="demo-login-box">
          <div style={{ fontWeight: 600, marginBottom: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <SparklesIcon size={14} /> Quick Demo Access
          </div>
          <p style={{ fontSize: "12.5px", marginBottom: "10px" }}>
            Instant access to the executive store inventory &amp; product creation portal.
          </p>
          <button
            type="button"
            className="btn btn-outline btn-block btn-sm"
            onClick={handleDemoAdmin}
            disabled={loading}
          >
            Log In as Store Admin (admin@ledger.co)
          </button>
        </div>
      </div>
    </div>
  );
}
