import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, password, name } = data;

    // 1. Validar que lleguen los datos
    if (!email || !password) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    // 2. Verificar si el usuario ya existe
    const userFound = await prisma.user.findUnique({
      where: { email: email },
    });

    if (userFound) {
      return NextResponse.json(
        { message: "El correo ya está registrado" },
        { status: 400 }
      );
    }

    // 3. Encriptar contraseña
    const hashedPassword = await hash(password, 10);

    // 4. Crear usuario en Neon
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER", // Por defecto es cliente
      },
    });

    // Quitamos el password de la respuesta por seguridad
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}