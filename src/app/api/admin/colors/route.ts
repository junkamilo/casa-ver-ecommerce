import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listColorsUseCase } from "@/modules/adminCatalog/colors/application/list-colors.use-case";
import { createColorUseCase } from "@/modules/adminCatalog/colors/application/create-color.use-case";
import { updateColorUseCase } from "@/modules/adminCatalog/colors/application/update-color.use-case";
import { deleteColorUseCase } from "@/modules/adminCatalog/colors/application/delete-color.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

// ── GET: Listar colores ────────────────────────────────────────────────────────
// ?active=true  → solo los activos (usado por el formulario de productos)

export async function GET(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const onlyActive = new URL(req.url).searchParams.get("active") === "true";
      const colors = await listColorsUseCase({ onlyActive });
      return NextResponse.json(colors);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

// ── POST: Crear color ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const body = await req.json();
      const color = await createColorUseCase(body);
      return NextResponse.json(color, { status: 201 });
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

// ── PATCH: Editar o toggle activo ──────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const id = new URL(req.url).searchParams.get("id");
      const body = await req.json();
      const updated = await updateColorUseCase({ id, ...body });
      return NextResponse.json(updated);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

// ── DELETE: Eliminar color ─────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const id = new URL(req.url).searchParams.get("id");
      const result = await deleteColorUseCase({ id });
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
