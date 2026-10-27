import { NextResponse } from "next/server";

/** Países con envío: la web solo vende en Colombia (la geografía la publica el POS). */
export async function GET() {
  return NextResponse.json([{ code: "CO", name: "Colombia" }], {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" },
  });
}
