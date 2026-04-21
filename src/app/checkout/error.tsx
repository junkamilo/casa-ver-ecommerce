"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">Error en el checkout</h2>
        <p className="text-gray-500 max-w-sm text-sm">
          No pudimos procesar tu orden. <strong>No se realizó ningún cobro.</strong>{" "}
          Revisa tu correo o intenta de nuevo.
        </p>
      </div>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-[#154734] text-white rounded-md hover:bg-[#154734]/90 transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
