
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("eventease_admin_token", data.token);
      localStorage.setItem(
        "eventease_admin",
        JSON.stringify(data.admin)
      );

      navigate("/admin");
    } catch (err) {
      setError(err.message || "Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <form className="admin-auth-card" onSubmit={handleLogin}>
        <div className="admin-brand">EventEase</div>

        <p className="admin-eyebrow">ADMINISTRATION</p>
        <h1>Welcome back</h1>
        <p className="admin-subtitle">
          Sign in to manage your events and attendees.
        </p>

        <label htmlFor="admin-email">Email address</label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          autoComplete="username"
          required
        />

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        {error && <p className="admin-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <button
          type="button"
          className="admin-back-button"
          onClick={() => navigate("/")}
        >
          Back to events
        </button>
      </form>
    </div>
  );
}
