import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Proveedores OAuth soportados por la aplicación
const SUPPORTED_PROVIDERS = ["google"] as const;
type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

function isSupportedProvider(value: string): value is SupportedProvider {
  return (SUPPORTED_PROVIDERS as readonly string[]).includes(value);
}

/**
 * DELETE /api/profile/accounts/[provider]
 *
 * Desvincula un proveedor OAuth de la cuenta del usuario autenticado.
 *
 * Regla de seguridad: no se permite desvincular si es el único
 * método de acceso (sin contraseña y sin otros proveedores),
 * ya que dejaría al usuario sin forma de volver a entrar.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { provider } = await params;

  if (!isSupportedProvider(provider)) {
    return NextResponse.json({ message: "Proveedor no soportado" }, { status: 400 });
  }

  const userId = (session.user as { id?: string }).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      password: true,
      accounts: { select: { id: true, provider: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
  }

  const targetAccount = user.accounts.find((a) => a.provider === provider);

  if (!targetAccount) {
    return NextResponse.json(
      { message: `No tienes una cuenta de ${provider} vinculada` },
      { status: 404 }
    );
  }

  // Verificar que el usuario conserve al menos un método de acceso tras desvincular
  const remainingAccounts = user.accounts.filter((a) => a.provider !== provider);
  if (remainingAccounts.length === 0 && !user.password) {
    return NextResponse.json(
      {
        message:
          "No puedes desvincular Google si no tienes contraseña configurada. " +
          "Crea una contraseña primero desde tu perfil.",
      },
      { status: 400 }
    );
  }

  await prisma.account.delete({ where: { id: targetAccount.id } });

  return NextResponse.json({
    message: `Cuenta de ${provider} desvinculada exitosamente`,
  });
}
