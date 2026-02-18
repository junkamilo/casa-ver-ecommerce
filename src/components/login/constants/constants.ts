import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Ingresa un correo válido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

export const ERROR_MESSAGES = {
  invalidCredentials: "Correo o contraseña incorrectos",
  unexpected: "Ocurrió un error inesperado",
} as const;
