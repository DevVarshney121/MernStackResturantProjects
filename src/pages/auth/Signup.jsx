
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Leaf,
  UserRound,
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

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const form = new FormData(event.currentTarget);
    const password = form.get("password");
    const confirmPassword = form.get("confirmPassword");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match. Please check and try again.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(`${API}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not create account.");
      }

      if (!result.token || !result.user) {
        throw new Error(
          "Account was created, but the server did not return login data."
        );
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
      <div className="auth-visual signup-visual">
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

          <p className="eyebrow">COME ON IN</p>
          <h1>
            There's always
            <br />
            <em>room for one more.</em>
          </h1>
          <p>Make yourself at home. Your next favorite meal is waiting.</p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <Link className="auth-back-link" to="/">
            ← Back to website
          </Link>

          <p className="eyebrow">JOIN OUR TABLE</p>
          <h2>
            Create your
            <br />
            <em>account.</em>
          </h2>
          <p className="auth-subtitle">A few details and you're all set.</p>

          {message && (
            <div className="auth-notice" role="alert">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Full name
              <span className="input-with-icon">
                <UserRound size={18} />
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  autoComplete="name"
                  minLength={2}
                  required
                />
              </span>
            </label>

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
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
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

            <label>
              Confirm password
              <span className="input-with-icon">
                <LockKeyhole size={18} />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </span>
            </label>

            <button
              className="button auth-submit"
              type="submit"
              disabled={busy}
            >
              {busy ? "Creating account…" : "Create account"}
              <ArrowRight size={17} />
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>

          <small className="auth-disclaimer">
            Passwords are stored as secure hashes, never as plain text.
          </small>
        </div>
      </div>
    </section>
  );
}

export default Signup;
