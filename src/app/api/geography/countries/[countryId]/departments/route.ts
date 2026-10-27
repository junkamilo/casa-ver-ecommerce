import { NextResponse } from "next/server";
import { listPosDepartments } from "@/modules/posIntegration/infrastructure/pos-catalog.client";

/** Departamentos con cobertura del país (`countryId` = ISO alpha-2, p. ej. CO), según el POS. */
export async function GET(_req: Request, { params }: { params: Promise<{ countryId: string }> }) {
  try {
    const { countryId } = await params;
    const data = await listPosDepartments(countryId.toUpperCase());
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=3600" },
    });
  } catch {
    return NextResponse.json({ message: "Error al obtener departamentos" }, { status: 502 });
  }
}
