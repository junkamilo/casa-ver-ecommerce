import { NextResponse } from "next/server";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";
import { listAllCountries } from "@/modules/geography/infrastructure/prisma-country.repository";
import { createCountryUseCase } from "@/modules/geography/application/admin/create-country.use-case";
import { toCountryAdminDTO } from "@/modules/geography/presentation/geography.mappers";

export async function GET() {
  return runAdminRoute(async () => {
    try {
      const countries = await listAllCountries();
      return NextResponse.json(countries.map(toCountryAdminDTO));
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function POST(request: Request) {
  return runAdminRoute(async () => {
    try {
      const body = await request.json();
      const country = await createCountryUseCase(body);
      return NextResponse.json(toCountryAdminDTO(country), { status: 201 });
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
