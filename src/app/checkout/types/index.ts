import type { StaticImageData } from "next/image";

// Re-export del schema para que los componentes importen desde un solo lugar
export type { CheckoutFormData } from "./schema";

// ---------------------------------------------------------------------------
// Carrito / ítem de checkout
// ---------------------------------------------------------------------------
export interface CheckoutItem {
  id: string;
  variantId: string;
  productId: string;
  name: string;
  price: number;
  image: StaticImageData | string;
  color: string;
  size: string;
  quantity: number;
  sku: string;
}

// ---------------------------------------------------------------------------
// Cupón
// ---------------------------------------------------------------------------
export interface CouponState {
  code: string;
  status: "idle" | "validating" | "valid" | "invalid";
  discountPercentage: number;
  discountType?: "PERCENTAGE" | "FIXED";
  discountValue?: number;
  couponId?: string;
  errorMessage?: string;
}

// ---------------------------------------------------------------------------
// Dirección guardada del perfil (compartida entre AuthenticatedDelivery y hook)
// ---------------------------------------------------------------------------
export interface SavedAddress {
  id: string;
  fullName: string;
  cedula: string | null;
  phone: string;
  department: string;
  city: string;
  address: string;
  addressDetail: string | null;
  isDefault: boolean;
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------
// Métodos de pago disponibles en el formulario. Debe coincidir con el enum
// `paymentMethod` del schema Zod (BOLD | ADDI). Antes era solo "BOLD" — bug
// pre-existente que ahora queda alineado.
export type PaymentMethodUI = "BOLD" | "ADDI";
