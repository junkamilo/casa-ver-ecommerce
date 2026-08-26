import { NextResponse } from "next/server";
import { listActiveCountriesUseCase } from "@/modules/geography/application/public/list-active-countries.use-case";

export async function GET() {
  try {
    const data = await listActiveCountriesUseCase();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Error al obtener países" },
      { status: 500 },
    );
  }
}
