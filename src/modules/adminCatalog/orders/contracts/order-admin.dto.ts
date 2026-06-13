export interface OrderItemDTO {
  name: string;
  qty: number;
  price: number;
  colorName: string;
  size: string;
  sku: string;
  imageUrl?: string;
  lineTotal?: number;
}

export interface AdminOrderDTO {
  id: string;
  customer: string;
  email: string;
  phone: string;
  cedula?: string;
  items: OrderItemDTO[];
  total: number;
  subtotal?: number;
  shippingCost?: number;
  discount?: number;
  status: string;
  paymentMethod: string;
  date: string;
  address: string;
  deliveredAt?: string;
}

export interface UpdateOrderStatusInputDTO {
  orderNumber: string;
  statusEs: string;
}
