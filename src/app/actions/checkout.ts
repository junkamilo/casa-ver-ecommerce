"use server";

import { createOrderUseCase } from "@/modules/checkout/application/create-order.use-case";
import { verifyCaptcha } from "@/modules/checkout/infrastructure/verify-recaptcha";
import { markOrderPaidUseCase } from "@/modules/orders/application/mark-order-paid.use-case";
import { releaseOrderStockUseCase } from "@/modules/orders/application/release-order-stock.use-case";
import { quoteCheckoutShipping } from "@/modules/shipping/application/pos-shipping";

// ---------------------------------------------------------------------------
// Tipos públicos del Server Action — preservados byte-a-byte para que
// `useCheckout` y cualquier otro consumidor sigan funcionando sin cambios.
// ---------------------------------------------------------------------------

export interface CreateOrderInput {
  email: string;
  firstName: string;
  lastName: string;
  cedula: string;
  phone: string;

  address: string;
  addressDetail?: string;
  city: string;
  department: string;
  /** Si el usuario eligió una dirección guardada, se vincula a la orden */
  savedAddressId?: string;

  paymentMethod: "BOLD" | "ADDI";

  items: {
    variantId: string;
    productId: string;
    name: string;
    sku: string;
    colorName: string;
    size: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }[];

  subtotal: number;
  shippingCost: number;
  discount: number;

  /** Cupón del POS: se vuelve a validar contra el POS al crear la orden. */
  couponCode?: string;

  captchaToken?: string;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  transactionId?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// createOrder — Server Action wrapper.
//
// Delega en createOrderUseCase del módulo modules/checkout. Se mantiene aquí
// solo como punto de entrada Server Action para retro-compatibilidad con
// useCheckout y cualquier otro consumidor existente.
// ---------------------------------------------------------------------------
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const isHuman = await verifyCaptcha(input.captchaToken ?? "");
  if (!isHuman) {
    console.error("[createOrder] reCAPTCHA fallido");
    return {
      success: false,
      error: "Verificación de seguridad fallida. Intenta de nuevo.",
    };
  }
  const { captchaToken, ...orderInput } = input;
  void captchaToken;
  return createOrderUseCase(orderInput);
}

// ---------------------------------------------------------------------------
// releaseOrderStock — Server Action wrapper.
//
// Delega en releaseOrderStockUseCase del módulo modules/orders. Se mantiene
// aquí solo como punto de entrada Server Action para retro-compatibilidad
// con los webhooks de Bold/Addi y otros consumidores existentes.
// ---------------------------------------------------------------------------
export async function releaseOrderStock(
  transactionId: string,
  newStatus: "FAILED" | "REFUNDED" | "CANCELLED",
): Promise<void> {
  return releaseOrderStockUseCase(transactionId, newStatus);
}

// ---------------------------------------------------------------------------
// markOrderPaid — Server Action wrapper.
//
// Delega en markOrderPaidUseCase del módulo modules/orders. Se mantiene
// aquí solo como punto de entrada Server Action para retro-compatibilidad
// con los webhooks de Bold/Addi y otros consumidores existentes.
// ---------------------------------------------------------------------------
export async function markOrderPaid(transactionId: string, paymentId: string) {
  return markOrderPaidUseCase(transactionId, paymentId);
}

/** Precio de envío para el checkout: lo calcula el POS (tarifas, cobertura y envío gratis). */
export async function getShippingCostAction(input: {
  cityName?: string;
  departmentName?: string;
  subtotalNeto: number;
}) {
  return quoteCheckoutShipping(input);
}
