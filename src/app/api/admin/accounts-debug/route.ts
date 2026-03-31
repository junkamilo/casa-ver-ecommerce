import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/accounts-debug
 *
 * Muestra el estado de la tabla `accounts` (vínculos OAuth) junto con los
 * datos básicos de cada usuario. Los tokens reales nunca se exponen.
 *
 * Solo accesible por ADMIN.
 */
export async function GET() {
  const session = await auth();

  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Traer cuentas OAuth con datos mínimos del usuario — sin tokens
  const accounts = await prisma.account.findMany({
    select: {
      id: true,
      provider: true,
      type: true,
      expires_at: true,
      scope: true,
      // access_token / refresh_token / id_token → nunca se exponen por API
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
      },
    },
    orderBy: { user: { email: "asc" } },
  });

  const totalUsers = await prisma.user.count();

  const cuentas = accounts.map((acc) => {
    const ahora = Date.now();
    const expiresMs = acc.expires_at ? acc.expires_at * 1000 : null;
    return {
      proveedor: acc.provider,
      tipo: acc.type,
      alcance: acc.scope ?? null,
      token_vigente: expiresMs ? expiresMs > ahora : null,
      expira_el: expiresMs ? new Date(expiresMs).toISOString() : null,
      usuario: {
        id: acc.user.id,
        email: acc.user.email,
        nombre: acc.user.name,
        rol: acc.user.role,
        email_verificado: !!acc.user.emailVerified,
        registrado_el: acc.user.createdAt,
      },
    };
  });

  return NextResponse.json({
    resumen: {
      total_usuarios: totalUsers,
      cuentas_oauth: accounts.length,
      con_google: accounts.filter((a) => a.provider === "google").length,
      solo_credenciales: totalUsers - accounts.length,
    },
    cuentas,
  });
}
