import { useEffect, useState, type ReactNode } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { Spinner } from "./Spinner";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setIsAdmin(data?.role === "admin");
        setChecking(false);
      });
  }, [user]);

  if (loading || checking) return <Spinner />;
  if (!user)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  if (!isAdmin) {
    return (
      <div className="account-page">
        <div className="account-header">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
          <h1>Not authorized</h1>
          <p>This account doesn't have access to the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
