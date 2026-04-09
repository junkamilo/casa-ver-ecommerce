import * as z from "zod";
import { EMAIL_REGEX } from "@/lib/auth/validation";

// ── Esquema de validación ─────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo es requerido" })
    .regex(EMAIL_REGEX, { message: "Ingresa un correo electrónico válido" }),
  password: z
    .string()
    .min(1, { message: "La contraseña es requerida" }),
});

// ── Mensajes de error localizados ─────────────────────────────────────────────
export const ERROR_MESSAGES = {
  invalidCredentials: "Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.",
  notVerified:        "Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.",
  useGoogle:          "Esta cuenta fue creada con Google. Inicia sesión con el botón de Google.",
  unexpected:         "Ocurrió un error inesperado. Intenta de nuevo.",
} as const;

// ── Mapa de códigos NextAuth → mensaje legible ────────────────────────────────
export const CREDENTIAL_ERROR_MAP: Record<string, string> = {
  invalid_credentials: ERROR_MESSAGES.invalidCredentials,
  use_google:          ERROR_MESSAGES.useGoogle,
  email_not_verified:  ERROR_MESSAGES.notVerified,
};
