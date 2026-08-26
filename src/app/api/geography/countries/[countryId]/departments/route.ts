import { NextResponse } from "next/server";
import { listDepartmentsByCountryUseCase } from "@/modules/geography/application/public/list-departments-by-country.use-case";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ countryId: string }> },
) {
  try {
    const { countryId } = await params;
    const data = await listDepartmentsByCountryUseCase(countryId);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Error al obtener departamentos" },
      { status: 500 },
    );
  }
}
