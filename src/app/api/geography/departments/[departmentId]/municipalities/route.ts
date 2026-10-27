import { NextResponse } from "next/server";
import { listPosMunicipalities } from "@/modules/posIntegration/infrastructure/pos-catalog.client";

/** Municipios con cobertura del departamento (`departmentId` = código DANE de 2 dígitos), según el POS. */
export async function GET(_req: Request, { params }: { params: Promise<{ departmentId: string }> }) {
  try {
    const { departmentId } = await params;
    const data = await listPosMunicipalities(departmentId);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=3600" },
    });
  } catch {
    return NextResponse.json({ message: "Error al obtener municipios" }, { status: 502 });
  }
}
