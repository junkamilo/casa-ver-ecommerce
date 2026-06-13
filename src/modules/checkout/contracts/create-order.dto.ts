// Contratos del use case `createOrder`. Mantienen la misma forma exacta que
// `CreateOrderInput`/`CreateOrderResult` de `src/app/actions/checkout.ts` para
// garantizar que el Server Action wrapper y todos sus consumidores (hoy un solo
// caller: useCheckout) sigan funcionando sin cambios.

export interface CreateOrderItemDTO {
  variantId: string;
  productId: string;
  name: string;
  sku: string;
  colorName: string;
  size: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface CreateOrderInputDTO {
  email: string;
  firstName: string;
  lastName: string;
  cedula: string;
  phone: string;

  address: string;
  addressDetail?: string;
  city: string;
  department: string;
  // Si el usuario eligió una dirección guardada, se vincula a la orden y se
  // valida que pertenezca al usuario dentro de la transacción.
  savedAddressId?: string;

  paymentMethod: "BOLD" | "ADDI";

  items: CreateOrderItemDTO[];

  // Montos enviados desde el cliente — se IGNORAN en el use case y se
  // recalculan server-side contra la BD (anti-tampering). Se mantienen en el
  // DTO solo por compatibilidad con la firma legacy.
  subtotal: number;
  shippingCost: number;
  discount: number;

  couponId?: string;
  couponCode?: string;
}

export interface CreateOrderResultDTO {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  transactionId?: string;
  error?: string;
}
