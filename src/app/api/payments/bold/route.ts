import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createBoldPaymentLinkUseCase } from "@/modules/payments/bold/application/create-bold-payment-link.use-case";
import { toErrorResponse } from "@/server/http/error-response";

// ---------------------------------------------------------------------------
// POST /api/payments/bold
//
// Thin route handler. Toda la lógica vive en
// modules/payments/bold/application/create-bold-payment-link.use-case.ts.
//
// La autenticación (NextAuth session) se valida aquí en el transport layer
// porque la sesión es responsabilidad de Next, no del use case.
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  let body: { orderId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { orderId } = body;
  if (typeof orderId !== "string") {
    return NextResponse.json({ error: "orderId inválido" }, { status: 400 });
  }

  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionUserId = (session?.user as any)?.id as string | undefined;

  try {
    const result = await createBoldPaymentLinkUseCase({ orderId, sessionUserId });
    return NextResponse.json(result);
  } catch (error) {
    // Preservamos el shape original `{ error: string }` que el frontend
    // (useCheckout) ya parsea. toErrorResponse devuelve `{ message, code }`
    // así que aquí mapeamos manualmente al shape legacy.
    const errorRes = toErrorResponse(error);
    const payload = await errorRes.json();
    return NextResponse.json(
      { error: payload.message ?? "Error" },
      { status: errorRes.status }
    );
  }
}
