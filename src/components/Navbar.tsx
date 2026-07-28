import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "../hooks/useAuth";
import { LogIn, LogOut, User, LayoutDashboard } from "lucide-react";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollTrigger);

// Shared smooth-scroll instance used by the homepage (see utils/initialFX.ts).
export let lenis: Lenis | null = null;

function useLenis() {
  useEffect(() => {
    if (lenis) return;

    const instance = new Lenis();
    lenis = instance;

    // Keep GSAP's ScrollTrigger in sync with Lenis' virtual scroll position.
    instance.on("scroll", ScrollTrigger.update);

    // Drive Lenis off GSAP's own ticker instead of a separate rAF loop
    // (gsap.ticker time is in seconds — Lenis expects milliseconds).
    const onTick = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      instance.destroy();
      lenis = null;
    };
  }, []);
}

export function Navbar() {
  useLenis();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <nav className="header">
      <div className="navbar-title">
        <Link to="/">Portfolio</Link>
      </div>
      <ul>
        {user ? (
          <>
            <li>
              <Link to="/dashboard" className="nav-auth-link">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/profile" className="nav-auth-link">
                <User size={16} /> Profile
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="nav-auth-link nav-auth-button">
                <LogOut size={16} /> Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="nav-auth-link">
                <LogIn size={16} /> Sign In
              </Link>
            </li>
            <li>
              <Link to="/register" className="nav-auth-link nav-auth-cta">
                Get Started
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
