"use client";

import { useCallback, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import { Laptop, Smartphone, Tablet } from "lucide-react";
import {
  focusPointToCss,
  MAX_ZOOM,
  MIN_ZOOM,
  type FocusPoint,
  type MediaFocus,
  type MediaFocusDevice,
} from "@/components/HeroSection/mediaFocus";
import { PREVIEW_DEVICE_FRAMES } from "@/components/HeroSection/previewLayoutClasses";
import { resolveHeroMediaUrl } from "@/components/HeroSection/resolveHeroMedia";

type Props = {
  mediaUrl: string;
  mediaUrlMobile?: string | null;
  mediaUrlTablet?: string | null;
  mediaType: "image" | "video";
  value: MediaFocus;
  onChange: (next: MediaFocus) => void;
  disabled?: boolean;
};

const DEVICE_TABS: {
  id: MediaFocusDevice;
  label: string;
  Icon: typeof Laptop;
}[] = [
  { id: "desktop", label: "Computador", Icon: Laptop },
  { id: "tablet", label: "Tablet", Icon: Tablet },
  { id: "mobile", label: "Celular", Icon: Smartphone },
];

function mediaStyle(point: FocusPoint): CSSProperties {
  return {
    objectPosition: focusPointToCss(point),
    transform: `scale(${point.zoom})`,
    transformOrigin: focusPointToCss(point),
  };
}

export default function HeroFocusEditor({
  mediaUrl,
  mediaUrlMobile,
  mediaUrlTablet,
  mediaType,
  value,
  onChange,
  disabled = false,
}: Props) {
  const [device, setDevice] = useState<MediaFocusDevice>("desktop");
  const frameRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const point = value[device];
  const frame = PREVIEW_DEVICE_FRAMES[device];
  const zoomPercent = Math.round(point.zoom * 100);

  const previewSrc = useMemo(() => {
    const resolved = resolveHeroMediaUrl(
      {
        desktop: mediaUrl,
        mobile: mediaUrlMobile,
        tablet: mediaUrlTablet,
      },
      device,
    );
    return typeof resolved === "string" ? resolved : mediaUrl;
  }, [device, mediaUrl, mediaUrlMobile, mediaUrlTablet]);

  const setPoint = useCallback(
    (next: FocusPoint) => {
      onChange({ ...value, [device]: next });
    },
    [device, onChange, value],
  );

  const updateFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const el = frameRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
      setPoint({
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        zoom: point.zoom,
      });
    },
    [point.zoom, setPoint],
  );

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (disabled) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClient(e.clientX, e.clientY);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging.current || disabled) return;
    updateFromClient(e.clientX, e.clientY);
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function onZoomChange(percent: number) {
    const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, percent / 100));
    setPoint({ ...point, zoom: Math.round(zoom * 100) / 100 });
  }

  return (
    <div className="space-y-3 border-t border-gray-100 pt-5">
      <div>
        <label className="text-xs font-black uppercase tracking-widest text-gray-500 block">
          Encuadre por dispositivo
        </label>
        <p className="mt-1 text-[11px] text-gray-400">
          Ajuste fino sobre el arte de cada device. Arrastra el foco y usa el zoom.
        </p>
      </div>

      <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
        {DEVICE_TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => setDevice(id)}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 ${
              device === id
                ? "bg-[#154734] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="hero-zoom" className="text-[11px] font-semibold text-gray-500">
            Zoom
          </label>
          <span className="text-[11px] tabular-nums text-gray-600 font-medium">
            {zoomPercent}%
          </span>
        </div>
        <input
          id="hero-zoom"
          type="range"
          min={MIN_ZOOM * 100}
          max={MAX_ZOOM * 100}
          step={5}
          value={zoomPercent}
          disabled={disabled}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          className="w-full accent-[#154734] disabled:opacity-40"
        />
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>100%</span>
          <span>250%</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          ref={frameRef}
          role="presentation"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`relative mx-auto w-full max-w-full ${frame.aspectClass} rounded-xl overflow-hidden bg-gray-900 border border-gray-200 cursor-crosshair touch-none select-none ${
            disabled ? "opacity-60 pointer-events-none" : ""
          }`}
          style={{ maxWidth: Math.min(frame.width, 640) }}
        >
          {mediaType === "video" ? (
            <video
              key={previewSrc}
              src={previewSrc}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={mediaStyle(point)}
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <Image
              key={previewSrc}
              src={previewSrc}
              alt="Ajuste de encuadre"
              fill
              className="object-cover pointer-events-none"
              style={mediaStyle(point)}
              sizes="640px"
              draggable={false}
            />
          )}
          <div
            className="absolute z-10 w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-2 border-white bg-[#154734]/90 shadow-md pointer-events-none"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            aria-hidden
          />
          <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10" />
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center tabular-nums">
        {DEVICE_TABS.find((d) => d.id === device)?.label}: {point.x.toFixed(0)}% ·{" "}
        {point.y.toFixed(0)}% · zoom {zoomPercent}%
      </p>
    </div>
  );
}
