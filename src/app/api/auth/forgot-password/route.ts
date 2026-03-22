import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/services/email/client";

function generateOTP(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(100000 + (array[0] % 900000));
}

// Respuesta genérica para no revelar si el recoveryEmail existe en la BD
const GENERIC_OK = { message: "Si el correo existe en nuestra base de datos, recibirás un código en los próximos minutos." };

export async function POST(req: NextRequest) {
  try {
    const { recoveryEmail } = await req.json();

    if (!recoveryEmail || typeof recoveryEmail !== "string") {
      return NextResponse.json({ message: "Correo requerido" }, { status: 400 });
    }

    const normalizedEmail = recoveryEmail.trim().toLowerCase();

    // Buscar usuario por recoveryEmail (no por email principal)
    const user = await prisma.user.findFirst({
      where: { recoveryEmail: { equals: normalizedEmail, mode: "insensitive" } },
      select: { id: true, name: true, recoveryEmail: true },
    });

    // Si no existe, responder igual (no revelar información)
    if (!user || !user.recoveryEmail) {
      return NextResponse.json(GENERIC_OK, { status: 200 });
    }

    // Cooldown: no permitir reenvío si fue creado hace menos de 60 segundos
    const existing = await (prisma as any).passwordResetToken.findUnique({
      where: { userId: user.id },
    });
    if (existing) {
      const secondsSinceCreation = (Date.now() - new Date(existing.createdAt).getTime()) / 1000;
      if (secondsSinceCreation < 60) {
        const waitSeconds = Math.ceil(60 - secondsSinceCreation);
        return NextResponse.json(
          { message: `Espera ${waitSeconds} segundos antes de solicitar otro código.`, cooldown: waitSeconds },
          { status: 429 }
        );
      }
    }

    // Generar y hashear código OTP
    const code = generateOTP();
    const codeHash = await hash(code, 10);
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Guardar (upsert) token en BD
    await (prisma as any).passwordResetToken.upsert({
      where: { userId: user.id },
      create: { userId: user.id, codeHash, expires, attempts: 0, verified: false },
      update: { codeHash, expires, attempts: 0, verified: false, createdAt: new Date() },
    });

    // Enviar email al recoveryEmail
    await sendPasswordResetEmail({
      customerEmail: user.recoveryEmail,
      customerName: user.name || user.recoveryEmail,
      code,
    });

    return NextResponse.json({ userId: user.id }, { status: 200 });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
