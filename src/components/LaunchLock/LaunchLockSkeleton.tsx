"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/hooks/use-is-client";

/** Overlay neutro mientras se resuelve la sesión (evita flash del modal a admins). */
export default function LaunchLockSkeleton() {
  const isClient = useIsClient();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!isClient) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm"
      aria-hidden
    />,
    document.body,
  );
}
