"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  isLaunchLockActive,
  isLaunchLockExemptRoute,
} from "@/lib/launch-lock";

/** Re-evalúa `isLaunchLockActive()` cada segundo para desmontar al expirar. */
export function useLaunchLockActive(): boolean {
  const [active, setActive] = useState(isLaunchLockActive);

  useEffect(() => {
    const tick = () => setActive(isLaunchLockActive());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return active;
}

/**
 * Lógica compartida para decidir si mostrar el modal bloqueante o
 * ocultar widgets globales (WhatsApp, social proof).
 */
export function useLaunchLockGate() {
  const pathname = usePathname();

  const lockActive = useLaunchLockActive();
  const exemptRoute = isLaunchLockExemptRoute(pathname);
  const shouldShowModal = lockActive && !exemptRoute;
  const shouldHideGlobalWidgets = shouldShowModal;

  return {
    lockActive,
    exemptRoute,
    shouldShowModal,
    shouldHideGlobalWidgets,
  };
}
