"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="loading-state"></div>;
  }

  return (
    <main className="hero-container">
      <nav className="top-nav fade-in">
        <div className="logo">Visage Analytics</div>
        <div className="nav-links">
          {user ? (
            <Link href="/dashboard" className="luxury-button">Dashboard</Link>
          ) : (
            <button onClick={signInWithGoogle} className="luxury-button">
              Sign In
            </button>
          )}
        </div>
      </nav>

      <section className="hero-content">
        <h1 className="slide-up" style={{ animationDelay: "0.2s" }}>
          Discover Your<br />
          <span className="accent-text">Perfect Geometry.</span>
        </h1>
        <p className="slide-up subheadline" style={{ animationDelay: "0.4s" }}>
          Advanced AI analysis of your facial thirds, symmetry, and projection. 
          We determine the optimal haircut to balance your unique structural features.
        </p>
        <div className="cta-wrapper slide-up" style={{ animationDelay: "0.6s" }}>
          <button onClick={signInWithGoogle} className="luxury-button pr-large">
            Begin Analysis
          </button>
        </div>
      </section>

      <style jsx>{`
        .hero-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          padding: 2rem 4rem;
          overflow: hidden;
        }

        .hero-container::before {
          content: "";
          position: absolute;
          top: -20%;
          right: -10%;
          width: 60vw;
          height: 60vw;
          background: radial-gradient(circle, var(--accent-muted) 0%, transparent 60%);
          z-index: -1;
          filter: blur(80px);
        }

        .top-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border);
        }

        .logo {
          font-family: var(--font-display);
          font-size: 1.5rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .hero-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-width: 800px;
          margin-top: -5vh;
        }

        h1 {
          font-size: clamp(3rem, 8vw, 6rem);
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }

        .accent-text {
          color: var(--accent);
          font-style: italic;
        }

        .subheadline {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.7);
          max-width: 600px;
          margin-bottom: 3rem;
          line-height: 1.8;
          font-weight: 300;
        }

        .pr-large {
          padding: 1rem 3rem;
          font-size: 1rem;
        }

        .loading-state {
          height: 100vh;
          width: 100vw;
          background: var(--background);
        }

        @media (max-width: 768px) {
          .hero-container {
            padding: 1.5rem;
          }
          .hero-content {
            margin-top: 5vh;
          }
        }
      `}</style>
    </main>
  );
}
