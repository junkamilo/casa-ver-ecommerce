"use client";

import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsClient } from "@/hooks/use-is-client";

export type AdminToastState = {
  type: "success" | "error";
  message: string;
} | null;

type AdminToastProps = {
  toast: AdminToastState;
  onClose?: () => void;
};

/**
 * Toast fijo para el panel admin. Se renderiza en document.body
 * para quedar por encima del header (z-30) y del main (z-0).
 * Estilo claro y legible (no verde oscuro sólido).
 */
export default function AdminToast({ toast, onClose }: AdminToastProps) {
  const mounted = useIsClient();

  if (!toast || !mounted) return null;

  const isSuccess = toast.type === "success";

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed top-20 right-5 z-[9999] flex w-[min(100vw-2rem,22rem)] items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-lg shadow-black/5 animate-in fade-in slide-in-from-top-2 duration-300",
        isSuccess
          ? "border-emerald-200/80 bg-emerald-50 text-emerald-950"
          : "border-red-200/80 bg-red-50 text-red-950"
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          isSuccess ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        )}
      >
        {isSuccess ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <AlertCircle className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-current/60">
          {isSuccess ? "Guardado" : "Atención"}
        </p>
        <p className="mt-0.5 text-sm font-semibold leading-snug">{toast.message}</p>
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-current/50 transition-colors hover:bg-black/5 hover:text-current"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>,
    document.body
  );
}
