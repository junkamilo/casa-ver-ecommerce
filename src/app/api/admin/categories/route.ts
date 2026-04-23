import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import {
  createCategoryUseCase,
} from "@/modules/adminCatalog/categories/application/create-category.use-case";
import { listCategoriesUseCase } from "@/modules/adminCatalog/categories/application/list-categories.use-case";
import { updateCategoryUseCase } from "@/modules/adminCatalog/categories/application/update-category.use-case";
import { deleteCategoryUseCase } from "@/modules/adminCatalog/categories/application/delete-category.use-case";
import {
  CategoryConflictError,
  CategoryNotFoundError,
  CategoryValidationError,
} from "@/modules/adminCatalog/categories/application/category.errors";

// ── GET: Listar categorías (con sus tipos de prenda asignados) ─────────────────

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN")
      return new NextResponse("Acceso denegado", { status: 403 });
    const categories = await listCategoriesUseCase();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── POST: Crear categoría ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN")
      return new NextResponse("Acceso denegado", { status: 403 });

    const body = await req.json();
    const category = await createCategoryUseCase(body);

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof CategoryValidationError) {
      return new NextResponse(error.message, { status: 400 });
    }
    if (error instanceof CategoryConflictError) {
      return new NextResponse(error.message, { status: 409 });
    }
    console.error("[CATEGORIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── PATCH: Editar / toggle categoría ──────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN")
      return new NextResponse("Acceso denegado", { status: 403 });

    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const updated = await updateCategoryUseCase({ id, ...body });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof CategoryValidationError) {
      return new NextResponse(error.message, { status: 400 });
    }
    if (error instanceof CategoryNotFoundError) {
      return new NextResponse(error.message, { status: 404 });
    }
    if (error instanceof CategoryConflictError) {
      if (error.details) {
        return NextResponse.json(error.details, { status: 409 });
      }
      return new NextResponse(error.message, { status: 409 });
    }
    console.error("[CATEGORIES_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── DELETE: Eliminar categoría ────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN")
      return new NextResponse("Acceso denegado", { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const result = await deleteCategoryUseCase({ id });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof CategoryValidationError) {
      return new NextResponse(error.message, { status: 400 });
    }
    if (error instanceof CategoryNotFoundError) {
      return new NextResponse(error.message, { status: 404 });
    }
    if (error instanceof CategoryConflictError) {
      if (error.details) {
        return NextResponse.json(error.details, { status: 409 });
      }
      return new NextResponse(error.message, { status: 409 });
    }
    console.error("[CATEGORIES_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
