import { z } from "zod";

// Espejo de `WebAdminPublicationService` del POS (GET /api/public/admins y POST /api/public/admins/verify).

export const posWebAdminSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().min(1),
  updatedAt: z.string().nullish(),
});

export const posWebAdminVerificationSchema = z.object({
  valid: z.boolean(),
  admin: posWebAdminSchema.nullish(),
});

export type PosWebAdmin = z.infer<typeof posWebAdminSchema>;
export type PosWebAdminVerification = z.infer<typeof posWebAdminVerificationSchema>;
