import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { getAdminUsersUseCase } from "@/modules/adminCatalog/users/application/get-admin-users.use-case";
import { createAdminUserUseCase } from "@/modules/adminCatalog/users/application/create-admin-user.use-case";
import { revokeAdminUserUseCase } from "@/modules/adminCatalog/users/application/revoke-admin-user.use-case";
import {
  UserAdminConflictError,
  UserAdminValidationError,
} from "@/modules/adminCatalog/users/application/user-admin.errors";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return false;
  return true;
}

// GET - Listar todos los admins o buscar usuario por email
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const lookupEmail = searchParams.get("lookup");
  const result = await getAdminUsersUseCase({ lookupEmail });
  return NextResponse.json(result);
}

// POST - Crear nuevo admin
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const { name, email, password } = await req.json();
    const result = await createAdminUserUseCase({ name, email, password });
    const status = "promoted" in result ? 200 : 201;
    return NextResponse.json(result, { status });
  } catch (error) {
    if (error instanceof UserAdminValidationError || error instanceof UserAdminConflictError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    console.error("Error creando admin:", error);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Revocar rol de admin (lo convierte a USER)
export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentUserId = (session?.user as any)?.id ?? null;
    const result = await revokeAdminUserUseCase({ userId, currentUserId });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UserAdminValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    console.error("Error revocando admin:", error);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
