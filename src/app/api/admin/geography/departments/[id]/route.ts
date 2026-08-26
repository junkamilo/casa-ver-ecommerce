import { NextResponse } from "next/server";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";
import { updateDepartmentUseCase } from "@/modules/geography/application/admin/update-department.use-case";
import { toDepartmentAdminDTO } from "@/modules/geography/presentation/geography.mappers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return runAdminRoute(async () => {
    try {
      const { id } = await params;
      const body = await request.json();
      const updated = await updateDepartmentUseCase(id, body);
      return NextResponse.json(toDepartmentAdminDTO(updated));
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
