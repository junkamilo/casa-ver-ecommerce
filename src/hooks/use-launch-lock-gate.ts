"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
  const { data: session, status } = useSession();

  const lockActive = useLaunchLockActive();
  const exemptRoute = isLaunchLockExemptRoute(pathname);
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  const isResolvingSession = lockActive && !exemptRoute && status === "loading";
  const shouldShowModal =
    lockActive && !exemptRoute && status !== "loading" && !isAdmin;
  const shouldHideGlobalWidgets =
    lockActive && !exemptRoute && (status === "loading" || !isAdmin);

  return {
    lockActive,
    exemptRoute,
    isAdmin,
    isResolvingSession,
    shouldShowModal,
    shouldHideGlobalWidgets,
  };
}
