import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createCategoryUseCase,
} from "@/modules/adminCatalog/categories/application/create-category.use-case";
import { listCategoriesUseCase } from "@/modules/adminCatalog/categories/application/list-categories.use-case";
import { updateCategoryUseCase } from "@/modules/adminCatalog/categories/application/update-category.use-case";
import { deleteCategoryUseCase } from "@/modules/adminCatalog/categories/application/delete-category.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

// ── GET: Listar categorías (con sus tipos de prenda asignados) ─────────────────

export async function GET() {
  return runAdminRoute(async () => {
    const categories = await listCategoriesUseCase();
    return NextResponse.json(categories);
  });
}

// ── POST: Crear categoría ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const body = await req.json();
      const category = await createCategoryUseCase(body);
      return NextResponse.json(category);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

// ── PATCH: Editar / toggle categoría ──────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const body = await req.json();
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
      const updated = await updateCategoryUseCase({ id, ...body });
      return NextResponse.json(updated);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

// ── DELETE: Eliminar categoría ────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
      const result = await deleteCategoryUseCase({ id });
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
