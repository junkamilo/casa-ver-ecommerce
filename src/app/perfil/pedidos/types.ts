export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderFilter = "ALL" | OrderStatus;

export interface OrderShippingAddress {
  fullName: string;
  address: string;
  city: string;
  department: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  total: number;
  items: OrderItem[];
  shippingAddress: OrderShippingAddress;
  trackingCode?: string;
}
