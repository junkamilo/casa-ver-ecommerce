import * as z from "zod";
import { EMAIL_REGEX, passwordSchema } from "@/lib/auth/validation";

// Re-exportar PASSWORD_RULES para uso de los componentes del flujo
export { PASSWORD_RULES } from "@/lib/auth/validation";

export const recoveryEmailSchema = z.object({
  recoveryEmail: z
    .string()
    .min(1, { message: "El correo de recuperación es requerido" })
    .regex(EMAIL_REGEX, { message: "Ingresa un correo electrónico válido" }),
});

export const newPasswordSchema = z
  .object({
    password:        passwordSchema,
    confirmPassword: z.string().min(1, { message: "Confirma tu contraseña" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const ERROR_MESSAGES = {
  generic:  "Ocurrió un error inesperado. Intenta de nuevo.",
  notFound: "Si el correo existe en nuestra base de datos, recibirás un código.",
} as const;
