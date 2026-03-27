"use client";

import { useCallback, useRef, useState } from "react";

type ImageComparisonSliderProps = {
  leftImage: string;
  rightImage: string;
  leftLabel?: string;
  rightLabel?: string;
  leftAlt?: string;
  rightAlt?: string;
  objectFit?: "cover" | "contain";
};

export default function ImageComparisonSlider({
  leftImage,
  rightImage,
  leftLabel = "Before",
  rightLabel = "After",
  leftAlt = "Left image",
  rightAlt = "Right image",
  objectFit = "contain",
}: ImageComparisonSliderProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    containerRef.current?.setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (containerRef.current?.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      className="comparison-slider-root"
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        userSelect: "none",
        touchAction: "none",
        cursor: isDragging ? "col-resize" : "default",
      }}
    >
      <img
        src={leftImage}
        alt={leftAlt}
        draggable={false}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: objectFit,
          filter: "grayscale(20%) contrast(1.1)",
        }}
      />

      <img
        src={rightImage}
        alt={rightAlt}
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: objectFit,
          objectPosition: "center",
          clipPath: `inset(0 0 0 ${position}%)`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <div
        onPointerDown={handlePointerDown}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${position}%`,
          width: "28px",
          transform: "translateX(-50%)",
          zIndex: 10,
          cursor: "col-resize",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            width: "2px",
            background: "#fff",
            transform: "translateX(-50%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "#fff",
            color: "#111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
            fontSize: "0.9rem",
            fontWeight: 700,
            boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
            touchAction: "none",
            pointerEvents: "none",
          }}
        >
          <span>‹</span>
          <span>›</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "12px",
          left: "12px",
          background: "rgba(0,0,0,0.6)",
          color: "#fff",
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          padding: "4px 10px",
          borderRadius: "2px",
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        {leftLabel}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "12px",
          right: "12px",
          background: "rgba(0,0,0,0.6)",
          color: "#fff",
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          padding: "4px 10px",
          borderRadius: "2px",
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        {rightLabel}
      </div>
    </div>
  );
}
