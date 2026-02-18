import * as z from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 letras" }),
  email: z.string().email({ message: "Ingresa un correo válido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

export const ERROR_MESSAGES = {
  loginAfterRegister: "Cuenta creada, pero hubo un error al iniciar sesión.",
  unexpected: "Error al registrarse",
} as const;

export const SUCCESS_MESSAGES = {
  accountCreated: "¡Cuenta creada con éxito! Iniciando sesión...",
} as const;
