"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
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
    <html lang="es">
      <body className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center font-sans">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">Algo salió mal</h2>
          <p className="text-gray-500 max-w-sm">
            Ocurrió un error inesperado. Por favor intenta de nuevo.
          </p>
        </div>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-[#154734] text-white rounded-md hover:bg-[#154734]/90 transition-colors"
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
