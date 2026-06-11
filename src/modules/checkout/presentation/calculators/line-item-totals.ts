import { EARLY_BIRD_DISCOUNT_PCT } from "@/lib/earlybird.constants";

// ---------------------------------------------------------------------------
// Calculators puros para los componentes de UI del checkout.
//
// Hasta antes de esta migración, `OrderSummaryPanel` y `CheckoutMobileSummary`
// duplicaban byte-a-byte el cálculo del total por línea con descuento Early
// Bird. Ahora ambos llaman a `calcLineItemDisplayTotals` que centraliza la
// regla:
//
//   originalTotal   = price * quantity
//   discountedTotal = round(originalTotal * (1 - EARLY_BIRD_DISCOUNT_PCT / 100))
//                     si earlyBirdActive, sino == originalTotal
//   showsDiscount   = earlyBirdActive (el caller decide si pintar el strikethrough)
//
// La función es 100% pura — no depende de IO ni de hooks.
// ---------------------------------------------------------------------------

export interface LineItemForTotals {
  price: number;
  quantity: number;
}

export interface LineItemDisplayTotals {
  originalTotal: number;
  discountedTotal: number;
  showsDiscount: boolean;
}

export function calcLineItemDisplayTotals(
  item: LineItemForTotals,
  earlyBirdActive: boolean
): LineItemDisplayTotals {
  const originalTotal = item.price * item.quantity;
  const discountedTotal = earlyBirdActive
    ? Math.round(originalTotal * (1 - EARLY_BIRD_DISCOUNT_PCT / 100))
    : originalTotal;
  return {
    originalTotal,
    discountedTotal,
    showsDiscount: earlyBirdActive,
  };
}

// ---------------------------------------------------------------------------
// calcCheckoutTotals — total agregado del checkout client-side.
//
// Replica la fórmula que `useCheckout` aplica para mostrar el total al
// usuario antes de submit (hint visual; el total real se recalcula
// server-side en createOrderUseCase contra precios reales de BD).
//
//   subtotal        = sum(price * quantity) sobre los items
//   discount        = couponDiscount + earlyBirdDiscount
//   total           = subtotal + shippingCost - discount
// ---------------------------------------------------------------------------

export interface CheckoutTotalsInput {
  items: LineItemForTotals[];
  shippingCost: number;
  couponDiscount: number;
  earlyBirdActive: boolean;
}

export interface CheckoutTotals {
  subtotal: number;
  shippingCost: number;
  couponDiscount: number;
  earlyBirdDiscount: number;
  discount: number;
  total: number;
}

export function calcCheckoutTotals(input: CheckoutTotalsInput): CheckoutTotals {
  const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const earlyBirdDiscount = input.earlyBirdActive
    ? Math.round((subtotal * EARLY_BIRD_DISCOUNT_PCT) / 100)
    : 0;
  const discount = input.couponDiscount + earlyBirdDiscount;
  const total = subtotal + input.shippingCost - discount;
  return {
    subtotal,
    shippingCost: input.shippingCost,
    couponDiscount: input.couponDiscount,
    earlyBirdDiscount,
    discount,
    total,
  };
}
