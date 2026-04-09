"use client";

import { useState, useEffect, useCallback } from "react";
import { getOrders } from "@/app/actions/orders";
import type { Order, UsePedidosListReturn } from "../types/types";

const PAGE_SIZE = 5;

export function usePedidosList(): UsePedidosListReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [methodFilter, setMethodFilter] = useState("Todos");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [page, setPage] = useState(1);

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

  // Refresca automáticamente al volver a la pestaña (cubre webhooks de pago y cambios en BD)
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

  // Resetea a página 1 cuando cambian los filtros
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, methodFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    methodFilter,
    setMethodFilter,
    expandedOrder,
    setExpandedOrder,
    filteredOrders,
    paginatedOrders,
    page,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE,
    loading,
  };
}
