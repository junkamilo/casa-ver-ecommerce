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

function ResultContent() {
  const params = useSearchParams();
  const router = useRouter();

  // Bold puede enviar el reference_id con distintos nombres según el método
  const referenceId =
    params.get("reference_id") ??
    params.get("reference") ??
    params.get("ref") ??
    null;

  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [pollCount, setPollCount] = useState(0);

  const verify = async (): Promise<PaymentStatus> => {
    if (!referenceId) return "error";
    try {
      const res = await fetch(
        `/api/payments/bold/verify?reference_id=${encodeURIComponent(referenceId)}`
      );
      const data = await res.json();
      const s = (data.status ?? "UNKNOWN").toUpperCase();
      if (s === "APPROVED") return "APPROVED";
      if (s === "REJECTED" || s === "CANCELLED" || s === "EXPIRED") return "REJECTED";
      return "RUNNING";
    } catch {
      return "error";
    }
  };

  // Primer check al montar
  useEffect(() => {
    if (!referenceId) {
      setStatus("error");
      return;
    }
    verify().then(setStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referenceId]);

  // Polling mientras RUNNING (máx 10 veces = 30 segundos)
  useEffect(() => {
    if (status !== "RUNNING" || pollCount >= 10) {
      if (status === "RUNNING" && pollCount >= 10) {
        // Agotamos los intentos — mostrar como "en proceso"
        setStatus("RUNNING");
      }
      return;
    }
    const timer = setTimeout(async () => {
      const newStatus = await verify();
      setStatus(newStatus);
      setPollCount((c) => c + 1);
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

  // ── Pantalla: APROBADO ─────────────────────────────────────────────────────
  if (status === "APPROVED") {
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
            Tu pedido ha sido confirmado. Recibirás un correo con los detalles
            de tu compra.
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

  // ── Pantalla: timeout / error ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-gray-600 max-w-sm">
        No pudimos confirmar el estado de tu pago. Si realizaste el pago,
        revisa tu correo o contáctanos.
      </p>
      <button
        onClick={() => router.push("/")}
        className="text-[#154734] underline text-sm"
      >
        Ir al inicio
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
