import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { UserIcon, ShieldCheckIcon } from "../components/Icons";

export default function Login() {
  const [role, setRole] = useState("user"); // "user" | "admin"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === "admin") {
      setEmail("admin@ledger.co");
      setPassword("admin123");
    } else {
      setEmail("");
      setPassword("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (role === "admin" && !loggedUser?.is_admin) {
        toast.error("This account does not have administrative privileges.");
        return;
      }
      toast.success(
        role === "admin"
          ? "Welcome to the Ledger & Co. Admin Suite."
          : "Welcome back to Ledger & Co."
      );
      if (loggedUser?.is_admin || role === "admin") {
        navigate("/admin");
      } else {
        navigate("/products");
      }
    } catch (err) {
      toast.error(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-shell">
        {/* Toggle between User and Admin */}
        <div className="auth-role-toggle" role="tablist" aria-label="Select login role">
          <div
            className="auth-role-glider"
            style={{
              transform: role === "admin" ? "translateX(100%)" : "translateX(0%)",
            }}
          />
          <button
            type="button"
            role="tab"
            aria-selected={role === "user"}
            className={`auth-role-btn ${role === "user" ? "active" : ""}`}
            onClick={() => handleRoleChange("user")}
          >
            <UserIcon size={16} />
            <span>User</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === "admin"}
            className={`auth-role-btn ${role === "admin" ? "active" : ""}`}
            onClick={() => handleRoleChange("admin")}
          >
            <ShieldCheckIcon size={16} />
            <span>Admin</span>
          </button>
        </div>

        {/* Smooth Swap Container */}
        <div key={role} className="auth-swap-container">
          {/* Role Specific Seal and Header */}
          <div className="auth-seal">
            {role === "admin" ? <ShieldCheckIcon size={24} /> : "L"}
          </div>

          <h1>{role === "admin" ? "Store Administrator" : "Welcome Back"}</h1>
          <p className="auth-sub">
            {role === "admin"
              ? "Sign in to access inventory, product curation & management controls."
              : "Sign in to your client account to track dispatches and access your bag."}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field" style={{ textAlign: "left" }}>
              <label htmlFor="email">
                {role === "admin" ? "Admin Email Address" : "Email Address"}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === "admin" ? "admin@ledger.co" : "artisan@domain.com"}
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
              style={{
                marginTop: "8px",
              }}
            >
              {loading
                ? "Verifying..."
                : role === "admin"
                ? "Sign In as Administrator"
                : "Sign In to Account"}
            </button>
          </form>

          {role === "user" ? (
            <p style={{ marginTop: "22px", fontSize: "14px", color: "var(--ink-soft)" }}>
              New collector?{" "}
              <Link to="/register" style={{ fontWeight: 600, color: "var(--brass)" }}>
                Create an account
              </Link>
            </p>
          ) : (
            <p style={{ marginTop: "20px", fontSize: "12.5px", color: "var(--ink-muted)" }}>
              Demo credentials: <code style={{ fontFamily: "var(--mono)", color: "var(--ink)", fontWeight: 600 }}>admin@ledger.co</code> / <code style={{ fontFamily: "var(--mono)", color: "var(--ink)", fontWeight: 600 }}>admin123</code>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
