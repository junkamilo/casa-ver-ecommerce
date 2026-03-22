import * as z from "zod";

// ─── Regex compartido ────────────────────────────────────────────────────────
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_SPECIAL_REGEX = /[@$!%*?&._\-#^()+=]/;

// ─── Reglas de contraseña para el indicador visual ───────────────────────────
export const PASSWORD_RULES = [
  { label: "Mínimo 8 caracteres",               test: (v: string) => v.length >= 8 },
  { label: "Una letra mayúscula",                test: (v: string) => /[A-Z]/.test(v) },
  { label: "Una letra minúscula",                test: (v: string) => /[a-z]/.test(v) },
  { label: "Un número",                          test: (v: string) => /[0-9]/.test(v) },
  { label: "Un carácter especial (@$!%*?&._-#)", test: (v: string) => PASSWORD_SPECIAL_REGEX.test(v) },
] as const;

// ─── Schema de contraseña reutilizable ───────────────────────────────────────
export const passwordSchema = z
  .string()
  .min(8,  { message: "Mínimo 8 caracteres" })
  .max(100, { message: "La contraseña no puede superar los 100 caracteres" })
  .regex(/[A-Z]/,              { message: "Debe incluir al menos una mayúscula" })
  .regex(/[a-z]/,              { message: "Debe incluir al menos una minúscula" })
  .regex(/[0-9]/,              { message: "Debe incluir al menos un número" })
  .regex(PASSWORD_SPECIAL_REGEX, { message: "Debe incluir al menos un carácter especial (@$!%*?&._-#)" });

// ─── Schema de registro (servidor) ───────────────────────────────────────────
export const registerServerSchema = z.object({
  name: z
    .string()
    .min(2,  { message: "El nombre debe tener al menos 2 caracteres" })
    .max(50, { message: "El nombre no puede superar los 50 caracteres" })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, {
      message: "El nombre solo puede contener letras y espacios",
    }),
  email: z
    .string()
    .email({ message: "Correo electrónico inválido" })
    .max(100, { message: "El correo no puede superar los 100 caracteres" }),
  password: passwordSchema,
  recoveryEmail: z
    .string()
    .email({ message: "Correo de recuperación inválido" })
    .max(100)
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(/^\d{7,15}$/, { message: "Teléfono inválido" })
    .optional()
    .or(z.literal("")),
});

// ─── Schema nueva contraseña (servidor) ─────────────────────────────────────
export const resetPasswordServerSchema = z.object({
  tokenId:  z.string().min(1, { message: "Token requerido" }),
  password: passwordSchema,
});

// ─── Generador de código OTP criptográfico ───────────────────────────────────
export function generateSecureCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(100000 + (array[0] % 900000));
}
