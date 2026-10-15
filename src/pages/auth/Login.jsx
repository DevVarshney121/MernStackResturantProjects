
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Leaf,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import "../../styles/auth.css";

const API = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"
).replace(/\/+$/, "");

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Login failed.");
      }

      if (!result.token || !result.user) {
        throw new Error("Login response is missing user or token data.");
      }

      localStorage.setItem("bb_token", result.token);
      localStorage.setItem("bb_user", JSON.stringify(result.user));

      window.dispatchEvent(new Event("auth-change"));

      navigate("/", { replace: true });
    } catch (error) {
      setMessage(
        error.message ||
          "Could not connect to the backend. Make sure Flask is running."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <Link className="brand auth-brand" to="/">
            <span className="brand-mark">
              <Leaf size={21} />
            </span>
            <span>
              Bite <em>&</em> Bloom
            </span>
          </Link>

          <p className="eyebrow">A SEAT AT OUR TABLE</p>
          <h1>
            Good food.
            <br />
            <em>Good company.</em>
          </h1>
          <p>Your favorite neighborhood table is just a little closer.</p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <Link className="auth-back-link" to="/">
            ← Back to website
          </Link>

          <p className="eyebrow">WELCOME BACK</p>
          <h2>
            Log in to your
            <br />
            <em>little corner.</em>
          </h2>
          <p className="auth-subtitle">
            Enter your details to continue.
          </p>

          {message && (
            <div className="auth-notice" role="alert">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Email address
              <span className="input-with-icon">
                <Mail size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </span>
            </label>

            <label>
              Password
              <span className="input-with-icon">
                <LockKeyhole size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            <button
              className="button auth-submit"
              type="submit"
              disabled={busy}
            >
              {busy ? "Logging in…" : "Log in"}
              <ArrowRight size={17} />
            </button>
          </form>

          <p className="auth-switch">
            New to Bite & Bloom? <Link to="/signup">Create an account</Link>
          </p>

          <small className="auth-disclaimer">
            Your password is verified securely by the backend.
          </small>
        </div>
      </div>
    </section>
  );
}

export default Login;
