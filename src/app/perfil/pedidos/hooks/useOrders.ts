import { useState, useMemo } from "react";
import { Order, OrderFilter } from "../types";
import { MOCK_ORDERS } from "../mockData";

export interface UseOrdersResult {
  orders: Order[];
  filteredOrders: Order[];
  activeFilter: OrderFilter;
  setFilter: (filter: OrderFilter) => void;
  isLoading: boolean;
  expandedId: string | null;
  toggleExpand: (id: string) => void;
  orderCountByStatus: Record<string, number>;
}

export function useOrders(): UseOrdersResult {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading] = useState(false);

  // In production this would be replaced by a fetch call
  const orders = MOCK_ORDERS;

  const filteredOrders = useMemo(() => {
    if (activeFilter === "ALL") return orders;
    return orders.filter((o) => o.status === activeFilter);
  }, [orders, activeFilter]);

  const orderCountByStatus = useMemo(() => {
    const counts: Record<string, number> = { ALL: orders.length };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    });
    return counts;
  }, [orders]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return {
    orders,
    filteredOrders,
    activeFilter,
    setFilter: setActiveFilter,
    isLoading,
    expandedId,
    toggleExpand,
    orderCountByStatus,
  };
}
