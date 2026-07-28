import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { Spinner } from "../components/Spinner";
import "./Account.css";

interface ProfileRow {
  username: string | null;
  full_name: string | null;
  bio: string | null;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("username, full_name, bio")
        .eq("id", user.id)
        .single();

      if (!error) setProfile(data);
      setLoading(false);
    }

    if (user) {
      loadProfile();
    }
  }, [user]);

  if (loading) return <Spinner />;

  return (
    <div className="account-page">
      <div className="account-header">
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
        <h1>My Profile</h1>
        <p>Only visible to you, enforced by row level security.</p>
      </div>

      <div className="account-content">
        <div className="account-card">
          <div className="account-field">
            <label>Username</label>
            <p>{profile?.username || "Not set"}</p>
          </div>
          <div className="account-field">
            <label>Full Name</label>
            <p>{profile?.full_name || "Not set"}</p>
          </div>
          <div className="account-field">
            <label>Bio</label>
            <p>{profile?.bio || "No bio yet"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
