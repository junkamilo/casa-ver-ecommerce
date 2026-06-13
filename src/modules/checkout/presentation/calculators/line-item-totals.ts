// Calculators puros para los componentes de UI del checkout.

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
  discountPercentage = 0
): LineItemDisplayTotals {
  const originalTotal = item.price * item.quantity;
  if (discountPercentage <= 0) {
    return {
      originalTotal,
      discountedTotal: originalTotal,
      showsDiscount: false,
    };
  }
  const itemDiscount = Math.round((originalTotal * discountPercentage) / 100);
  return {
    originalTotal,
    discountedTotal: originalTotal - itemDiscount,
    showsDiscount: itemDiscount > 0,
  };
}

export interface CheckoutTotalsInput {
  items: LineItemForTotals[];
  shippingCost: number;
  couponDiscount: number;
}

export interface CheckoutTotals {
  subtotal: number;
  shippingCost: number;
  couponDiscount: number;
  discount: number;
  total: number;
}

export function calcCheckoutTotals(input: CheckoutTotalsInput): CheckoutTotals {
  const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = input.couponDiscount;
  const total = subtotal + input.shippingCost - discount;
  return {
    subtotal,
    shippingCost: input.shippingCost,
    couponDiscount: input.couponDiscount,
    discount,
    total,
  };
}
