import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

async function verifyAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "ADMIN") return false;
  return true;
}

// GET - Listar todos los admins o buscar usuario por email
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const lookupEmail = searchParams.get("lookup");

  // Lookup: buscar si un usuario existe por email
  if (lookupEmail) {
    const user = await prisma.user.findUnique({
      where: { email: lookupEmail },
      select: { id: true, name: true, email: true, role: true, image: true },
    });

    if (!user) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      isAdmin: user.role === "ADMIN",
      user: { id: user.id, name: user.name, email: user.email, image: user.image },
    });
  }

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      image: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(admins);
}

// POST - Crear nuevo admin
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const { name, email, password } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "El email es obligatorio" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      // Si el usuario ya existe pero no es admin, lo promovemos
      if (existing.role !== "ADMIN") {
        const promoted = await prisma.user.update({
          where: { email },
          data: { role: "ADMIN" },
          select: { id: true, name: true, email: true, createdAt: true },
        });
        return NextResponse.json(
          { ...promoted, promoted: true },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { message: "Este usuario ya es administrador" },
        { status: 400 }
      );
    }

    // Para usuarios nuevos, nombre y contraseña son obligatorios
    if (!name || !password) {
      return NextResponse.json(
        { message: "Nombre y contraseña son obligatorios para usuarios nuevos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return NextResponse.json(newAdmin, { status: 201 });
  } catch (error) {
    console.error("Error creando admin:", error);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Revocar rol de admin (lo convierte a USER)
export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { message: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    // Verificar que no se elimine a sí mismo
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token?.id === userId) {
      return NextResponse.json(
        { message: "No puedes revocar tu propio acceso de administrador" },
        { status: 400 }
      );
    }

    // Verificar que quede al menos un admin
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return NextResponse.json(
        { message: "Debe haber al menos un administrador" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: "USER" },
    });

    return NextResponse.json({ message: "Admin revocado exitosamente" });
  } catch (error) {
    console.error("Error revocando admin:", error);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
