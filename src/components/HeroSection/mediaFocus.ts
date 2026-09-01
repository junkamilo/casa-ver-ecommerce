export type FocusPoint = { x: number; y: number; zoom: number };

export type MediaFocus = {
  mobile: FocusPoint;
  tablet: FocusPoint;
  desktop: FocusPoint;
};

export type MediaFocusDevice = keyof MediaFocus;

/** Zoom scale: 1 = sin zoom, hasta 2.5 = 250%. */
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 2.5;

/** Defaults matching previous hardcoded object-center / md:object-top. */
export const DEFAULT_MEDIA_FOCUS: MediaFocus = {
  mobile: { x: 50, y: 50, zoom: 1 },
  tablet: { x: 50, y: 40, zoom: 1 },
  desktop: { x: 50, y: 0, zoom: 1 },
};

function clampPercent(n: unknown, fallback: number): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(100, Math.max(0, v));
}

function clampZoom(n: unknown, fallback = 1): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(v * 100) / 100));
}

function normalizePoint(raw: unknown, fallback: FocusPoint): FocusPoint {
  if (!raw || typeof raw !== "object") return { ...fallback };
  const o = raw as Record<string, unknown>;
  return {
    x: clampPercent(o.x, fallback.x),
    y: clampPercent(o.y, fallback.y),
    zoom: clampZoom(o.zoom, fallback.zoom),
  };
}

export function normalizeMediaFocus(raw: unknown): MediaFocus {
  if (!raw || typeof raw !== "object") {
    return {
      mobile: { ...DEFAULT_MEDIA_FOCUS.mobile },
      tablet: { ...DEFAULT_MEDIA_FOCUS.tablet },
      desktop: { ...DEFAULT_MEDIA_FOCUS.desktop },
    };
  }
  const o = raw as Record<string, unknown>;
  return {
    mobile: normalizePoint(o.mobile, DEFAULT_MEDIA_FOCUS.mobile),
    tablet: normalizePoint(o.tablet, DEFAULT_MEDIA_FOCUS.tablet),
    desktop: normalizePoint(o.desktop, DEFAULT_MEDIA_FOCUS.desktop),
  };
}

export function focusPointToCss(point: FocusPoint): string {
  return `${point.x}% ${point.y}%`;
}

/** Inline CSS custom properties for responsive object-position + zoom. */
export function mediaFocusToCssVars(focus: MediaFocus): Record<string, string> {
  const f = normalizeMediaFocus(focus);
  return {
    "--hero-focus-mobile": focusPointToCss(f.mobile),
    "--hero-focus-tablet": focusPointToCss(f.tablet),
    "--hero-focus-desktop": focusPointToCss(f.desktop),
    "--hero-zoom-mobile": String(f.mobile.zoom),
    "--hero-zoom-tablet": String(f.tablet.zoom),
    "--hero-zoom-desktop": String(f.desktop.zoom),
  };
}
