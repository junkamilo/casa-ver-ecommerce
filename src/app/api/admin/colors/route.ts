import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { listColorsUseCase } from "@/modules/adminCatalog/colors/application/list-colors.use-case";
import { createColorUseCase } from "@/modules/adminCatalog/colors/application/create-color.use-case";
import { updateColorUseCase } from "@/modules/adminCatalog/colors/application/update-color.use-case";
import { deleteColorUseCase } from "@/modules/adminCatalog/colors/application/delete-color.use-case";
import {
  ColorConflictError,
  ColorNotFoundError,
  ColorValidationError,
} from "@/modules/adminCatalog/colors/application/color.errors";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN")
    return new NextResponse("Acceso denegado", { status: 403 });
  return null;
}

// ── GET: Listar colores ────────────────────────────────────────────────────────
// ?active=true  → solo los activos (usado por el formulario de productos)

export async function GET(req: NextRequest) {
  try {
    const deny = await requireAdmin();
    if (deny) return deny;

    const onlyActive = new URL(req.url).searchParams.get("active") === "true";
    const colors = await listColorsUseCase({ onlyActive });

    return NextResponse.json(colors);
  } catch (error) {
    console.error("[COLORS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── POST: Crear color ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const deny = await requireAdmin();
    if (deny) return deny;

    const body = await req.json();
    const color = await createColorUseCase(body);
    return NextResponse.json(color, { status: 201 });
  } catch (error) {
    if (error instanceof ColorValidationError) {
      return new NextResponse(error.message, { status: 400 });
    }
    if (error instanceof ColorConflictError) {
      return new NextResponse(error.message, { status: 409 });
    }
    console.error("[COLORS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── PATCH: Editar o toggle activo ──────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const deny = await requireAdmin();
    if (deny) return deny;

    const id = new URL(req.url).searchParams.get("id");
    const body = await req.json();
    const updated = await updateColorUseCase({ id, ...body });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ColorValidationError) {
      return new NextResponse(error.message, { status: 400 });
    }
    if (error instanceof ColorNotFoundError) {
      return new NextResponse(error.message, { status: 404 });
    }
    if (error instanceof ColorConflictError) {
      return new NextResponse(error.message, { status: 409 });
    }
    console.error("[COLORS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── DELETE: Eliminar color ─────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const deny = await requireAdmin();
    if (deny) return deny;

    const id = new URL(req.url).searchParams.get("id");
    const result = await deleteColorUseCase({ id });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ColorValidationError) {
      return new NextResponse(error.message, { status: 400 });
    }
    if (error instanceof ColorNotFoundError) {
      return new NextResponse(error.message, { status: 404 });
    }
    console.error("[COLORS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
