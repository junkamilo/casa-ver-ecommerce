import { sendTestEmailSchema } from "../contracts/email-test.schema";
import { createMockOrderPayload } from "../domain/email-test.entity";
import { EmailProviderService } from "../infrastructure/email-provider.service";
import { EmailTestUnauthorizedError, EmailTestValidationError, EmailConfigUnavailableError } from "./email-test.errors";
import type { SendTestEmailResponseDTO } from "../contracts/email-test.dto";

const emailProvider = new EmailProviderService();

export async function sendTestEmailUseCase(
  input: unknown,
  authContext: { userRole?: string; providedCliSecret?: string | null; envCliSecret?: string }
): Promise<SendTestEmailResponseDTO> {
  
  // 1. Validación de Autorización
  const isCliAuth = authContext.providedCliSecret && authContext.providedCliSecret === authContext.envCliSecret;
  if (!isCliAuth && authContext.userRole !== "ADMIN") {
    throw new EmailTestUnauthorizedError();
  }

  // 2. Validación de Entrada (Schema Zod)
  const parsed = sendTestEmailSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new EmailTestValidationError(firstIssue?.message ?? "Datos inválidos en el body");
  }

  // 3. Verificación de Salud del Servicio
  const config = emailProvider.getConfigStatus();
  if (!config.isConfigured) {
    throw new EmailConfigUnavailableError("Servicio de email no configurado", config.warnings || []);
  }

  // 4. Armado de payload utilizando el Dominio
  const orderPayload = createMockOrderPayload(parsed.data.customerEmail, parsed.data.customerName);

  // 5. Envío
  const result = await emailProvider.dispatchTestEmail(orderPayload);

  if (!result.success) {
    throw new Error(result.error || "Error desconocido al intentar enviar el email");
  }

  return {
    success: true,
    message: `✅ Email enviado exitosamente a ${parsed.data.customerEmail}`,
    messageId: result.messageId,
    timestamp: new Date().toISOString(),
  };
}