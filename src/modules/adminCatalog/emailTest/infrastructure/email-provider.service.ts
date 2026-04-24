import { validateEmailConfig, sendOrderConfirmationEmail } from "@/services/email/client";

export class EmailProviderService {
  getConfigStatus() {
    return validateEmailConfig();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async dispatchTestEmail(payload: any) {
    return sendOrderConfirmationEmail(payload);
  }
}