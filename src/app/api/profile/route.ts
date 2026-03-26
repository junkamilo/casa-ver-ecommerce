import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { passwordSchema } from "@/lib/auth/validation";
import type { NextRequest } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        password: true,
        createdAt: true,
        accounts: { select: { provider: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const { password, accounts, ...userData } = user;

    return NextResponse.json({
      ...userData,
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
    const userId = (session.user as any).id as string;

    const body = await req.json();
    const { name, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const updateData: { name?: string; password?: string } = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ message: "El nombre no puede estar vacío" }, { status: 400 });
      }
      updateData.name = name.trim();
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
      select: { id: true, name: true, email: true, image: true, role: true, createdAt: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/profile]", err);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
