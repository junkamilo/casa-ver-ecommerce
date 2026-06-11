import { z } from "zod";

export const createBoldPaymentInputSchema = z.object({
  orderId: z.string().trim().min(1, "orderId inválido"),
});

export type CreateBoldPaymentInputSchema = z.infer<typeof createBoldPaymentInputSchema>;

export const verifyBoldPaymentInputSchema = z.object({
  referenceId: z.string().min(1, "reference_id requerido"),
});

export type VerifyBoldPaymentInputSchema = z.infer<typeof verifyBoldPaymentInputSchema>;
