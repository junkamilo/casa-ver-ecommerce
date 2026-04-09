"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/app/actions/orders";
import type { UsePedidoDetailOptions, UsePedidoDetailReturn } from "../types/types";

export function usePedidoDetail({ onStatusUpdated }: UsePedidoDetailOptions = {}): UsePedidoDetailReturn {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (orderId: string): Promise<void> => {
    if (!selectedStatus) return;
    setError(null);
    setSaving(true);
    try {
      await updateOrderStatus(orderId, selectedStatus);
      onStatusUpdated?.(orderId, selectedStatus);
      setSelectedStatus("");
    } catch (e: any) {
      setError(e?.message ?? "Error al cambiar el estado");
    } finally {
      setSaving(false);
    }
  };

  return {
    selectedStatus,
    setSelectedStatus,
    saving,
    error,
    setError,
    handleSave,
  };
}
