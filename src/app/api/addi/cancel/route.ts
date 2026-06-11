import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { cancelAddiApplicationUseCase } from "@/modules/payments/addi/application/cancel-addi-application.use-case";
import { toErrorResponse } from "@/server/http/error-response";

// ---------------------------------------------------------------------------
// POST /api/addi/cancel
//
// Endpoint admin protegido — cancela el crédito Addi de una orden.
// Solo para cancelaciones manuales; el flujo normal pasa por updateOrderStatus.
//
// Body: { orderId: string }
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { orderId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!body.orderId) {
    return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
  }

  try {
    const result = await cancelAddiApplicationUseCase({ orderId: body.orderId });
    return NextResponse.json(result);
  } catch (error) {
    const errorRes = toErrorResponse(error);
    const payload = await errorRes.json();
    return NextResponse.json(
      { error: payload.message ?? "Error" },
      { status: errorRes.status }
    );
  }
}
