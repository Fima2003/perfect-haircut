"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback, type CSSProperties } from "react";
import { Upload, Loader2 } from "lucide-react";

type AnalysisData = {
  facial_thirds: string;
  symmetry: string;
  vertical_proportions: string;
  jawline_projection: string;
};

type DotPositions = Record<string, { x: number; y: number }>;
type DotColorStyle = CSSProperties & { "--dot-color": string };
type CardColorStyle = CSSProperties & { "--card-color": string };

const FACE_DOTS = [
  { key: "facial_thirds" as const,        label: "Facial Thirds", icon: "◈", color: "#d4af37" },
  { key: "symmetry" as const,              label: "Symmetry",      icon: "◎", color: "#9b8fe0" },
  { key: "vertical_proportions" as const,  label: "Proportions",   icon: "◇", color: "#72d0a0" },
  { key: "jawline_projection" as const,    label: "Jawline",       icon: "◆", color: "#e07272" },
];

const DEFAULT_POSITIONS: DotPositions = {
  facial_thirds:        { x: 50, y: 18 },
  symmetry:             { x: 50, y: 38 },
  vertical_proportions: { x: 50, y: 55 },
  jawline_projection:   { x: 50, y: 78 },
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const [dotPositions, setDotPositions] = useState<DotPositions>(DEFAULT_POSITIONS);
  const [hairstyleImages, setHairstyleImages] = useState<string[]>([]);
  const [hairstyleNames, setHairstyleNames] = useState<string[]>([]);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Slider comparison state
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null); // null = "Original"
  const [sliderPos, setSliderPos] = useState(50); // percent 0–100
  const isDragging = useRef(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Must be declared before any early return to satisfy Rules of Hooks
  const updateSliderPosition = useCallback((clientX: number) => {
    if (!isDragging.current || !sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  if (loading || !user) return <div className="loading-state" />;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAnalysisResult(data.analysis);
      setDotPositions(data.dot_positions || DEFAULT_POSITIONS);
      setHairstyleImages(data.hairstyles || []);
      // Parse style names from best_styles_summary via dot_positions keys or fallback
      // The API sends hairstyles in the same order as best_styles_summary
      const names = (data.best_styles_summary || "")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
        .slice(0, 3);
      setHairstyleNames(names);
      setSelectedStyle(null);
      setSliderPos(50);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze image. Please check API keys.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setSelectedFile(null);
    setAnalysisResult(null);
    setDotPositions(DEFAULT_POSITIONS);
    setHairstyleImages([]);
    setHairstyleNames([]);
    setSelectedStyle(null);
    setActiveTooltip(null);
  };

  // ── Drag handlers for the slider ──
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDragging.current = true;
    updateSliderPosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    updateSliderPosition(e.clientX);
  };

  const handlePointerUp = () => { isDragging.current = false; };

  const isComparing = selectedStyle !== null && hairstyleImages[selectedStyle];
  const activeStyleImg = isComparing ? hairstyleImages[selectedStyle!] : null;

  return (
    <div className="dashboard-container">
      <header className="dash-header fade-in">
        <div className="logo">Visage Analytics</div>
        <div className="user-profile">
          <span className="user-email">{user.email}</span>
        </div>
      </header>

      <main className="dash-content">
        <div className="analysis-grid">

          {/* LEFT: UPLOAD / PREVIEW / COMPARISON SLIDER */}
          <div className="upload-section slide-up">
            <h2 className="section-title">Geometric Assessment</h2>

            {!preview ? (
              <div className="upload-box" onClick={() => fileInputRef.current?.click()}>
                <div className="upload-icon-wrapper"><Upload size={32} /></div>
                <p>Upload Front-Facing Portrait</p>
                <span className="upload-hint">Ensure good lighting and neutral expression.</span>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" hidden />
              </div>
            ) : (
              <div className="preview-container fade-in">

                {/* ── IMAGE / SLIDER AREA ── */}
                <div
                  ref={sliderContainerRef}
                  className={`image-wrapper ${isComparing ? "comparing" : ""}`}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  {/* Always render the original */}
                  <img src={preview} alt="Original" className="uploaded-image base-image" />

                  {/* Overlay the hairstyle using clip-path */}
                  {isComparing && activeStyleImg && (
                    <>
                      <img
                        src={activeStyleImg}
                        alt="New hairstyle"
                        className="uploaded-image overlay-image"
                        style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                        draggable={false}
                      />

                      {/* Divider bar */}
                      <div
                        className="slider-divider"
                        style={{ left: `${sliderPos}%` }}
                        onPointerDown={handlePointerDown}
                      >
                        <div className="slider-handle">
                          <span>‹</span>
                          <span>›</span>
                        </div>
                      </div>

                      {/* Labels */}
                      <div className="compare-label compare-label-left">Original</div>
                      <div className="compare-label compare-label-right">
                        {hairstyleNames[selectedStyle!] || `Style ${selectedStyle! + 1}`}
                      </div>
                    </>
                  )}

                  {/* Scan overlay */}
                  {analyzing && (
                    <div className="scan-overlay">
                      <div className="scan-line" />
                      <div className="scan-label">Analyzing biometrics…</div>
                    </div>
                  )}

                  {/* Face dots */}
                  {analysisResult && !isComparing &&
                    FACE_DOTS.map((dot) => {
                      const pos = dotPositions[dot.key] || DEFAULT_POSITIONS[dot.key];
                      return (
                        <div
                          key={dot.key}
                          className="face-dot-wrapper"
                          style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
                          onMouseEnter={() => setActiveTooltip(dot.key)}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <div className="face-dot" style={{ "--dot-color": dot.color } as DotColorStyle} />
                          <div className="dot-ring" style={{ "--dot-color": dot.color } as DotColorStyle} />
                          {activeTooltip === dot.key && (
                            <div className="dot-tooltip">
                              <div className="tooltip-label">{dot.icon} {dot.label}</div>
                              <p>{analysisResult[dot.key]}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* ── STYLE PICKER ── */}
                {hairstyleImages.length > 0 && (
                  <div className="style-picker fade-in">
                    {/* Original pill */}
                    <button
                      className={`style-pill ${selectedStyle === null ? "active" : ""}`}
                      onClick={() => setSelectedStyle(null)}
                    >
                      Original
                    </button>

                    {/* One pill per generated hairstyle */}
                    {hairstyleImages.map((_, idx) => (
                      <button
                        key={idx}
                        className={`style-pill ${selectedStyle === idx ? "active" : ""}`}
                        onClick={() => { setSelectedStyle(idx); setSliderPos(50); }}
                      >
                        {hairstyleNames[idx] || `Style ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                )}

                <button className="luxury-button mt-4" onClick={handleAnalyze} disabled={analyzing}>
                  {analyzing ? (
                    <span className="flex-center">
                      <Loader2 className="spinner mr-2" size={18} />Processing…
                    </span>
                  ) : "Initialize Analysis"}
                </button>
                <button className="reset-button mt-2" onClick={handleReset} disabled={analyzing}>
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: ANALYSIS CARDS */}
          <div className="results-section slide-up" style={{ animationDelay: "0.2s" }}>
            {analysisResult && (
              <div className="analysis-cards fade-in">
                <h3 className="results-heading">Structural Findings</h3>
                <div className="cards-list">
                  {FACE_DOTS.map((dot, i) => (
                    <div
                      key={dot.key}
                      className="analysis-card slide-up"
                      style={{ animationDelay: `${i * 0.1}s`, "--card-color": dot.color } as CardColorStyle}
                    >
                      <div className="card-header">
                        <span className="card-icon" style={{ color: dot.color }}>{dot.icon}</span>
                        <span className="card-label">{dot.label}</span>
                        <span className="card-dot" style={{ background: dot.color }} />
                      </div>
                      <p className="card-text">{analysisResult[dot.key]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!analysisResult && (
              <div className="empty-results">
                <div className="empty-grid">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="empty-card" style={{ animationDelay: `${i * 0.15}s` }}>
                      <div className="empty-icon">◈</div>
                    </div>
                  ))}
                </div>
                <p className="empty-hint">Upload a photo to begin your structural analysis</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .dashboard-container { min-height: 100vh; display: flex; flex-direction: column; }

        .dash-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 2rem 4rem; border-bottom: 1px solid var(--border);
        }
        .logo { font-family: var(--font-display); letter-spacing: 0.1em; text-transform: uppercase; }
        .user-email { font-size: 0.9rem; opacity: 0.7; letter-spacing: 0.05em; }

        .dash-content { flex: 1; padding: 4rem; max-width: 1600px; margin: 0 auto; width: 100%; }

        .analysis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; min-height: 60vh; }

        .section-title {
          font-size: 1rem; margin-bottom: 2rem;
          text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent);
        }

        /* UPLOAD */
        .upload-box {
          border: 1px solid var(--border); padding: 4rem 2rem;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; cursor: pointer; transition: all 0.3s ease;
          background: rgba(255,255,255,0.02); height: 500px;
        }
        .upload-box:hover { border-color: var(--accent); background: rgba(212,175,55,0.05); }
        .upload-icon-wrapper { color: var(--accent); margin-bottom: 1.5rem; }
        .upload-box p { font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 0.5rem; }
        .upload-hint { font-size: 0.85rem; opacity: 0.5; }

        .preview-container { display: flex; flex-direction: column; }

        /* IMAGE WRAPPER */
        .image-wrapper {
          position: relative; width: 100%;
          overflow: hidden; border: 1px solid var(--border);
          user-select: none; background: #000;
        }
        .image-wrapper.comparing { cursor: col-resize; }

        /* Base image drives the container height naturally */
        .base-image {
          position: relative;
          width: 100%; height: auto; display: block;
          object-fit: contain;
          filter: grayscale(20%) contrast(1.1);
        }
        /* Overlay sits on top at exact same size/position */
        .overlay-image {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: contain; object-position: top center;
          z-index: 2;
        }

        /* SLIDER DIVIDER */
        .slider-divider {
          position: absolute; top: 0; bottom: 0;
          width: 28px;
          transform: translateX(-50%);
          z-index: 10; cursor: col-resize;
          touch-action: none;
        }
        .slider-divider::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 2px;
          background: #fff;
          transform: translateX(-50%);
        }
        .slider-handle {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 36px; height: 36px; border-radius: 50%;
          background: #fff; color: #111;
          display: flex; align-items: center; justify-content: center;
          gap: 2px; font-size: 0.9rem; font-weight: bold;
          box-shadow: 0 2px 12px rgba(0,0,0,0.4);
          cursor: col-resize;
          touch-action: none;
        }

        /* Compare labels */
        .compare-label {
          position: absolute; bottom: 12px;
          background: rgba(0,0,0,0.6); color: #fff;
          font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 2px; z-index: 5; pointer-events: none;
        }
        .compare-label-left  { left: 12px; }
        .compare-label-right { right: 12px; }

        /* STYLE PICKER */
        .style-picker {
          display: flex; flex-wrap: wrap; gap: 0.5rem;
          margin-top: 1rem;
        }
        .style-pill {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--foreground);
          padding: 0.4rem 1rem;
          font-family: var(--font-body);
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0.6;
        }
        .style-pill:hover { opacity: 1; border-color: var(--accent); }
        .style-pill.active {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--background);
          opacity: 1;
          font-weight: 600;
        }

        /* SCAN */
        .scan-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          overflow: hidden; z-index: 20;
        }
        .scan-line {
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          animation: scanDown 2s ease-in-out infinite;
        }
        .scan-label { font-size: 0.8rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); }
        @keyframes scanDown { 0% { top: 0; } 100% { top: 100%; } }

        /* FACE DOTS */
        .face-dot-wrapper { position: absolute; transform: translate(-50%, -50%); cursor: pointer; z-index: 10; }
        .face-dot {
          width: 12px; height: 12px; border-radius: 50%;
          background: var(--dot-color); box-shadow: 0 0 8px var(--dot-color);
          animation: dotPulse 2s ease-in-out infinite; position: relative; z-index: 2;
        }
        .dot-ring {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 28px; height: 28px; border-radius: 50%;
          border: 1px solid var(--dot-color); opacity: 0.5;
          animation: ringPulse 2s ease-in-out infinite;
        }
        @keyframes dotPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }
        @keyframes ringPulse { 0%,100% { transform: translate(-50%,-50%) scale(1); opacity:0.5; } 50% { transform: translate(-50%,-50%) scale(1.3); opacity:0.15; } }

        /* TOOLTIP */
        .dot-tooltip {
          position: absolute; bottom: calc(100% + 16px); left: 50%;
          transform: translateX(-50%);
          background: rgba(12,12,12,0.97); border: 1px solid rgba(255,255,255,0.15);
          padding: 0.75rem 1rem; width: 240px;
          font-size: 0.85rem; line-height: 1.6; color: #f4f4f5;
          box-shadow: 0 8px 32px rgba(0,0,0,0.8); pointer-events: none;
          animation: tooltipIn 0.15s ease; z-index: 20;
        }
        .dot-tooltip::after {
          content: ""; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
          border: 6px solid transparent; border-top-color: rgba(255,255,255,0.15);
        }
        .tooltip-label { font-family: var(--font-display); font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.35rem; color: rgba(255,255,255,0.5); }
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* BUTTONS */
        .reset-button {
          background: none; border: none; color: inherit; opacity: 0.5;
          margin-top: 1rem; cursor: pointer; text-transform: uppercase;
          font-size: 0.8rem; letter-spacing: 0.1em;
        }
        .reset-button:hover { opacity: 1; }
        .flex-center { display: flex; align-items: center; justify-content: center; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* ANALYSIS CARDS */
        .results-heading { font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
        .analysis-cards { margin-bottom: 3rem; }
        .cards-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .analysis-card {
          background: var(--surface); border: 1px solid var(--border);
          border-left: 3px solid var(--card-color);
          padding: 1rem 1.25rem; transition: filter 0.2s;
        }
        .analysis-card:hover { filter: brightness(1.1); }
        .card-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; }
        .card-icon { font-size: 0.9rem; }
        .card-label { font-family: var(--font-display); font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; flex: 1; color: var(--foreground); }
        .card-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; animation: dotPulse 2.5s ease-in-out infinite; }
        .card-text { font-size: 0.95rem; line-height: 1.75; color: var(--foreground); margin: 0; }

        /* EMPTY STATE */
        .empty-results { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 2rem; }
        .empty-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; width: 100%; max-width: 320px; }
        .empty-card { border: 1px solid rgba(255,255,255,0.06); height: 100px; display: flex; align-items: center; justify-content: center; animation: emptyPulse 3s ease-in-out infinite; }
        .empty-card:nth-child(2) { animation-delay: 0.5s; }
        .empty-card:nth-child(3) { animation-delay: 1s; }
        .empty-card:nth-child(4) { animation-delay: 1.5s; }
        @keyframes emptyPulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.7; } }
        .empty-icon { font-size: 1.5rem; color: var(--accent); opacity: 0.5; }
        .empty-hint { font-size: 0.85rem; opacity: 0.4; letter-spacing: 0.05em; text-align: center; }

        .mt-4 { margin-top: 2rem; }
        .mt-2 { margin-top: 1rem; }
        .mr-2 { margin-right: 0.5rem; }

        @media (max-width: 1024px) {
          .analysis-grid { grid-template-columns: 1fr; }
          .dash-content { padding: 2rem; }
          .dash-header { padding: 1.5rem 2rem; }
        }
      `}</style>
    </div>
  );
}
