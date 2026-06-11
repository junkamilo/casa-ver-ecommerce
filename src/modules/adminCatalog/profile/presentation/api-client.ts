import type {
  AdminProfileDTO,
  UpdateAdminProfileInputDTO,
} from "../contracts/profile.dto";

const PROFILE_API = "/api/profile";

type ApiErrorPayload = {
  message?: string;
  error?: string;
};

export class AdminProfileApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminProfileApiError";
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

  throw new AdminProfileApiError(message, response.status);
}

export async function fetchAdminProfile(): Promise<AdminProfileDTO> {
  const response = await fetch(PROFILE_API);
  return (await assertOk(response)) as AdminProfileDTO;
}

export async function updateAdminProfile(
  payload: UpdateAdminProfileInputDTO
): Promise<AdminProfileDTO> {
  const response = await fetch(PROFILE_API, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await assertOk(response)) as AdminProfileDTO;
}
