"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LOOKBOOK_PAIRS = [
  {
    name: "Brad",
    before: "/images/brad.jpg",
    after: "/images/brad-cool.jpeg",
    note: "Sharper crown volume and stronger jaw framing",
  },
  {
    name: "Obama",
    before: "/images/obama.webp",
    after: "/images/obama-cool.jpeg",
    note: "Cleaner temple gradient with balanced forehead weight",
  },
  {
    name: "Trump",
    before: "/images/trump.avif",
    after: "/images/trump-cool.jpeg",
    note: "Smoother silhouette and better side profile structure",
  },
  {
    name: "Baby",
    before: "/images/baby.jpeg",
    after: "/images/baby-cool.jpeg",
    note: "Soft texture flow with proportional face opening",
  },
];

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
    <main className="landing-container">
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

      <section className="hero-grid">
        <div className="hero-content">
          <h1 className="slide-up" style={{ animationDelay: "0.15s" }}>
            Discover Your<br />
            <span className="accent-text">Perfect Haircut.</span>
          </h1>
          <p className="slide-up subheadline" style={{ animationDelay: "0.3s" }}>
            Upload one portrait and get structural haircut recommendations tuned to your facial thirds,
            symmetry, and jaw projection. This is a precision fit, not a random style generator.
          </p>
          <div className="cta-row slide-up" style={{ animationDelay: "0.45s" }}>
            <button onClick={signInWithGoogle} className="luxury-button pr-large">
              Start My Analysis
            </button>
            <Link href="/dashboard" className="ghost-link">Open Demo Dashboard</Link>
          </div>
          <div className="mini-stats slide-up" style={{ animationDelay: "0.6s" }}>
            <div>
              <span className="stat-value">4</span>
              <span className="stat-label">Geometry Checks</span>
            </div>
            <div>
              <span className="stat-value">3</span>
              <span className="stat-label">Style Outputs</span>
            </div>
            <div>
              <span className="stat-value">1</span>
              <span className="stat-label">Best Fit Direction</span>
            </div>
          </div>
        </div>

        <div className="hero-preview fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="preview-header">
            <span>Featured Comparison</span>
            <span>Hover to Reveal</span>
          </div>
          <div className="compare-shell">
            <Image
              src={LOOKBOOK_PAIRS[0].before}
              alt={`${LOOKBOOK_PAIRS[0].name} before haircut optimization`}
              fill
              className="compare-image"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <Image
              src={LOOKBOOK_PAIRS[0].after}
              alt={`${LOOKBOOK_PAIRS[0].name} after haircut optimization`}
              fill
              className="compare-image compare-image-after"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <div className="compare-divider" />
            <div className="compare-chip chip-left">Original</div>
            <div className="compare-chip chip-right">Optimized</div>
          </div>
          <p className="preview-note">{LOOKBOOK_PAIRS[0].note}</p>
        </div>
      </section>

      <section className="lookbook-section">
        <div className="section-header">
          <h2>Before / After Lookbook</h2>
          <p>Real pair previews from your uploaded set. Hover each card to scrub the split.</p>
        </div>
        <div className="lookbook-grid">
          {LOOKBOOK_PAIRS.map((pair, idx) => (
            <article className="lookbook-card slide-up" key={pair.name} style={{ animationDelay: `${0.1 * idx}s` }}>
              <div className="compare-shell card-shell">
                <Image
                  src={pair.before}
                  alt={`${pair.name} before`}
                  fill
                  className="compare-image"
                  sizes="(max-width: 1024px) 100vw, (max-width: 1300px) 50vw, 25vw"
                />
                <Image
                  src={pair.after}
                  alt={`${pair.name} optimized haircut`}
                  fill
                  className="compare-image compare-image-after"
                  sizes="(max-width: 1024px) 100vw, (max-width: 1300px) 50vw, 25vw"
                />
                <div className="compare-divider" />
                <div className="compare-chip chip-left">Before</div>
                <div className="compare-chip chip-right">After</div>
              </div>
              <div className="card-copy">
                <h3>{pair.name}</h3>
                <p>{pair.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="process-section">
        <div className="section-header">
          <h2>How It Works</h2>
        </div>
        <div className="process-grid">
          <div className="process-card">
            <span>01</span>
            <h3>Upload a clean portrait</h3>
            <p>Front-facing, neutral expression, and clear lighting for structural accuracy.</p>
          </div>
          <div className="process-card">
            <span>02</span>
            <h3>Measure key geometry</h3>
            <p>The model evaluates facial thirds, symmetry, vertical proportions, and jawline projection.</p>
          </div>
          <div className="process-card">
            <span>03</span>
            <h3>Get your haircut direction</h3>
            <p>Receive comparison-ready recommendations designed to improve visual balance.</p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .landing-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          padding: 2rem 4rem;
          overflow: hidden;
          gap: 3rem;
        }

        .landing-container::before {
          content: "";
          position: absolute;
          top: -10%;
          right: -5%;
          width: 54vw;
          height: 54vw;
          background: radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0) 70%);
          z-index: -1;
          filter: blur(70px);
        }

        .landing-container::after {
          content: "";
          position: absolute;
          bottom: -20%;
          left: -15%;
          width: 45vw;
          height: 45vw;
          background: radial-gradient(circle, rgba(120,120,120,0.18) 0%, rgba(120,120,120,0) 70%);
          filter: blur(90px);
          z-index: -1;
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

        .hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 2.5rem;
          align-items: center;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          max-width: 760px;
          padding-top: 0.5rem;
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
          max-width: 680px;
          margin-bottom: 2rem;
          line-height: 1.8;
          font-weight: 300;
        }

        .cta-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.75rem;
        }

        .ghost-link {
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.35);
          font-size: 0.9rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: all 0.2s ease;
        }
        .ghost-link:hover {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }

        .mini-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
          max-width: 560px;
        }
        .mini-stats div {
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.015);
          padding: 0.8rem 0.9rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .stat-value {
          font-family: var(--font-display);
          color: var(--accent);
          font-size: 1.3rem;
          letter-spacing: 0.05em;
        }
        .stat-label {
          font-size: 0.72rem;
          opacity: 0.65;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }

        .hero-preview {
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
          padding: 1rem;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.9rem;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0.7;
        }

        .compare-shell {
          --split: 56%;
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: #0f0f11;
          border: 1px solid rgba(255,255,255,0.15);
          transition: --split 0.35s ease;
        }
        .compare-shell:hover {
          --split: 22%;
        }

        .compare-image {
          object-fit: cover;
        }

        .compare-image-after {
          clip-path: inset(0 0 0 var(--split));
          transition: clip-path 0.35s ease;
        }

        .compare-divider {
          position: absolute;
          top: 0;
          bottom: 0;
          left: var(--split);
          width: 2px;
          background: #fff;
          transform: translateX(-50%);
          transition: left 0.35s ease;
          box-shadow: 0 0 16px rgba(255,255,255,0.45);
        }

        .compare-chip {
          position: absolute;
          bottom: 0.75rem;
          padding: 0.3rem 0.5rem;
          font-size: 0.62rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: rgba(0,0,0,0.55);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
        }
        .chip-left { left: 0.7rem; }
        .chip-right { right: 0.7rem; }

        .preview-note {
          margin: 0.8rem 0 0;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.75);
          line-height: 1.6;
        }

        .lookbook-section,
        .process-section {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .section-header h2 {
          margin: 0;
          font-family: var(--font-display);
          font-size: clamp(1.3rem, 2.5vw, 2rem);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .section-header p {
          margin: 0;
          opacity: 0.65;
          font-size: 0.9rem;
        }

        .lookbook-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
        }

        .lookbook-card {
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.015);
          overflow: hidden;
        }

        .card-shell {
          border: none;
          border-bottom: 1px solid var(--border);
          aspect-ratio: 3 / 4;
        }

        .card-copy {
          padding: 0.85rem 0.95rem 1rem;
        }

        .card-copy h3 {
          margin: 0 0 0.45rem;
          font-family: var(--font-display);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-size: 0.95rem;
        }

        .card-copy p {
          margin: 0;
          font-size: 0.83rem;
          line-height: 1.55;
          color: rgba(255,255,255,0.72);
        }

        .process-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }

        .process-card {
          border: 1px solid var(--border);
          background: linear-gradient(160deg, rgba(255,255,255,0.015), rgba(255,255,255,0.005));
          padding: 1rem;
        }

        .process-card span {
          font-family: var(--font-display);
          color: var(--accent);
          letter-spacing: 0.08em;
          font-size: 0.8rem;
        }

        .process-card h3 {
          margin: 0.35rem 0 0.6rem;
          font-size: 1rem;
          line-height: 1.4;
        }

        .process-card p {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.6;
          opacity: 0.72;
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

        @media (max-width: 1300px) {
          .lookbook-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }

          .process-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .landing-container {
            padding: 1.5rem;
            gap: 2rem;
          }

          .hero-content {
            margin-top: 0;
          }

          .mini-stats {
            grid-template-columns: 1fr;
          }

          .lookbook-grid {
            grid-template-columns: 1fr;
          }

          .pr-large {
            width: 100%;
          }

          .ghost-link {
            width: 100%;
            text-align: center;
            padding-top: 0.25rem;
          }
        }
      `}</style>
    </main>
  );
}
