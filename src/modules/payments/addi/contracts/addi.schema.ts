import { z } from "zod";

export const CEDULA_REGEX = /^\d{6,12}$/;
export const ADDI_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const ADDI_CALLBACK_STATUSES = [
  "APPROVED",
  "PENDING",
  "REJECTED",
  "ABANDONED",
  "DECLINED",
  "INTERNAL_ERROR",
] as const;

export const createAddiApplicationInputSchema = z.object({
  orderId: z.string().trim().min(1, "orderId inválido"),
  cedula: z
    .string()
    .regex(CEDULA_REGEX, "Cédula inválida (6–12 dígitos numéricos)"),
});

export type CreateAddiApplicationInputSchema = z.infer<typeof createAddiApplicationInputSchema>;

// Validadores granulares (corresponden a las funciones isValid* del callback original)
export function isValidOrderId(value: unknown): value is string {
  return typeof value === "string" && ADDI_UUID_REGEX.test(value);
}

export function isValidApplicationId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length >= 4 && value.trim().length <= 128;
}

export function isValidCallbackStatus(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (ADDI_CALLBACK_STATUSES as readonly string[]).includes(value.toUpperCase())
  );
}
