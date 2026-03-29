"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// Página de retorno de Bold (callback_url)
//
// Bold redirige aquí después del pago con ?reference_id=...
// Esta página consulta /api/payments/bold/verify para obtener el estado
// y actualizar la orden en BD. Si el pago está en proceso (RUNNING),
// hace polling cada 3 segundos (máximo 10 intentos).
// ---------------------------------------------------------------------------

type PaymentStatus = "loading" | "APPROVED" | "REJECTED" | "RUNNING" | "error";

interface VerifyResult {
  status: PaymentStatus;
  orderId?: string;
}

function ResultContent() {
  const params = useSearchParams();
  const router = useRouter();

  // Bold Botón de Pagos envía: ?bold-order-id=...&bold-tx-status=...
  // El bold-order-id es nuestro transactionId (el order-id que pasamos al botón)
  const referenceId =
    params.get("bold-order-id") ??
    params.get("reference_id") ??
    params.get("reference") ??
    params.get("ref") ??
    null;

  // bold-tx-status: "approved" | "pending" | "rejected"
  // Es el estado que el cliente vio en Bold — puede no ser definitivo, siempre verificamos
  const boldTxStatus = params.get("bold-tx-status");

  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [orderId, setOrderId] = useState<string | undefined>();
  const [pollCount, setPollCount] = useState(0);

  const verify = async (): Promise<VerifyResult> => {
    if (!referenceId) return { status: "error" };
    try {
      const res = await fetch(
        `/api/payments/bold/verify?reference_id=${encodeURIComponent(referenceId)}`
      );
      const data = await res.json();
      const s = (data.status ?? "UNKNOWN").toUpperCase();
      if (s === "APPROVED") return { status: "APPROVED", orderId: data.orderId };
      if (s === "REJECTED" || s === "CANCELLED" || s === "EXPIRED") return { status: "REJECTED" };
      return { status: "RUNNING" };
    } catch {
      return { status: "error" };
    }
  };

  // Primer check al montar
  useEffect(() => {
    if (!referenceId) {
      setStatus("error");
      return;
    }
    // Si Bold ya confirmó rechazo, mostramos directamente sin llamar al API
    if (boldTxStatus === "rejected") {
      setStatus("REJECTED");
      return;
    }
    verify().then((result) => {
      setStatus(result.status);
      if (result.orderId) setOrderId(result.orderId);
      if (result.status === "APPROVED" && result.orderId) {
        router.replace(`/checkout/success?orderId=${result.orderId}`);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referenceId]);

  // Polling mientras RUNNING (máx 10 veces = 30 segundos)
  useEffect(() => {
    if (status !== "RUNNING" || pollCount >= 10) {
      return;
    }
    const timer = setTimeout(async () => {
      const result = await verify();
      setStatus(result.status);
      if (result.orderId) setOrderId(result.orderId);
      setPollCount((c) => c + 1);
      if (result.status === "APPROVED" && result.orderId) {
        router.replace(`/checkout/success?orderId=${result.orderId}`);
      }
    }, 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pollCount]);

  // ── Pantalla: cargando / en proceso ────────────────────────────────────────
  if (status === "loading" || (status === "RUNNING" && pollCount < 10)) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <Loader2 className="w-12 h-12 text-[#154734] animate-spin" />
        <p
          className="text-2xl text-[#154734]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {status === "RUNNING" ? "Verificando tu pago..." : "Cargando..."}
        </p>
        {status === "RUNNING" && (
          <p className="text-sm text-gray-500 max-w-xs">
            Tu pago está siendo procesado. Esto puede tomar unos segundos.
          </p>
        )}
      </div>
    );
  }

  // ── Pantalla: APROBADO — redirige a /checkout/success si hay orderId ─────
  if (status === "APPROVED") {
    if (orderId) {
      // La redirección ya fue disparada en el useEffect; mostrar loader mientras ocurre
      return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-4 px-4 text-center">
          <Loader2 className="w-12 h-12 text-[#154734] animate-spin" />
          <p className="text-[#154734]" style={{ fontFamily: "Georgia, serif" }}>
            Redirigiendo a tu pedido...
          </p>
        </div>
      );
    }
    // Fallback si no hay orderId
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <CheckCircle className="w-20 h-20 text-green-500" />
        <div>
          <h1
            className="text-3xl text-[#154734] mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            ¡Pago exitoso!
          </h1>
          <p className="text-gray-600 max-w-sm">
            Tu pedido ha sido confirmado. Recibirás un correo con los detalles de tu compra.
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="px-8 py-3 bg-[#154734] text-white rounded-full text-sm font-semibold hover:bg-[#154734]/90 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  // ── Pantalla: RECHAZADO ────────────────────────────────────────────────────
  if (status === "REJECTED") {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <XCircle className="w-20 h-20 text-red-500" />
        <div>
          <h1
            className="text-3xl text-[#154734] mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Pago no procesado
          </h1>
          <p className="text-gray-600 max-w-sm">
            Tu pago no pudo completarse. Puedes intentarlo de nuevo con otro
            método de pago.
          </p>
        </div>
        <button
          onClick={() => router.push("/checkout")}
          className="px-8 py-3 bg-[#154734] text-white rounded-full text-sm font-semibold hover:bg-[#154734]/90 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  // ── Pantalla: timeout / error → redirigir al home con mensaje positivo ────
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-6 px-4 text-center">
      <CheckCircle className="w-20 h-20 text-green-500" />
      <div>
        <h1
          className="text-3xl text-[#154734] mb-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          ¡Tu pedido fue recibido!
        </h1>
        <p className="text-gray-600 max-w-sm">
          Tu compra está siendo procesada. Recibirás un correo de confirmación
          con los detalles de tu pedido.
        </p>
      </div>
      <button
        onClick={() => router.push("/")}
        className="px-8 py-3 bg-[#154734] text-white rounded-full text-sm font-semibold hover:bg-[#154734]/90 transition-colors"
      >
        Volver al inicio
      </button>
    </div>
  );
}

export default function PagoResultadoPage() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  );
}
