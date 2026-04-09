import { XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { BRAND_GREEN, BG_COLOR, FONT_SERIF, ROUTES } from "../constants";

export function RejectedView() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center"
      style={{ backgroundColor: BG_COLOR }}
    >
      <XCircle className="w-20 h-20 text-red-500" />
      <div>
        <h1 className="text-3xl mb-2" style={{ color: BRAND_GREEN, fontFamily: FONT_SERIF }}>
          Pago no procesado
        </h1>
        <p className="text-gray-600 max-w-sm">
          Tu pago no pudo completarse. Puedes intentarlo de nuevo con otro método de pago.
        </p>
      </div>
      <button
        onClick={() => router.push(ROUTES.checkout)}
        className="px-8 py-3 text-white rounded-full text-sm font-semibold transition-colors"
        style={{ backgroundColor: BRAND_GREEN }}
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
