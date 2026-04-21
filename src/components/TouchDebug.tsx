"use client";

import { useEffect, useState } from "react";

interface TouchPoint {
  id: number;
  x: number;
  y: number;
}

export default function TouchDebug() {
  const [touches, setTouches] = useState<TouchPoint[]>([]);
  const [lastEvent, setLastEvent] = useState<string>("");
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const pts = Array.from(e.touches).map((t) => ({
        id: t.identifier,
        x: Math.round(t.clientX),
        y: Math.round(t.clientY),
      }));
      setTouches(pts);
      setLastEvent(`touchstart (${pts.length})`);
      setTapCount((c) => c + 1);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const pts = Array.from(e.touches).map((t) => ({
        id: t.identifier,
        x: Math.round(t.clientX),
        y: Math.round(t.clientY),
      }));
      setTouches(pts);
      setLastEvent(`touchmove (${pts.length})`);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      setTouches([]);
      setLastEvent(`touchend — ${e.changedTouches.length} lifted`);
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <>
      {/* Touch dots */}
      {touches.map((t) => (
        <div
          key={t.id}
          className="fixed z-9999 pointer-events-none"
          style={{
            left: t.x - 20,
            top: t.y - 20,
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(255,0,0,0.4)",
            border: "2px solid red",
          }}
        />
      ))}

      {/* Info panel */}
      <div className="fixed bottom-4 left-4 z-9999 bg-black/80 text-white text-xs p-2 rounded pointer-events-none font-mono leading-5">
        <div>🐛 TouchDebug</div>
        <div>Evento: {lastEvent || "—"}</div>
        <div>Taps: {tapCount}</div>
        {touches.map((t) => (
          <div key={t.id}>
            #{t.id} → ({t.x}, {t.y})
          </div>
        ))}
      </div>
    </>
  );
}
