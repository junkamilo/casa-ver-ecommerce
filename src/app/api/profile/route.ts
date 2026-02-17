import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: token.id as string },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { name, currentPassword, newPassword } = body;

  const user = await prisma.user.findUnique({
    where: { id: token.id as string },
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
    if (newPassword.length < 6) {
      return NextResponse.json({ message: "La nueva contraseña debe tener al menos 6 caracteres" }, { status: 400 });
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
}
