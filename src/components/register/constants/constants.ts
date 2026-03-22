import * as z from "zod";

export const registerSchema = z.object({
  // ── Nombre: solo letras y espacios (incluye acentos y ñ), 2-50 chars
  name: z
    .string()
    .min(1, { message: "El nombre es obligatorio" })
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(50, { message: "El nombre no puede superar los 50 caracteres" })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, {
      message: "El nombre solo puede contener letras y espacios, sin números ni caracteres especiales",
    }),

  // ── Correo: formato válido con @ y dominio (obligatorio)
  email: z
    .string()
    .min(1, { message: "El correo electrónico es obligatorio" })
    .email({ message: "Ingresa un correo válido (ejemplo: usuario@dominio.com)" })
    .max(100, { message: "El correo no puede superar los 100 caracteres" }),

  // ── Contraseña: 8-20 chars, mayúscula, minúscula, número y carácter especial
  password: z
    .string()
    .min(1, { message: "La contraseña es obligatoria" })
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .max(20, { message: "La contraseña no puede superar los 20 caracteres" })
    .regex(/[A-Z]/, { message: "Debe incluir al menos una letra mayúscula" })
    .regex(/[a-z]/, { message: "Debe incluir al menos una letra minúscula" })
    .regex(/[0-9]/, { message: "Debe incluir al menos un número" })
    .regex(/[@$!%*?&._\-#^()+=]/, {
      message: "Debe incluir al menos un carácter especial (@ $ ! % * ? & . _ - #)",
    }),

  // ── Correo de recuperación: opcional, mismo formato que email
  recoveryEmail: z
    .string()
    .email({ message: "Ingresa un correo válido (ejemplo: usuario@dominio.com)" })
    .max(100, { message: "El correo no puede superar los 100 caracteres" })
    .optional()
    .or(z.literal("")),

  // ── Celular: solo dígitos, 7-15 números (opcional)
  phone: z
    .string()
    .regex(/^\d{7,15}$/, {
      message: "Solo se permiten números, entre 7 y 15 dígitos",
    })
    .optional()
    .or(z.literal("")),
});

export const ERROR_MESSAGES = {
  loginAfterRegister: "Cuenta creada, pero hubo un error al iniciar sesión.",
  unexpected: "Error al registrarse",
} as const;

export const SUCCESS_MESSAGES = {
  accountCreated: "¡Cuenta creada! Te enviamos un código de verificación.",
  accountVerified: "¡Correo verificado! Iniciando sesión...",
} as const;
