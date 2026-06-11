import type { AdminOrderDTO, UpdateOrderStatusInputDTO } from "../contracts/order-admin.dto";

const ORDERS_API = "/api/admin/orders";

type ApiErrorPayload = {
  message?: string;
  error?: string;
};

export class AdminOrdersApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminOrdersApiError";
    this.status = status;
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json();
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

  throw new AdminOrdersApiError(message, response.status);
}

export async function fetchAdminOrders(): Promise<AdminOrderDTO[]> {
  const response = await fetch(ORDERS_API);
  return (await assertOk(response)) as AdminOrderDTO[];
}

export async function updateAdminOrderStatus(payload: UpdateOrderStatusInputDTO): Promise<void> {
  const response = await fetch(ORDERS_API, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await assertOk(response);
}
