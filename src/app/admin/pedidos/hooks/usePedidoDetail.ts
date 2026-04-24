"use client";

import { useState } from "react";
import type { UsePedidoDetailOptions, UsePedidoDetailReturn } from "../types/types";
import {
  AdminOrdersApiError,
  updateAdminOrderStatus,
} from "@/modules/adminCatalog/orders/presentation/api-client";

export function usePedidoDetail({ onStatusUpdated }: UsePedidoDetailOptions = {}): UsePedidoDetailReturn {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (orderId: string): Promise<void> => {
    if (!selectedStatus) return;
    setError(null);
    setSaving(true);
    try {
      await updateAdminOrderStatus({ orderNumber: orderId, statusEs: selectedStatus });
      onStatusUpdated?.(orderId, selectedStatus);
      setSelectedStatus("");
    } catch (error: unknown) {
      if (error instanceof AdminOrdersApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Error al cambiar el estado");
      }
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
