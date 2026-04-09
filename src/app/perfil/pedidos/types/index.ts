// ── Dominio ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED"
  | "REFUNDED";

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

// ── Constantes ────────────────────────────────────────────────────────────────

export interface StatusConfig {
  label: string;
  color: string;
  dotColor: string;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export interface UseOrdersResult {
  orders: Order[];
  filteredOrders: Order[];
  paginatedOrders: Order[];
  activeFilter: OrderFilter;
  setFilter: (filter: OrderFilter) => void;
  isLoading: boolean;
  error: string | null;
  selectedOrder: Order | null;
  openOrder: (order: Order) => void;
  closeOrder: () => void;
  orderCountByStatus: Record<string, number>;
  markDelivered: (id: string) => void;
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
}

export interface UseOrderDeliveryOptions {
  orderId: string;
  onDelivered?: (id: string) => void;
  onClose: () => void;
}

export interface UseOrderDeliveryResult {
  confirming: boolean;
  confirmError: string | null;
  handleConfirmDelivery: () => Promise<void>;
}

// ── Props de componentes ──────────────────────────────────────────────────────

export interface OrderCardProps {
  order: Order;
  onOpenDetail: (order: Order) => void;
}

export interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export interface OrderItemRowProps {
  item: OrderItem;
}

export interface OrderFiltersProps {
  active: OrderFilter;
  onChange: (filter: OrderFilter) => void;
  countByStatus: Record<string, number>;
}

export interface OrderEmptyStateProps {
  hasActiveFilter: boolean;
}

export interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onDelivered?: (id: string) => void;
}
