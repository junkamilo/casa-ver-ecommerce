import { EmailProviderService } from "../infrastructure/email-provider.service";
import { maskApiKey } from "../domain/email-test.entity";
import type { EmailDiagnosticResponseDTO } from "../contracts/email-test.dto";

const emailProvider = new EmailProviderService();

export function getEmailDiagnosticUseCase(apiKey?: string): EmailDiagnosticResponseDTO {
  const config = emailProvider.getConfigStatus();
  const { length, prefix } = maskApiKey(apiKey);

  return {
    status: config.isConfigured ? "✅ Configurado" : "❌ No configurado",
    apiKeyConfigured: !!apiKey,
    apiKeyLength: length,
    apiKeyPrefix: prefix,
    fromEmail: "noreply@casaverdeoficial.com",
    warnings: config.warnings || [],
    timestamp: new Date().toISOString(),
  };
}