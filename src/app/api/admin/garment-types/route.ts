import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { listGarmentTypesUseCase } from "@/modules/adminCatalog/garmentTypes/application/list-garment-types.use-case";
import { createGarmentTypeUseCase } from "@/modules/adminCatalog/garmentTypes/application/create-garment-type.use-case";
import { updateGarmentTypeUseCase } from "@/modules/adminCatalog/garmentTypes/application/update-garment-type.use-case";
import { deleteGarmentTypeUseCase } from "@/modules/adminCatalog/garmentTypes/application/delete-garment-type.use-case";
import {
  GarmentTypeConflictError,
  GarmentTypeNotFoundError,
  GarmentTypeValidationError,
} from "@/modules/adminCatalog/garmentTypes/application/garment-type.errors";

// ── GET: Listar todos los tipos de prenda ─────────────────────────────────────

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN")
      return new NextResponse("Acceso denegado", { status: 403 });

    const garmentTypes = await listGarmentTypesUseCase();
    return NextResponse.json(garmentTypes);
  } catch (error) {
    console.error("[GARMENT_TYPES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── POST: Crear tipo de prenda ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN")
      return new NextResponse("Acceso denegado", { status: 403 });

    const body = await req.json();
    const created = await createGarmentTypeUseCase(body);
    return NextResponse.json(created);
  } catch (error) {
    if (error instanceof GarmentTypeValidationError) {
      return new NextResponse(error.message, { status: 400 });
    }
    if (error instanceof GarmentTypeConflictError) {
      return new NextResponse(error.message, { status: 409 });
    }
    console.error("[GARMENT_TYPES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── PATCH: Editar nombre o toggle activo ──────────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN")
      return new NextResponse("Acceso denegado", { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();
    const updated = await updateGarmentTypeUseCase({ id, ...body });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof GarmentTypeValidationError) {
      return new NextResponse(error.message, { status: 400 });
    }
    if (error instanceof GarmentTypeNotFoundError) {
      return new NextResponse(error.message, { status: 404 });
    }
    if (error instanceof GarmentTypeConflictError) {
      return new NextResponse(error.message, { status: 409 });
    }
    console.error("[GARMENT_TYPES_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── DELETE: Eliminar (solo si sin productos) ──────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN")
      return new NextResponse("Acceso denegado", { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await deleteGarmentTypeUseCase({ id });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof GarmentTypeValidationError) {
      return new NextResponse(error.message, { status: 400 });
    }
    if (error instanceof GarmentTypeNotFoundError) {
      return new NextResponse(error.message, { status: 404 });
    }
    if (error instanceof GarmentTypeConflictError) {
      if (error.details) {
        return NextResponse.json(error.details, { status: 409 });
      }
      return new NextResponse(error.message, { status: 409 });
    }
    console.error("[GARMENT_TYPES_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
