"use client";

import { useState, useEffect } from "react";
import { getOrders } from "@/app/actions/orders";
import type { Order } from "../types";

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

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Todos" || o.status === statusFilter;
    const matchMethod = methodFilter === "Todos" || o.paymentMethod === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  function handleStatusUpdated(orderNumber: string, newStatus: string) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderNumber ? { ...o, status: newStatus } : o))
    );
    setDetailOrder((prev) =>
      prev?.id === orderNumber ? { ...prev, status: newStatus } : prev
    );
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
    loading,
    handleStatusUpdated,
  };
}
