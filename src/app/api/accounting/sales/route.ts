import { NextResponse } from "next/server";
import { PrismaAccountingSaleRepository } from "@/modules/accounting/infrastructure/prisma-accounting-sale.repository";

function verifyAccountingSecret(request: Request): boolean {
  const secret = process.env.ACCOUNTING_API_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

function parseDateParam(value: string | null, endOfDay: boolean): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    d.setUTCHours(23, 59, 59, 999);
  }
  return d;
}

/**
 * GET /api/accounting/sales?from=&to=&cursor=&limit=
 * Auth: Authorization: Bearer ${ACCOUNTING_API_SECRET}
 */
export async function GET(request: Request) {
  if (!verifyAccountingSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = parseDateParam(searchParams.get("from"), false);
  const to = parseDateParam(searchParams.get("to"), true);
  const cursor = searchParams.get("cursor") ?? undefined;
  const rawLimit = Number(searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), 200)
    : 50;

  if (searchParams.get("from") && !from) {
    return NextResponse.json(
      { error: "Invalid 'from' date" },
      { status: 400 },
    );
  }
  if (searchParams.get("to") && !to) {
    return NextResponse.json({ error: "Invalid 'to' date" }, { status: 400 });
  }

  const repository = new PrismaAccountingSaleRepository();
  const { rows, nextCursor } = await repository.findByPaidAtRange({
    from,
    to,
    cursor,
    limit,
  });

  return NextResponse.json({
    data: rows.map((r) => r.payload),
    nextCursor,
  });
}
