/** Contrato JSON Casa Verde → app de contabilidad (1 pedido = N ítems). */

export interface AccountingSaleCustomerDTO {
  name: string;
  city: string;
  department: string;
  phone: string;
  cedula: string | null;
}

export interface AccountingSaleAmountsDTO {
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
}

export interface AccountingSaleOrderDTO {
  id: string;
  orderNumber: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
  paymentMethod: string;
  customer: AccountingSaleCustomerDTO;
  amounts: AccountingSaleAmountsDTO;
  couponCode: string | null;
}

export interface AccountingSaleItemDTO {
  id: string;
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  categories: string[];
  colorName: string;
  size: string;
  price: number;
  quantity: number;
  total: number;
  costPrice: number | null;
  imageUrl: string | null;
}

export interface AccountingSalePayloadDTO {
  order: AccountingSaleOrderDTO;
  items: AccountingSaleItemDTO[];
}
