import * as z from "zod";

// Regex: letras, números y . _ % + - antes del @; dominio estándar; sin caracteres raros
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo es requerido" })
    .regex(EMAIL_REGEX, { message: "Ingresa un correo electrónico válido" }),
  password: z
    .string()
    .min(1, { message: "La contraseña es requerida" }),
});

export const ERROR_MESSAGES = {
  invalidCredentials: "Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.",
  notVerified: "Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.",
  useGoogle: "Esta cuenta fue creada con Google. Inicia sesión con el botón de Google.",
  unexpected: "Ocurrió un error inesperado. Intenta de nuevo.",
} as const;
