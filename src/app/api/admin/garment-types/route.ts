import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listGarmentTypesUseCase } from "@/modules/adminCatalog/garmentTypes/application/list-garment-types.use-case";
import { createGarmentTypeUseCase } from "@/modules/adminCatalog/garmentTypes/application/create-garment-type.use-case";
import { updateGarmentTypeUseCase } from "@/modules/adminCatalog/garmentTypes/application/update-garment-type.use-case";
import { deleteGarmentTypeUseCase } from "@/modules/adminCatalog/garmentTypes/application/delete-garment-type.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

// ── GET: Listar todos los tipos de prenda ─────────────────────────────────────

export async function GET() {
  return runAdminRoute(async () => {
    try {
      const garmentTypes = await listGarmentTypesUseCase();
      return NextResponse.json(garmentTypes);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

// ── POST: Crear tipo de prenda ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const body = await req.json();
      const created = await createGarmentTypeUseCase(body);
      return NextResponse.json(created);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

// ── PATCH: Editar nombre o toggle activo ──────────────────────────────────────

export async function PATCH(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
      const body = await req.json();
      const updated = await updateGarmentTypeUseCase({ id, ...body });
      return NextResponse.json(updated);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

// ── DELETE: Eliminar (solo si sin productos) ──────────────────────────────────

export async function DELETE(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
      await deleteGarmentTypeUseCase({ id });
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
