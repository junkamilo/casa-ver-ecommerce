"use client";

import { useState } from "react";
import { UseOrderDeliveryOptions, UseOrderDeliveryResult } from "../types";

export function useOrderDelivery({
  orderId,
  onDelivered,
  onClose,
}: UseOrderDeliveryOptions): UseOrderDeliveryResult {
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  async function handleConfirmDelivery() {
    setConfirming(true);
    setConfirmError(null);
    try {
      const res = await fetch(`/api/profile/orders/${orderId}/confirm-delivery`, {
        method: "POST",
      });
      if (res.ok) {
        onDelivered?.(orderId);
        onClose();
      } else {
        const body = await res.json().catch(() => ({}));
        setConfirmError(
          (body as { message?: string }).message ?? "No se pudo confirmar. Intenta de nuevo."
        );
      }
    } catch {
      setConfirmError("Error de conexión. Verifica tu red e intenta de nuevo.");
    } finally {
      setConfirming(false);
    }
  }

  return { confirming, confirmError, handleConfirmDelivery };
}
