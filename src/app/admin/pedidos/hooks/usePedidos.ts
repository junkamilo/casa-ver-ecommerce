"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePedidosList } from "./usePedidosList";
import type { Order, UsePedidosReturn } from "../types/types";

export function usePedidos(): UsePedidosReturn {
  const listHook = usePedidosList();
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const openedFromQueryRef = useRef(false);

  useEffect(() => {
    const orderNumber = searchParams.get("abrir");
    if (!orderNumber || listHook.loading || openedFromQueryRef.current) return;

    const order = listHook.orders.find((o) => o.id === orderNumber);
    if (order) {
      openedFromQueryRef.current = true;
      queueMicrotask(() => {
        setDetailOrder(order);
        router.replace("/admin/pedidos", { scroll: false });
      });
    }
  }, [searchParams, listHook.loading, listHook.orders, router]);

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
