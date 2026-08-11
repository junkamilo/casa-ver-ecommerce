"use client";

import { useState, useEffect, useCallback } from "react";
import type { Order, UsePedidosListReturn } from "../types/types";
import {
  AdminOrdersApiError,
  fetchAdminOrders,
} from "@/modules/adminCatalog/orders/presentation/api-client";
import { mapAdminOrderListDtoToUi } from "@/modules/adminCatalog/orders/presentation/mappers";
import { DEFAULT_ADMIN_PAGE_SIZE } from "@/components/ui/AdminPagination";

export function usePedidosList(): UsePedidosListReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearchState] = useState("");
  const [statusFilter, setStatusFilterState] = useState("Todos");
  const [methodFilter, setMethodFilterState] = useState("Todos");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_ADMIN_PAGE_SIZE);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const setStatusFilter = useCallback((value: string) => {
    setStatusFilterState(value);
    setPage(1);
  }, []);

  const setMethodFilter = useCallback((value: string) => {
    setMethodFilterState(value);
    setPage(1);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  const refreshOrders = useCallback(() => {
    fetchAdminOrders()
      .then((data) => setOrders(mapAdminOrderListDtoToUi(data)))
      .catch((error: unknown) => {
        if (error instanceof AdminOrdersApiError) {
          console.error(error.message);
          return;
        }
        console.error(error);
      });
  }, []);

  // Carga inicial (loading ya inicia en true)
  useEffect(() => {
    fetchAdminOrders()
      .then((data) => setOrders(mapAdminOrderListDtoToUi(data)))
      .catch((error: unknown) => {
        if (error instanceof AdminOrdersApiError) {
          console.error(error.message);
          return;
        }
        console.error(error);
      })
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

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize
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
    orders,
    filteredOrders,
    paginatedOrders,
    page,
    setPage,
    totalPages,
    pageSize,
    setPageSize,
    loading,
  };
}
