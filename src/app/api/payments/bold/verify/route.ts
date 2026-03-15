import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/app/actions/checkout";

const BOLD_LINK_API = "https://integrations.api.bold.co/online/link/v1";

// ---------------------------------------------------------------------------
// GET /api/payments/bold/verify?reference_id=...
//
// Bold redirige al cliente a /pago/resultado?reference_id={transactionId}
// Esta ruta busca la orden por transactionId, obtiene el boldLinkId (LNK_*)
// y consulta el estado del link en Bold.
//
// Statuses Bold Link de Pagos:
//   ACTIVE    → link creado, pago no completado
//   PROCESSING→ pago en curso
//   PAID      → pago exitoso ✅
//   REJECTED  → pago rechazado
//   CANCELLED → cancelado por el usuario
//   EXPIRED   → link vencido
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const referenceId = req.nextUrl.searchParams.get("reference_id");
  if (!referenceId) {
    return NextResponse.json(
      { error: "reference_id requerido" },
      { status: 400 }
    );
  }

  const apiKey =
    process.env.BOLD_IDENTITY_KEY ?? process.env.NEXT_PUBLIC_BOLD_IDENTITY_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "BOLD_IDENTITY_KEY no configurada" },
      { status: 500 }
    );
  }

  console.log("[BOLD CALLBACK] reference_id recibido:", referenceId);

  // Buscar la orden por transactionId para obtener el boldLinkId
  const order = await prisma.order.findUnique({
    where: { transactionId: referenceId },
    select: { id: true, boldLinkId: true, status: true },
  });

  if (!order) {
    console.error("[BOLD CALLBACK] Orden no encontrada para transactionId:", referenceId);
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  // Si ya está pagada (webhook llegó antes que el redirect), retornar directo
  if (order.status === "PAID") {
    console.log("[BOLD CALLBACK] Orden ya marcada como PAID (webhook adelantado)");
    return NextResponse.json({ status: "APPROVED" });
  }

  if (!order.boldLinkId) {
    console.error("[BOLD CALLBACK] Orden sin boldLinkId:", order.id);
    return NextResponse.json(
      { error: "Link de pago no encontrado en la orden" },
      { status: 502 }
    );
  }

  console.log("[BOLD CALLBACK] Consultando link:", order.boldLinkId);

  // Consultar estado del link en Bold
  const boldRes = await fetch(`${BOLD_LINK_API}/${encodeURIComponent(order.boldLinkId)}`, {
    headers: { Authorization: `x-api-key ${apiKey}` },
    cache: "no-store",
  });

  if (!boldRes.ok) {
    const body = await boldRes.text();
    console.error("[BOLD CALLBACK] Error Bold API:", boldRes.status, body.slice(0, 200));
    return NextResponse.json(
      { error: `Bold API ${boldRes.status}` },
      { status: 502 }
    );
  }

  const data = await boldRes.json();
  console.log("[BOLD CALLBACK] Estado del link:", JSON.stringify(data));

  // Bold Link de Pagos usa "PAID"; lo mapeamos a "APPROVED" para la UI
  const boldStatus = (data.status ?? "UNKNOWN").toUpperCase() as string;
  const uiStatus = boldStatus === "PAID" ? "APPROVED" : boldStatus;

  if (boldStatus === "PAID") {
    try {
      await markOrderPaid(referenceId, data.id ?? order.boldLinkId);
    } catch (e) {
      // Idempotente: si ya está pagado no es un error real
      console.warn("[BOLD CALLBACK] markOrderPaid (posiblemente idempotente):", e);
    }
  } else if (
    boldStatus === "REJECTED" ||
    boldStatus === "CANCELLED" ||
    boldStatus === "EXPIRED"
  ) {
    await prisma.order
      .updateMany({
        where: { transactionId: referenceId, status: "PENDING" },
        data: { status: "FAILED" },
      })
      .catch((e) =>
        console.error("[BOLD CALLBACK] Error actualizando orden a FAILED:", e)
      );
  }

  return NextResponse.json({ status: uiStatus });
}
