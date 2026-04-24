import { z } from "zod";
import { sendTestEmailSchema } from "./email-test.schema";

export type SendTestEmailInputDTO = z.infer<typeof sendTestEmailSchema>;

export interface EmailDiagnosticResponseDTO {
  status: string;
  apiKeyConfigured: boolean;
  apiKeyLength: number;
  apiKeyPrefix: string;
  fromEmail: string;
  warnings: string[];
  timestamp: string;
}

export interface SendTestEmailResponseDTO {
  success: boolean;
  message?: string;
  messageId?: string;
  error?: string;
  timestamp: string;
}