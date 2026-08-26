const HERO_API = "/api/admin/hero";

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

export type SaveHeroSlidePayload = {
  id?: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  headline: string;
  subheadline: string;
};

type SavedHeroSlideResponse = {
  id: string;
};

export async function createHeroSlide(payload: Omit<SaveHeroSlidePayload, "id">) {
  const response = await fetch(HERO_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await assertOk(response)) as SavedHeroSlideResponse;
}

export async function updateHeroSlide(
  payload: Required<Pick<SaveHeroSlidePayload, "id">> & Omit<SaveHeroSlidePayload, "id">
) {
  const response = await fetch(HERO_API, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await assertOk(response)) as SavedHeroSlideResponse;
}

export async function deleteHeroSlide(id: string) {
  const response = await fetch(`${HERO_API}?id=${id}`, { method: "DELETE" });
  return assertOk(response);
}
