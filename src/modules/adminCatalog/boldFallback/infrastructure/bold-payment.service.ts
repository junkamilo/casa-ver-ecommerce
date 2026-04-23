import type { BoldTransactionStatusDTO } from "../contracts/bold-fallback.dto";

const BOLD_API_BASE = "https://api.online.payments.bold.co";

export class BoldPaymentService {
  async queryByReference(transactionId: string, apiKey: string): Promise<BoldTransactionStatusDTO> {
    try {
      const url = `${BOLD_API_BASE}/payments/webhook/notifications/${encodeURIComponent(transactionId)}?is_external_reference=true`;

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
}