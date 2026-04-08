import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cancelAddiApplication } from "@/services/addi/cancel";

// ---------------------------------------------------------------------------
// POST /api/addi/cancel
// Endpoint admin protegido — cancela el crédito Addi de una orden.
// Solo para cancelaciones manuales; el flujo normal pasa por updateOrderStatus.
//
// Body: { orderId: string }  ← ID interno de la orden en nuestra BD
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // Verificar sesión de administrador
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { orderId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { orderId } = body;
  if (!orderId) {
    return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
  }

  // Buscar la orden y validar que sea de Addi y esté en estado cancelable
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, transactionId: true, total: true, paymentMethod: true, status: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }
  if (order.paymentMethod !== "ADDI") {
    return NextResponse.json(
      { error: "Esta orden no fue pagada con Addi" },
      { status: 400 }
    );
  }
  if (!["PAID", "PROCESSING"].includes(order.status)) {
    return NextResponse.json(
      { error: `No se puede cancelar una orden en estado "${order.status}"` },
      { status: 409 }
    );
  }
  if (!order.transactionId) {
    return NextResponse.json({ error: "La orden no tiene transactionId de Addi" }, { status: 400 });
  }

  const result = await cancelAddiApplication(order.transactionId, Number(order.total));

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Error al cancelar en Addi" },
      { status: 502 }
    );
  }

  return NextResponse.json({ cancelled: true });
}
