import { z } from "zod";

export const sendTestEmailSchema = z.object({
  customerEmail: z
    .string()
    .trim()
    .min(1, "Se requiere customerEmail")
    .email("Formato de email inválido"),
  customerName: z.string().trim().min(1, "Se requiere customerName"),
});