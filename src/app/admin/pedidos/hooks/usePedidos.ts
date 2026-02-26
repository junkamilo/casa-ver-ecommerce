"use client";

import { useState } from "react";
import { ORDERS } from "../constants";
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
}

export function usePedidos(): UsePedidosReturn {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [methodFilter, setMethodFilter] = useState("Todos");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const filteredOrders = ORDERS.filter((o) => {
    const matchSearch =
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Todos" || o.status === statusFilter;
    const matchMethod = methodFilter === "Todos" || o.paymentMethod === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

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
  };
}
