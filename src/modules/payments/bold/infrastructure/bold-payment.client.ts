import type {
  BoldTransactionStatusDTO,
  BoldPseBankDTO,
} from "../contracts/bold.dto";

// ---------------------------------------------------------------------------
// Bold — API endpoints (FUENTE ÚNICA del módulo de pagos)
//
//   BOLD_LINK_API           = https://integrations.api.bold.co/online/link/v1
//     - POST  → crear link de pago
//     - GET   → consultar estado del link
//
//   BOLD_PAYMENT_API_BASE   = https://api.online.payments.bold.co
//     - GET /v1/payment/pse/banks
//     - GET /payments/webhook/notifications/{transactionId}?is_external_reference=true
// ---------------------------------------------------------------------------

const BOLD_LINK_API = "https://integrations.api.bold.co/online/link/v1";
const BOLD_PAYMENT_API_BASE = "https://api.online.payments.bold.co";

export interface CreateBoldLinkInput {
  reference: string;
  totalAmount: number;
  payerEmail?: string;
  callbackUrl: string;
  identityKey: string;
}

export interface CreateBoldLinkResponse {
  ok: true;
  paymentLink: string;
  checkoutUrl: string;
}

export interface CreateBoldLinkError {
  ok: false;
  status: number;
  errorCode?: string;
}

export interface BoldLinkStatusRaw {
  // Bold puede devolver el status en raíz o anidado en payload.
  status?: string;
  payload?: { status?: string };
  payment_id?: string;
  transaction_id?: string;
  id?: string;
  // Otros campos que Bold incluye en la respuesta.
  [key: string]: unknown;
}

export class BoldPaymentClient {
  // POST /online/link/v1 → crea el link de pago.
  async createLink(input: CreateBoldLinkInput): Promise<CreateBoldLinkResponse | CreateBoldLinkError> {
    const boldBody = {
      amount_type: "CLOSE",
      amount: {
        currency: "COP",
        total_amount: input.totalAmount,
        tip_amount: 0,
      },
      reference: input.reference,
      description: "Compra en Casa Verde",
      callback_url: input.callbackUrl,
      ...(input.payerEmail ? { payer_email: input.payerEmail } : {}),
    };

    const response = await fetch(BOLD_LINK_API, {
      method: "POST",
      headers: {
        Authorization: `x-api-key ${input.identityKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(boldBody),
    });

    if (!response.ok) {
      let errorCode: string | undefined;
      try {
        const errBody = await response.json();
        errorCode = errBody?.code ?? errBody?.message ?? undefined;
      } catch {
        /* sin body JSON */
      }
      return { ok: false, status: response.status, errorCode };
    }

    const data = await response.json();
    const paymentLink: string | undefined = data?.payload?.payment_link;
    const checkoutUrl: string | undefined = data?.payload?.url;

    if (!checkoutUrl || !paymentLink) {
      return { ok: false, status: response.status };
    }

    return { ok: true, paymentLink, checkoutUrl };
  }

  // GET /online/link/v1/{boldLinkId} → consultar estado del link.
  async getLinkStatus(
    boldLinkId: string,
    identityKey: string
  ): Promise<{ ok: true; data: BoldLinkStatusRaw } | { ok: false; status: number; body?: string }> {
    const response = await fetch(`${BOLD_LINK_API}/${encodeURIComponent(boldLinkId)}`, {
      headers: { Authorization: `x-api-key ${identityKey}` },
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text();
      return { ok: false, status: response.status, body };
    }

    const data = (await response.json()) as BoldLinkStatusRaw;
    return { ok: true, data };
  }

  // GET /payments/webhook/notifications/{transactionId}?is_external_reference=true
  // Usado por boldFallback admin para reconciliar órdenes huérfanas.
  async queryByReference(
    transactionId: string,
    apiKey: string
  ): Promise<BoldTransactionStatusDTO> {
    try {
      const url = `${BOLD_PAYMENT_API_BASE}/payments/webhook/notifications/${encodeURIComponent(transactionId)}?is_external_reference=true`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `x-api-key ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const body = await response.text();
        return { error: `Bold API ${response.status}: ${body.slice(0, 200)}` };
      }

      const data = await response.json();

      const status = data?.data?.status ?? data?.status ?? data?.payload?.status;
      const boldPaymentId = data?.data?.id ?? data?.id ?? data?.payload?.id;

      return { status, boldPaymentId };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Error de red" };
    }
  }

  // GET /v1/payment/pse/banks → lista de bancos PSE (cacheada 1h).
  // Soporta dos shapes que Bold ha usado:
  //   - { payload: { banks: [...] } }
  //   - { financial_institutions: [...] } | array directo
  async listPseBanks(
    apiKey: string
  ): Promise<{ ok: true; banks: BoldPseBankDTO[] } | { ok: false; status: number }> {
    const response = await fetch(`${BOLD_PAYMENT_API_BASE}/v1/payment/pse/banks`, {
      headers: { Authorization: `x-api-key ${apiKey}` },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return { ok: false, status: response.status };
    }

    const data = await response.json();
    const banks: BoldPseBankDTO[] = Array.isArray(data)
      ? data
      : (data?.payload?.banks ?? data?.financial_institutions ?? data?.banks ?? []);

    return { ok: true, banks };
  }
}
