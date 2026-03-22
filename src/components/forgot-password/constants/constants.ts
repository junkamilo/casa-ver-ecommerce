import * as z from "zod";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export const recoveryEmailSchema = z.object({
  recoveryEmail: z
    .string()
    .min(1, { message: "El correo de recuperación es requerido" })
    .regex(EMAIL_REGEX, { message: "Ingresa un correo electrónico válido" }),
});

const passwordRules = z
  .string()
  .min(8, { message: "Mínimo 8 caracteres" })
  .regex(/[A-Z]/, { message: "Debe incluir al menos una mayúscula" })
  .regex(/[a-z]/, { message: "Debe incluir al menos una minúscula" })
  .regex(/[0-9]/, { message: "Debe incluir al menos un número" })
  .regex(/[@$!%*?&._\-#^()+=]/, { message: "Debe incluir al menos un carácter especial" });

export const newPasswordSchema = z
  .object({
    password: passwordRules,
    confirmPassword: z.string().min(1, { message: "Confirma tu contraseña" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const PASSWORD_RULES = [
  { label: "Mínimo 8 caracteres",              test: (v: string) => v.length >= 8 },
  { label: "Una letra mayúscula",               test: (v: string) => /[A-Z]/.test(v) },
  { label: "Una letra minúscula",               test: (v: string) => /[a-z]/.test(v) },
  { label: "Un número",                         test: (v: string) => /[0-9]/.test(v) },
  { label: "Un carácter especial (@$!%*?&._-#)", test: (v: string) => /[@$!%*?&._\-#^()+=]/.test(v) },
];

export const ERROR_MESSAGES = {
  generic:     "Ocurrió un error inesperado. Intenta de nuevo.",
  notFound:    "Si el correo existe en nuestra base de datos, recibirás un código.",
} as const;
