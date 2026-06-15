import type {
  ActivePromoPopupDTO,
  CreatePromoPopupInputDTO,
  PromoPopupDetailDTO,
  PromoPopupListResponseDTO,
  UpdatePromoPopupInputDTO,
} from "../contracts/promo-popup.dto";

const PROMO_POPUPS_API = "/api/admin/promo-popups";

type ApiErrorPayload = {
  message?: string;
  error?: string;
};

export class AdminPromoPopupsApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminPromoPopupsApiError";
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

  throw new AdminPromoPopupsApiError(message, response.status);
}

export async function fetchPromoPopups(): Promise<PromoPopupListResponseDTO> {
  const response = await fetch(PROMO_POPUPS_API);
  return (await assertOk(response)) as PromoPopupListResponseDTO;
}

export async function createPromoPopup(
  payload: CreatePromoPopupInputDTO
): Promise<PromoPopupDetailDTO> {
  const response = await fetch(PROMO_POPUPS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await assertOk(response)) as PromoPopupDetailDTO;
}

export async function updatePromoPopup(
  payload: UpdatePromoPopupInputDTO
): Promise<PromoPopupDetailDTO> {
  const response = await fetch(`${PROMO_POPUPS_API}/${payload.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await assertOk(response)) as PromoPopupDetailDTO;
}

export async function togglePromoPopupActive(
  id: string,
  isActive: boolean
): Promise<PromoPopupDetailDTO> {
  const response = await fetch(`${PROMO_POPUPS_API}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });
  return (await assertOk(response)) as PromoPopupDetailDTO;
}

export async function deletePromoPopup(id: string): Promise<{ success: boolean; id: string }> {
  const response = await fetch(`${PROMO_POPUPS_API}/${id}`, { method: "DELETE" });
  return (await assertOk(response)) as { success: boolean; id: string };
}

export async function fetchActivePromoPopup(
  placement: ActivePromoPopupDTO["placement"]
): Promise<ActivePromoPopupDTO | null> {
  const response = await fetch(`/api/promo-popups/active?placement=${placement}`);
  if (response.status === 404) return null;
  const payload = await parseResponse(response);
  if (!response.ok) return null;
  return (payload as { data: ActivePromoPopupDTO | null }).data ?? null;
}
