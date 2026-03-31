import { z } from "zod";

/**
 * Schema Zod del formulario de checkout.
 * El usuario solo ingresa datos de contacto y envío.
 * El pago se completa en Bold (hosted checkout).
 */
export const checkoutSchema = z.object({
  email: z.string().trim().email("Ingresa un correo válido").max(254, "Correo demasiado largo"),

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

  city: z.string().trim().min(2, "Ciudad requerida").max(100, "Ciudad inválida"),

  department: z.string().trim().min(2, "Departamento requerido").max(100, "Departamento inválido"),

  paymentMethod: z.literal("BOLD"),

  savedAddressId: z.string().max(40, "ID inválido").optional(),

  couponCode: z.string().max(30, "Código demasiado largo").optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
