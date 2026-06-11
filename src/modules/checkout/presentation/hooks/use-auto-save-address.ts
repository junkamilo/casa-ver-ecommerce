"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import type { CheckoutFormData } from "@/app/checkout/types/schema";

interface UseAutoSaveAddressOptions {
  /** Si false, no se guarda la dirección aunque el usuario esté autenticado. */
  enabled: boolean;
}

/**
 * Hook que encapsula la lógica de auto-guardado de dirección
 * para usuarios autenticados después de crear una orden.
 *
 * Expone `saveAddress` para pasar como `onBeforePayment` a useCheckout,
 * e `isAuthenticated` para que el page pueda decidir qué componente renderizar.
 */
export function useAutoSaveAddress({ enabled }: UseAutoSaveAddressOptions) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const saveAddress = useCallback(
    async (data: CheckoutFormData): Promise<void> => {
      // Solo guardar si: autenticado + toggle activo + dirección nueva (no guardada)
      if (!isAuthenticated || !enabled || data.savedAddressId) return;

      await fetch("/api/profile/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: `${data.firstName} ${data.lastName}`,
          cedula: data.cedula || undefined,
          phone: data.phone,
          department: data.department,
          city: data.city,
          address: data.address,
          addressDetail: data.addressDetail || undefined,
          isDefault: true,
        }),
      });
    },
    [isAuthenticated, enabled]
  );

  return { saveAddress, isAuthenticated };
}
