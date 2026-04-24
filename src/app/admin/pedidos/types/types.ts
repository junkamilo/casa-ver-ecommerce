import type { AdminOrderDTO, OrderItemDTO } from "@/modules/adminCatalog/orders/contracts/order-admin.dto";

// ─── Entidades de Dominio ────────────────────────────────────────────────────

export type OrderItem = OrderItemDTO;
export type Order = AdminOrderDTO;

// ─── Hooks ───────────────────────────────────────────────────────────────────

export interface UsePedidosListReturn {
  search: string;
  setSearch: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  methodFilter: string;
  setMethodFilter: (s: string) => void;
  expandedOrder: string | null;
  setExpandedOrder: (id: string | null) => void;
  filteredOrders: Order[];
  paginatedOrders: Order[];
  page: number;
  setPage: (p: number) => void;
  totalPages: number;
  pageSize: number;
  loading: boolean;
}

export interface UsePedidoDetailOptions {
  onStatusUpdated?: (orderId: string, newStatus: string) => void;
}

export interface UsePedidoDetailReturn {
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  saving: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  handleSave: (orderId: string) => Promise<void>;
}

export interface UsePedidosReturn extends UsePedidosListReturn {
  detailOrder: Order | null;
  setDetailOrder: (o: Order | null) => void;
  handleStatusUpdated: (orderNumber: string, newStatus: string) => void;
}

// ─── Props de Componentes ────────────────────────────────────────────────────

export interface PedidosHeaderProps {
  title?: string;
}

export interface PedidosFiltersProps {
  search: string;
  onSearchChange: (s: string) => void;
  statusFilter: string;
  onStatusChange: (s: string) => void;
  methodFilter: string;
  onMethodChange: (s: string) => void;
}

export interface PedidosTableProps {
  orders: Order[];
  onViewDetail: (order: Order) => void;
}

export interface PedidosMobileListProps {
  orders: Order[];
  expandedOrder: string | null;
  onToggleExpand: (id: string | null) => void;
  onViewDetail: (order: Order) => void;
}

export interface PedidoDetailModalProps {
  order: Order;
  onClose: () => void;
  onStatusUpdated: (orderNumber: string, newStatus: string) => void;
}
