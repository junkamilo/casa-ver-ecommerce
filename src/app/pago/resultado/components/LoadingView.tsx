import { Loader2 } from "lucide-react";
import { BRAND_GREEN, BG_COLOR, FONT_SERIF } from "../constants";
import type { LoadingViewProps } from "../types";

export function LoadingView({ isRunning = false }: LoadingViewProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center"
      style={{ backgroundColor: BG_COLOR }}
    >
      <Loader2 className="w-12 h-12 animate-spin" style={{ color: BRAND_GREEN }} />
      <p className="text-2xl" style={{ color: BRAND_GREEN, fontFamily: FONT_SERIF }}>
        {isRunning ? "Verificando tu pago..." : "Cargando..."}
      </p>
      {isRunning && (
        <p className="text-sm text-gray-500 max-w-xs">
          Tu pago está siendo procesado. Esto puede tomar unos segundos.
        </p>
      )}
    </div>
  );
}
