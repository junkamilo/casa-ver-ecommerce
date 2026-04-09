import { Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { BRAND_GREEN, BG_COLOR, FONT_SERIF, ROUTES } from "../constants";
import type { ApprovedViewProps } from "../types";

export function ApprovedView({ orderId }: ApprovedViewProps) {
  const router = useRouter();

  // Con orderId: la redirección ya fue disparada en el hook, mostramos loader
  if (orderId) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center"
        style={{ backgroundColor: BG_COLOR }}
      >
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: BRAND_GREEN }} />
        <p style={{ color: BRAND_GREEN, fontFamily: FONT_SERIF }}>
          Redirigiendo a tu pedido...
        </p>
      </div>
    );
  }

  // Fallback si no hay orderId
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center"
      style={{ backgroundColor: BG_COLOR }}
    >
      <CheckCircle className="w-20 h-20 text-green-500" />
      <div>
        <h1 className="text-3xl mb-2" style={{ color: BRAND_GREEN, fontFamily: FONT_SERIF }}>
          ¡Pago exitoso!
        </h1>
        <p className="text-gray-600 max-w-sm">
          Tu pedido ha sido confirmado. Recibirás un correo con los detalles de tu compra.
        </p>
      </div>
      <button
        onClick={() => router.push(ROUTES.home)}
        className="px-8 py-3 text-white rounded-full text-sm font-semibold transition-colors"
        style={{ backgroundColor: BRAND_GREEN }}
      >
        Volver al inicio
      </button>
    </div>
  );
}
