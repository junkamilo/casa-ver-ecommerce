import { NextResponse } from "next/server";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";
import { searchMunicipalitiesForAdmin } from "@/modules/geography/infrastructure/prisma-municipality.repository";
import { createMunicipalityUseCase } from "@/modules/geography/application/admin/create-municipality.use-case";
import { toMunicipalityAdminDTO } from "@/modules/geography/presentation/geography.mappers";
import type { PaginatedResult, MunicipalityAdminDTO } from "@/modules/geography/contracts/geography.dto";

export async function GET(request: Request) {
  return runAdminRoute(async () => {
    try {
      const { searchParams } = new URL(request.url);
      const departmentId = searchParams.get("departmentId") ?? undefined;
      const q = searchParams.get("q") ?? searchParams.get("search") ?? undefined;
      const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
      const pageSize = Math.min(2000, Math.max(1, parseInt(searchParams.get("pageSize") ?? "50", 10)));

      const [total, rows] = await searchMunicipalitiesForAdmin({
        departmentId,
        q,
        page,
        pageSize,
      });

      const result: PaginatedResult<MunicipalityAdminDTO> = {
        data: rows.map(toMunicipalityAdminDTO),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };

      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function POST(request: Request) {
  return runAdminRoute(async () => {
    try {
      const body = await request.json();
      const municipality = await createMunicipalityUseCase(body);
      return NextResponse.json(toMunicipalityAdminDTO(municipality), { status: 201 });
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
