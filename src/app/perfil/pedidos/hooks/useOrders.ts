import { useState, useEffect, useMemo, useCallback, useRef, useDeferredValue } from "react";
import { Order, OrderFilter, OrderStats, SortBy, UseOrdersResult } from "../types";
import { ORDERS_PER_PAGE } from "../constants";

const POLL_INTERVAL_MS = 30_000;

export function useOrders(): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Difiere la búsqueda: el input responde inmediatamente, el filtrado espera idle
  const deferredSearch = useDeferredValue(searchQuery);

  const applyFreshData = useCallback((data: Order[]) => {
    setOrders(data);
    setError(null);
    setSelectedOrder((prev) => {
      if (!prev) return prev;
      const updated = data.find((o) => o.id === prev.id);
      return updated ?? prev;
    });
  }, []);

  const fetchOrders = useCallback(
    (showLoader = false) => {
      if (showLoader) setIsLoading(true);
      return fetch("/api/profile/orders")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data: unknown) => {
          applyFreshData(Array.isArray(data) ? (data as Order[]) : []);
        })
        .catch(() => {
          if (showLoader) {
            setOrders([]);
            setError("No se pudieron cargar tus pedidos. Intenta de nuevo.");
          }
        })
        .finally(() => { if (showLoader) setIsLoading(false); });
    },
    [applyFreshData],
  );

  const retryLoad = useCallback(() => fetchOrders(true), [fetchOrders]);
  const refreshOrders = useCallback(() => fetchOrders(false), [fetchOrders]);

  // Carga inicial
  useEffect(() => {
    const t = setTimeout(() => { void fetchOrders(true); }, 0);
    return () => clearTimeout(t);
  }, [fetchOrders]);

  // Polling silencioso + refresco al volver a la pestaña
  useEffect(() => {
    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (document.visibilityState === "visible") refreshOrders();
      }, POLL_INTERVAL_MS);
    };

    startPolling();

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshOrders();
        startPolling();
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refreshOrders]);

  // ── Filtrado + búsqueda + orden (todo en un solo memo) ───────────────────────
  const filteredOrders = useMemo(() => {
    let result = activeFilter === "ALL" ? orders : orders.filter((o) => o.status === activeFilter);

    if (deferredSearch.trim()) {
      const q = deferredSearch.trim().toLowerCase();
      result = result.filter((o) => o.orderNumber.toLowerCase().includes(q));
    }

    switch (sortBy) {
      case "oldest":   return [...result].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      case "highest":  return [...result].sort((a, b) => b.total - a.total);
      case "lowest":   return [...result].sort((a, b) => a.total - b.total);
      default:         return [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  }, [orders, activeFilter, deferredSearch, sortBy]);

  // ── Stats calculadas del array ya cargado (sin API extra) ────────────────────
  const stats = useMemo<OrderStats>(() => ({
    total:      orders.length,
    delivered:  orders.filter((o) => o.status === "DELIVERED").length,
    totalSpent: orders
      .filter((o) => o.status === "PAID" || o.status === "DELIVERED" || o.status === "SHIPPED")
      .reduce((sum, o) => sum + o.total, 0),
  }), [orders]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const orderCountByStatus = useMemo(() => {
    const counts: Record<string, number> = { ALL: orders.length };
    orders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
    return counts;
  }, [orders]);

  const setFilter = (filter: OrderFilter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const setSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleSetSortBy = (s: SortBy) => {
    setSortBy(s);
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
    searchQuery,
    setSearch,
    sortBy,
    setSortBy: handleSetSortBy,
    isLoading,
    error,
    retryLoad,
    selectedOrder,
    openOrder,
    closeOrder,
    orderCountByStatus,
    stats,
    markDelivered,
    currentPage,
    totalPages,
    setPage: setCurrentPage,
  };
}
