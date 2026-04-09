"use client";

import { useState } from "react";
import { usePedidosList } from "./usePedidosList";
import type { Order, UsePedidosReturn } from "../types/types";

export function usePedidos(): UsePedidosReturn {
  const listHook = usePedidosList();
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  function handleStatusUpdated(orderNumber: string, newStatus: string) {
    setDetailOrder((prev) =>
      prev?.id === orderNumber ? { ...prev, status: newStatus } : prev
    );
  }

  return {
    ...listHook,
    detailOrder,
    setDetailOrder,
    handleStatusUpdated,
  };
}
