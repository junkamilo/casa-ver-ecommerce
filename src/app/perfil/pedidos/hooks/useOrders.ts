import { useState, useEffect, useMemo } from "react";
import { Order, OrderFilter } from "../types";

export interface UseOrdersResult {
  orders: Order[];
  filteredOrders: Order[];
  activeFilter: OrderFilter;
  setFilter: (filter: OrderFilter) => void;
  isLoading: boolean;
  error: string | null;
  expandedId: string | null;
  toggleExpand: (id: string) => void;
  orderCountByStatus: Record<string, number>;
  markDelivered: (id: string) => void;
}

export function useOrders(): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile/orders")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        setOrders(Array.isArray(data) ? (data as Order[]) : []);
        setError(null);
      })
      .catch(() => {
        setOrders([]);
        setError("No se pudieron cargar tus pedidos. Intenta recargar la página.");
      })
      .finally(() => setIsLoading(false));
  }, []);

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

  const markDelivered = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "DELIVERED" as const } : o))
    );
  };

  return {
    orders,
    filteredOrders,
    activeFilter,
    setFilter: setActiveFilter,
    isLoading,
    error,
    expandedId,
    toggleExpand,
    orderCountByStatus,
    markDelivered,
  };
}
