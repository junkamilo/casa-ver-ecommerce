import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAddiApplicationUseCase } from "@/modules/payments/addi/application/create-addi-application.use-case";
import { toErrorResponse } from "@/server/http/error-response";

// ---------------------------------------------------------------------------
// POST /api/payments/addi
//
// Thin route handler. Toda la lógica vive en
// modules/payments/addi/application/create-addi-application.use-case.ts.
//
// La autenticación NextAuth se valida aquí (transport layer). El use case
// recibe el sessionUserId opcional para verificar propiedad de la orden.
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  let body: { orderId?: unknown; cedula?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { orderId, cedula } = body;
  if (typeof orderId !== "string" || typeof cedula !== "string") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionUserId = (session?.user as any)?.id as string | undefined;

  try {
    const result = await createAddiApplicationUseCase({
      orderId,
      cedula,
      sessionUserId,
    });
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
