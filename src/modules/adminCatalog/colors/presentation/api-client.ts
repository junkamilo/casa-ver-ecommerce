import type {
  ColorListItemDTO,
  CreateColorInputDTO,
  ToggleColorInputDTO,
  UpdateColorInputDTO,
} from "../contracts/color.dto";

const COLORS_API = "/api/admin/colors";

type ApiErrorPayload = {
  message?: string;
  error?: string;
};

export class AdminColorsApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminColorsApiError";
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
      : (payload as ApiErrorPayload | null)?.message ??
        (payload as ApiErrorPayload | null)?.error ??
        `HTTP ${response.status}`;

  throw new AdminColorsApiError(message, response.status);
}

export async function fetchAdminColors(params?: { active?: boolean }): Promise<ColorListItemDTO[]> {
  const searchParams = new URLSearchParams();
  if (params?.active) searchParams.set("active", "true");
  const query = searchParams.toString();

  const response = await fetch(query ? `${COLORS_API}?${query}` : COLORS_API);
  return (await assertOk(response)) as ColorListItemDTO[];
}

export async function createAdminColor(payload: CreateColorInputDTO): Promise<ColorListItemDTO> {
  const response = await fetch(COLORS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await assertOk(response)) as ColorListItemDTO;
}

export async function updateAdminColor(
  id: string,
  payload: Omit<UpdateColorInputDTO, "id">
): Promise<ColorListItemDTO> {
  const response = await fetch(`${COLORS_API}?id=${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await assertOk(response)) as ColorListItemDTO;
}

export async function toggleAdminColor(id: string): Promise<ColorListItemDTO> {
  const payload: Omit<ToggleColorInputDTO, "id"> = { action: "toggle" };

  const response = await fetch(`${COLORS_API}?id=${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await assertOk(response)) as ColorListItemDTO;
}

export async function deleteAdminColor(id: string): Promise<{ success: boolean; id: string }> {
  const response = await fetch(`${COLORS_API}?id=${id}`, { method: "DELETE" });
  return (await assertOk(response)) as { success: boolean; id: string };
}
