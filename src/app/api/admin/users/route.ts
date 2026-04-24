import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminUsersUseCase } from "@/modules/adminCatalog/users/application/get-admin-users.use-case";
import { createAdminUserUseCase } from "@/modules/adminCatalog/users/application/create-admin-user.use-case";
import { revokeAdminUserUseCase } from "@/modules/adminCatalog/users/application/revoke-admin-user.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

// GET - Listar todos los admins o buscar usuario por email
export async function GET(req: NextRequest) {
  return runAdminRoute(async () => {
    const { searchParams } = new URL(req.url);
    const lookupEmail = searchParams.get("lookup");
    const result = await getAdminUsersUseCase({ lookupEmail });
    return NextResponse.json(result);
  });
}

// POST - Crear nuevo admin
export async function POST(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
    const { name, email, password } = await req.json();
    const result = await createAdminUserUseCase({ name, email, password });
    const status = "promoted" in result ? 200 : 201;
    return NextResponse.json(result, { status });
  } catch (error) {
      return toErrorResponse(error);
    }
  });
}

// DELETE - Revocar rol de admin (lo convierte a USER)
export async function DELETE(req: NextRequest) {
  return runAdminRoute(async (admin) => {
    try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    const result = await revokeAdminUserUseCase({ userId, currentUserId: admin.userId });
    return NextResponse.json(result);
  } catch (error) {
      return toErrorResponse(error);
    }
  });
}
