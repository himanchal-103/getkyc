import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Alert, Spinner } from "../components/UI";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === "reviewer" || user.role === "admin") {
        navigate("/reviewer");
      } else {
        navigate("/merchant");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-mono font-bold text-2xl text-ink">GetKYC</span>
          <p className="text-muted text-sm mt-1">Sign in to your account</p>
        </div>
        <div className="card">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Alert type="error" message={error} />
            <div>
              <label className="label">Email</label>
              <input
                name="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handle}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                name="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={handle}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full mt-1" disabled={loading}>
              {loading ? <Spinner size="sm" /> : "Sign in"}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-muted mt-4">
          No account?{" "}
          <Link to="/register" className="text-accent hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
