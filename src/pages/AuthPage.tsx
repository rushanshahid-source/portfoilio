import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, UserPlus, Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import "./AuthPage.css";

interface AuthPageProps {
  mode: "login" | "register";
}

export default function AuthPage({ mode }: AuthPageProps) {
  const isLogin = mode === "login";
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string })?.from || "/dashboard";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        navigate(from, { replace: true });
      } else {
        const data = await signUp(email, password);
        if (data.session) {
          navigate("/dashboard", { replace: true });
        } else {
          setInfo("Account created — check your email to confirm before signing in.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-back-link" data-cursor="disable">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="auth-card">
        <div className="auth-mode-switch">
          <Link
            to="/login"
            className={`auth-mode-tab ${isLogin ? "active" : ""}`}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className={`auth-mode-tab ${!isLogin ? "active" : ""}`}
          >
            Create Account
          </Link>
        </div>

        <div className="auth-heading">
          <h1>{isLogin ? "Welcome back" : "Get started"}</h1>
          <p>
            {isLogin
              ? "Sign in to access your dashboard."
              : "Create an account to continue."}
          </p>
        </div>

        {error && <div className="auth-alert auth-alert-error">{error}</div>}
        {info && <div className="auth-alert auth-alert-info">{info}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-field">
            <span>Email</span>
            <div className="auth-input-wrap">
              <Mail size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label className="auth-field">
            <span>Password</span>
            <div className="auth-input-wrap">
              <Lock size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={6}
                required
              />
            </div>
          </label>

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? (
              "Please wait..."
            ) : isLogin ? (
              <>
                <LogIn size={16} /> Sign In
              </>
            ) : (
              <>
                <UserPlus size={16} /> Create Account
              </>
            )}
          </button>
        </form>

        <p className="auth-switch-line">
          {isLogin ? (
            <>
              Don&rsquo;t have an account? <Link to="/register">Create one</Link>
            </>
          ) : (
            <>
              Already have an account? <Link to="/login">Sign in</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
