const HERO_API = "/api/admin/hero";
const HERO_SETTINGS_API = "/api/admin/hero/settings";

type ApiErrorPayload = {
  error?: string;
  message?: string;
};

export class HeroApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HeroApiError";
    this.status = status;
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  return text || null;
}

async function assertOk(response: Response): Promise<unknown> {
  const payload = await parseResponse(response);
  if (response.ok) return payload;

  const message =
    typeof payload === "string"
      ? payload
      : (payload as ApiErrorPayload | null)?.error ??
        (payload as ApiErrorPayload | null)?.message ??
        `HTTP ${response.status}`;

  throw new HeroApiError(message, response.status);
}

export type MediaFocusPayload = {
  mobile: { x: number; y: number; zoom?: number };
  tablet: { x: number; y: number; zoom?: number };
  desktop: { x: number; y: number; zoom?: number };
};

export type SaveHeroSlidePayload = {
  mediaUrl: string;
  mediaUrlMobile?: string | null;
  mediaUrlTablet?: string | null;
  mediaType: "image" | "video";
  headline: string;
  subheadline: string;
  mediaFocus?: MediaFocusPayload;
  playFullVideo?: boolean;
};

export type UpdateHeroSlidePayload = {
  id: string;
  mediaUrl?: string;
  mediaUrlMobile?: string | null;
  mediaUrlTablet?: string | null;
  mediaType?: "image" | "video";
  headline?: string | null;
  subheadline?: string | null;
  isActive?: boolean;
  mediaFocus?: MediaFocusPayload;
  playFullVideo?: boolean;
};

export type SavedHeroSlideResponse = {
  id: string;
  position?: number;
  mediaUrl?: string;
  mediaUrlMobile?: string | null;
  mediaUrlTablet?: string | null;
  posterUrl?: string | null;
  mediaType?: string;
  headline?: string | null;
  subheadline?: string | null;
  isActive?: boolean;
  mediaFocus?: MediaFocusPayload | null;
  playFullVideo?: boolean;
};

export type HeroSettingsResponse = {
  id?: number;
  slideDurationMs: number;
  updatedAt?: string;
};

export async function createHeroSlide(payload: SaveHeroSlidePayload) {
  const response = await fetch(HERO_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await assertOk(response)) as SavedHeroSlideResponse;
}

export async function updateHeroSlide(payload: UpdateHeroSlidePayload) {
  const response = await fetch(HERO_API, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await assertOk(response)) as SavedHeroSlideResponse;
}

export type DeleteHeroSlideResponse = {
  ok: boolean;
  mediaCleanupFailed?: boolean;
};

export async function deleteHeroSlide(id: string) {
  const response = await fetch(`${HERO_API}?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return (await assertOk(response)) as DeleteHeroSlideResponse;
}

export async function fetchHeroSettings() {
  const response = await fetch(HERO_SETTINGS_API, { method: "GET" });
  return (await assertOk(response)) as HeroSettingsResponse;
}

export async function updateHeroSettings(payload: { slideDurationMs: number }) {
  const response = await fetch(HERO_SETTINGS_API, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await assertOk(response)) as HeroSettingsResponse;
}
