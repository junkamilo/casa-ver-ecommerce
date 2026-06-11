import type { AdminLookupResponseDTO, AdminUserDTO } from "../contracts/user-admin.dto";

const USERS_API = "/api/admin/users";

type ApiErrorPayload = { message?: string; error?: string };

export class AdminUsersApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminUsersApiError";
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

  throw new AdminUsersApiError(message, response.status);
}

export type CreateAdminPayload = {
  name?: string;
  email: string;
  password?: string;
};

export type CreateAdminResponse = {
  id: string;
  name: string | null;
  email: string;
  promoted?: boolean;
};

export type RevokeAdminResponse = {
  message: string;
};

export async function fetchAdminUsers(): Promise<AdminUserDTO[]> {
  const response = await fetch(USERS_API);
  return (await assertOk(response)) as AdminUserDTO[];
}

export async function lookupAdminUserByEmail(email: string): Promise<AdminLookupResponseDTO> {
  const response = await fetch(`${USERS_API}?lookup=${encodeURIComponent(email)}`);
  return (await assertOk(response)) as AdminLookupResponseDTO;
}

export async function createAdminUser(payload: CreateAdminPayload): Promise<CreateAdminResponse> {
  const response = await fetch(USERS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await assertOk(response)) as CreateAdminResponse;
}

export async function revokeAdminUser(id: string): Promise<RevokeAdminResponse> {
  const response = await fetch(`${USERS_API}?id=${id}`, {
    method: "DELETE",
  });
  return (await assertOk(response)) as RevokeAdminResponse;
}
