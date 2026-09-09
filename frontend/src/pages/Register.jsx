import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success(`Welcome to the Atelier, ${form.full_name}!`);
      navigate("/products");
    } catch (err) {
      toast.error(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-shell">
        <div className="auth-seal">L</div>
        <h1>Create an Account</h1>
        <p className="auth-sub">
          Join our client registry for effortless ordering, order tracking, and archival dispatches.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="field" style={{ textAlign: "left" }}>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={form.full_name}
              onChange={update("full_name")}
              placeholder="Eleanor Vance"
              required
            />
          </div>

          <div className="field" style={{ textAlign: "left" }}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="eleanor@atelier.org"
              required
            />
          </div>

          <div className="field" style={{ textAlign: "left" }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={update("password")}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? "Creating Atelier Registry..." : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: "22px", fontSize: "14px", color: "var(--ink-soft)" }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600, color: "var(--brass)" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
