import { useState, useEffect, useMemo, useCallback } from "react";
import { Order, OrderFilter, UseOrdersResult } from "../types";
import { ORDERS_PER_PAGE } from "../constants";

export function useOrders(): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshOrders = useCallback(() => {
    fetch("/api/profile/orders")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        setOrders(Array.isArray(data) ? (data as Order[]) : []);
        setError(null);
      })
      .catch(console.error);
  }, []);

  // Carga inicial
  useEffect(() => {
    setIsLoading(true);
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

  // Refresca cuando el cliente regresa a la pestaña
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshOrders();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshOrders]);

  const filteredOrders = useMemo(() => {
    if (activeFilter === "ALL") return orders;
    return orders.filter((o) => o.status === activeFilter);
  }, [orders, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const orderCountByStatus = useMemo(() => {
    const counts: Record<string, number> = { ALL: orders.length };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    });
    return counts;
  }, [orders]);

  const setFilter = (filter: OrderFilter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const openOrder = (order: Order) => setSelectedOrder(order);
  const closeOrder = () => setSelectedOrder(null);

  const markDelivered = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "DELIVERED" as const } : o))
    );
    setSelectedOrder((prev) =>
      prev?.id === id ? { ...prev, status: "DELIVERED" as const } : prev
    );
    refreshOrders();
  };

  return {
    orders,
    filteredOrders,
    paginatedOrders,
    activeFilter,
    setFilter,
    isLoading,
    error,
    selectedOrder,
    openOrder,
    closeOrder,
    orderCountByStatus,
    markDelivered,
    currentPage,
    totalPages,
    setPage: setCurrentPage,
  };
}
