import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { passwordSchema } from "@/lib/auth/validation";
import type { NextRequest } from "next/server";

function resolveSessionUserId(session: { user?: unknown }): string | null {
  const user = session.user as { id?: string } | undefined;
  return typeof user?.id === "string" && user.id.length > 0 ? user.id : null;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = resolveSessionUserId(session);
    if (!userId) {
      console.error("[GET /api/profile] Sesión sin userId — el token JWT puede estar desactualizado");
      return NextResponse.json(
        { message: "Sesión inválida. Cierra sesión e ingresa de nuevo." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        password: true,
        phone: true,
        cedula: true,
        recoveryEmail: true,
        createdAt: true,
        accounts: { select: { provider: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const { password, accounts, createdAt, ...userData } = user;

    return NextResponse.json({
      ...userData,
      createdAt: createdAt.toISOString(),
      hasPassword: !!password,
      linkedProviders: accounts.map((a) => a.provider),
    });
  } catch (err) {
    console.error("[GET /api/profile]", err);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = resolveSessionUserId(session);
    if (!userId) {
      return NextResponse.json(
        { message: "Sesión inválida. Cierra sesión e ingresa de nuevo." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, phone, cedula, recoveryEmail, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ message: "El nombre no puede estar vacío" }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      updateData.phone = phone?.trim() || null;
    }

    if (cedula !== undefined) {
      const val = cedula?.trim() || null;
      if (val && !/^\d{6,12}$/.test(val)) {
        return NextResponse.json({ message: "Cédula inválida (6–12 dígitos numéricos)" }, { status: 400 });
      }
      updateData.cedula = val;
    }

    if (recoveryEmail !== undefined) {
      if (recoveryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail)) {
        return NextResponse.json({ message: "El email de recuperación no es válido" }, { status: 400 });
      }
      updateData.recoveryEmail = recoveryEmail?.trim() || null;
    }

    if (newPassword) {
      if (!user.password) {
        return NextResponse.json(
          { message: "Tu cuenta usa Google. No puedes cambiar la contraseña desde aquí." },
          { status: 400 }
        );
      }
      if (!currentPassword) {
        return NextResponse.json({ message: "Debes ingresar tu contraseña actual" }, { status: 400 });
      }
      const valid = await compare(currentPassword, user.password);
      if (!valid) {
        return NextResponse.json({ message: "Contraseña actual incorrecta" }, { status: 400 });
      }
      const parsed = passwordSchema.safeParse(newPassword);
      if (!parsed.success) {
        return NextResponse.json(
          { message: parsed.error.issues[0].message },
          { status: 400 }
        );
      }
      updateData.password = await hash(newPassword, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No hay cambios para guardar" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        phone: true,
        cedula: true,
        recoveryEmail: true,
        createdAt: true,
        password: true,
        accounts: { select: { provider: true } },
      },
    });

    const { password: pw, accounts, createdAt, ...updatedData } = updated;

    return NextResponse.json({
      ...updatedData,
      createdAt: createdAt.toISOString(),
      hasPassword: !!pw,
      linkedProviders: accounts.map((a) => a.provider),
    });
  } catch (err) {
    console.error("[PUT /api/profile]", err);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
