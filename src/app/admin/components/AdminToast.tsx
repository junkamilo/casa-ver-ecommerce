"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type AdminToastState = {
  type: "success" | "error";
  message: string;
} | null;

type AdminToastProps = {
  toast: AdminToastState;
};

/**
 * Toast fijo para el panel admin. Se renderiza en document.body
 * para quedar por encima del header (z-30) y del main (z-0).
 */
export default function AdminToast({ toast }: AdminToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!toast || !mounted) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed top-20 right-5 z-[9999] max-w-sm px-5 py-3.5 rounded-xl shadow-lg text-sm font-semibold transition-all",
        toast.type === "success" ? "bg-[#154734] text-white" : "bg-red-600 text-white"
      )}
    >
      {toast.message}
    </div>,
    document.body
  );
}
