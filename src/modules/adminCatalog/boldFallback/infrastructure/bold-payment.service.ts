import { BoldPaymentClient } from "@/modules/payments/bold/infrastructure/bold-payment.client";
import type { BoldTransactionStatusDTO } from "../contracts/bold-fallback.dto";

// Wrapper delgado sobre BoldPaymentClient (modules/payments/bold) para
// preservar la API pública de boldFallback. La fuente única de las
// llamadas HTTP a Bold ahora vive en modules/payments/bold.
export class BoldPaymentService {
  private readonly client = new BoldPaymentClient();

  async queryByReference(
    transactionId: string,
    apiKey: string
  ): Promise<BoldTransactionStatusDTO> {
    return this.client.queryByReference(transactionId, apiKey);
  }
}
