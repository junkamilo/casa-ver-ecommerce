import { NextResponse } from "next/server";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";
import { updateCountryUseCase } from "@/modules/geography/application/admin/update-country.use-case";
import { toCountryAdminDTO } from "@/modules/geography/presentation/geography.mappers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return runAdminRoute(async () => {
    try {
      const { id } = await params;
      const body = await request.json();
      const updated = await updateCountryUseCase(id, body);
      return NextResponse.json(toCountryAdminDTO(updated));
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
