export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  items: OrderItem[];
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
