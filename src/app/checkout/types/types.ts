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

export type BoldSubMethod =
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "PSE"
  | "NEQUI"
  | "BOTON_BANCOLOMBIA";

export interface PseBank {
  financial_institution_code: string;
  financial_institution_name: string;
}

export interface CardFormData {
  cardNumber: string;
  cardholderName: string;
  expirationMonth: string;
  expirationYear: string;
  cvc: string;
  installments: number;
}

export interface CouponState {
  code: string;
  status: "idle" | "validating" | "valid" | "invalid";
  discountPercentage: number;
  couponId?: string;
  errorMessage?: string;
}
