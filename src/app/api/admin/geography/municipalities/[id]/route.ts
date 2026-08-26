import { NextResponse } from "next/server";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";
import { updateMunicipalityUseCase } from "@/modules/geography/application/admin/update-municipality.use-case";
import { toMunicipalityAdminDTO } from "@/modules/geography/presentation/geography.mappers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return runAdminRoute(async () => {
    try {
      const { id } = await params;
      const body = await request.json();
      const updated = await updateMunicipalityUseCase(id, body);
      return NextResponse.json(toMunicipalityAdminDTO(updated));
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
