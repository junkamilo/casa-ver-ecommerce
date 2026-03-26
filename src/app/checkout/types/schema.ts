import { z } from "zod";

/**
 * Schema Zod del formulario de checkout.
 * Fuente única de verdad — importado por el hook y por los componentes.
 */
export const checkoutSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),

  firstName: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, "Solo letras"),

  lastName: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(80, "Máximo 80 caracteres")
    .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, "Solo letras"),

  cedula: z
    .string()
    .min(6, "Mínimo 6 dígitos")
    .max(12, "Máximo 12 dígitos")
    .regex(/^\d+$/, "Solo números"),

  phone: z
    .string()
    .length(10, "Debe tener exactamente 10 dígitos")
    .regex(/^\d+$/, "Solo números"),

  address: z
    .string()
    .min(5, "Dirección muy corta")
    .max(200, "Dirección muy larga"),

  addressDetail: z.string().max(100, "Máximo 100 caracteres").optional(),

  city: z.string().min(2, "Ciudad requerida"),

  department: z.string().min(2, "Departamento requerido"),

  paymentMethod: z.enum(["BOLD"]),

  savedAddressId: z.string().optional(),

  couponCode: z.string().max(30, "Código demasiado largo").optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
