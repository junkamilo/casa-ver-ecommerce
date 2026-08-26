import { NextResponse } from "next/server";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";
import { listAllDepartments } from "@/modules/geography/infrastructure/prisma-department.repository";
import { createDepartmentUseCase } from "@/modules/geography/application/admin/create-department.use-case";
import { toDepartmentAdminDTO } from "@/modules/geography/presentation/geography.mappers";

export async function GET(request: Request) {
  return runAdminRoute(async () => {
    try {
      const { searchParams } = new URL(request.url);
      const countryId = searchParams.get("countryId") ?? undefined;
      const departments = await listAllDepartments(countryId);
      return NextResponse.json(departments.map(toDepartmentAdminDTO));
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function POST(request: Request) {
  return runAdminRoute(async () => {
    try {
      const body = await request.json();
      const department = await createDepartmentUseCase(body);
      return NextResponse.json(toDepartmentAdminDTO(department), { status: 201 });
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
