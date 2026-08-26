import { NextResponse } from "next/server";
import { listMunicipalitiesByDepartmentUseCase } from "@/modules/geography/application/public/list-municipalities-by-department.use-case";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ departmentId: string }> },
) {
  try {
    const { departmentId } = await params;
    const data = await listMunicipalitiesByDepartmentUseCase(departmentId);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Error al obtener municipios" },
      { status: 500 },
    );
  }
}
