import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Account.css";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="account-page">
      <div className="account-header">
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
        <h1>Dashboard</h1>
        <p>Welcome back{user?.email ? `, ${user.email}` : ""}.</p>
      </div>

      <div className="account-content">
        <div className="account-card">
          <h2>Your Account</h2>
          <div className="account-row">
            <span className="account-label">Email</span>
            <span className="account-value">{user?.email}</span>
          </div>
          <div className="account-row">
            <span className="account-label">User ID</span>
            <span className="account-value account-mono">{user?.id}</span>
          </div>
          <div className="account-links">
            <Link to="/profile" className="account-link">
              View profile →
            </Link>
            <button onClick={signOut} className="account-signout">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
