"use client";

import { useState, useEffect, useCallback } from "react";
import { getOrders } from "@/app/actions/orders";
import type { Order } from "../types";

const PAGE_SIZE = 5;

interface UsePedidosReturn {
  search: string;
  setSearch: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  methodFilter: string;
  setMethodFilter: (s: string) => void;
  expandedOrder: string | null;
  setExpandedOrder: (id: string | null) => void;
  detailOrder: Order | null;
  setDetailOrder: (o: Order | null) => void;
  filteredOrders: Order[];
  paginatedOrders: Order[];
  page: number;
  setPage: (p: number) => void;
  totalPages: number;
  pageSize: number;
  loading: boolean;
  handleStatusUpdated: (orderNumber: string, newStatus: string) => void;
}

export function usePedidos(): UsePedidosReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [methodFilter, setMethodFilter] = useState("Todos");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);

  // Función estable para re-cargar pedidos desde el servidor
  const refreshOrders = useCallback(() => {
    getOrders().then(setOrders).catch(console.error);
  }, []);

  // Carga inicial
  useEffect(() => {
    setLoading(true);
    getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  // Refresca automáticamente cuando el usuario regresa a la pestaña.
  // Esto cubre cambios hechos en otras pestañas, webhooks de pago, o
  // modificaciones directas en la base de datos.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshOrders();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshOrders]);

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Todos" || o.status === statusFilter;
    const matchMethod = methodFilter === "Todos" || o.paymentMethod === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, methodFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  function handleStatusUpdated(orderNumber: string, newStatus: string) {
    // 1. Actualización optimista: refleja el cambio en la tabla de inmediato
    setOrders((prev) =>
      prev.map((o) => (o.id === orderNumber ? { ...o, status: newStatus } : o))
    );
    setDetailOrder((prev) =>
      prev?.id === orderNumber ? { ...prev, status: newStatus } : prev
    );
    // 2. Sincronización real con el servidor en segundo plano
    refreshOrders();
  }

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    methodFilter,
    setMethodFilter,
    expandedOrder,
    setExpandedOrder,
    detailOrder,
    setDetailOrder,
    filteredOrders,
    paginatedOrders,
    page,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE,
    loading,
    handleStatusUpdated,
  };
}
