import type { StaticImageData } from "next/image";
import type { z } from "zod";
import type { checkoutSchema } from "../hooks/useCheckout";

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

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export type PaymentMethodUI = "BOLD";

export interface CouponState {
  code: string;
  status: "idle" | "validating" | "valid" | "invalid";
  discountPercentage: number;
  couponId?: string;
  errorMessage?: string;
}
