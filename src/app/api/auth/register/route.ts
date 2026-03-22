import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { sendVerificationEmail } from "@/services/email/client";

function generateVerificationCode(): string {
  // Código de 6 dígitos criptográficamente aleatorio
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(100000 + (array[0] % 900000));
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, password, name, recoveryEmail, phone } = data;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const userFound = await prisma.user.findUnique({ where: { email } });

    if (userFound) {
      return NextResponse.json(
        { message: "El correo ya está registrado" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    // Crear usuario con emailVerified null (pendiente de verificación)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
        phone: phone || null,
        recoveryEmail: recoveryEmail || null,
        emailVerified: null,
      },
    });

    // Generar código de 6 dígitos y hashearlo
    const code = generateVerificationCode();
    const codeHash = await hash(code, 10);
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Upsert: si ya existe un token anterior para este usuario, lo reemplaza
    await (prisma as any).emailVerificationToken.upsert({
      where: { userId: newUser.id },
      create: { userId: newUser.id, codeHash, expires, attempts: 0 },
      update: { codeHash, expires, attempts: 0 },
    });

    // Enviar email con el código
    await sendVerificationEmail({
      customerEmail: email,
      customerName: name || email,
      code,
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { ...userWithoutPassword, requiresVerification: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register] Error:", error);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
