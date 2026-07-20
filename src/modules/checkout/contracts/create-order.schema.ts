import { z } from "zod";
import { isValidMediaUrl } from "@/lib/media-url";

// ---------------------------------------------------------------------------
// Validaciones server-side del input de createOrder.
//
// Antes vivían como `if (...) return { success: false, error: ... }` dispersos
// en `src/app/actions/checkout.ts` (líneas 94-119). Aquí se centralizan en un
// solo schema Zod, preservando los mensajes de error literales que el frontend
// (useCheckout → submitError) ya muestra al usuario.
// ---------------------------------------------------------------------------

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const CEDULA_REGEX = /^\d{6,12}$/;
export const PHONE_REGEX = /^\d{10}$/;

const createOrderItemSchema = z.object({
  variantId: z.string().min(1),
  productId: z.string().min(1),
  name: z.string(),
  sku: z.string(),
  colorName: z.string(),
  size: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive().max(100),
  // Snapshot: solo Bunny; si viene URL externa se omite (no falla el pedido)
  imageUrl: z
    .string()
    .optional()
    .transform((v) => (v && isValidMediaUrl(v) ? v : undefined)),
});

export const createOrderInputSchema = z
  .object({
    email: z.string().min(1, "Faltan campos requeridos").regex(EMAIL_REGEX, "Correo electrónico inválido"),
    firstName: z.string().min(1, "Faltan campos requeridos").max(50, "Datos de dirección demasiado largos"),
    lastName: z.string().min(1, "Faltan campos requeridos").max(80, "Datos de dirección demasiado largos"),
    cedula: z.string().regex(CEDULA_REGEX, "Cédula inválida (6–12 dígitos numéricos)"),
    phone: z.string().regex(PHONE_REGEX, "Teléfono inválido (10 dígitos numéricos)"),

    address: z.string().min(1, "Faltan campos requeridos").max(200, "Datos de dirección demasiado largos"),
    addressDetail: z.string().optional(),
    city: z.string().min(1, "Faltan campos requeridos"),
    department: z.string().min(1, "Faltan campos requeridos"),
    savedAddressId: z.string().optional(),

    paymentMethod: z.enum(["BOLD", "ADDI"]),

    items: z.array(createOrderItemSchema).min(1, "El carrito está vacío"),

    // Montos del cliente (NO se validan más allá de tipo — se recalculan).
    subtotal: z.number().nonnegative(),
    shippingCost: z.number().nonnegative(),
    discount: z.number().nonnegative(),

    couponId: z.string().optional(),
    couponCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Refinamientos extra que ya validaba el código original como ifs separados.
    if (data.items.some((item) => item.price <= 0 || item.quantity <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Datos de producto inválidos",
        path: ["items"],
      });
    }
    if (data.items.some((item) => item.quantity > 100)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cantidad por producto excede el límite permitido",
        path: ["items"],
      });
    }
  });

export type CreateOrderInputSchema = z.infer<typeof createOrderInputSchema>;
