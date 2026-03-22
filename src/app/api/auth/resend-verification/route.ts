import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { sendVerificationEmail } from "@/services/email/client";

const RESEND_COOLDOWN_SECONDS = 60;

function generateVerificationCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(100000 + (array[0] % 900000));
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ message: "userId requerido" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, emailVerified: true },
    });

    if (!user || !user.email) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Este correo ya está verificado" },
        { status: 400 }
      );
    }

    // Verificar cooldown: no permitir reenvío si el token fue creado hace menos de 60s
    const existing = await (prisma as any).emailVerificationToken.findUnique({
      where: { userId },
    });

    if (existing) {
      const secondsSinceCreated =
        (Date.now() - new Date(existing.createdAt).getTime()) / 1000;

      if (secondsSinceCreated < RESEND_COOLDOWN_SECONDS) {
        const waitSeconds = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceCreated);
        return NextResponse.json(
          { message: `Espera ${waitSeconds} segundos antes de solicitar otro código.`, waitSeconds },
          { status: 429 }
        );
      }
    }

    // Generar nuevo código
    const code = generateVerificationCode();
    const codeHash = await hash(code, 10);
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await (prisma as any).emailVerificationToken.upsert({
      where: { userId },
      create: { userId, codeHash, expires, attempts: 0 },
      update: { codeHash, expires, attempts: 0, createdAt: new Date() },
    });

    await sendVerificationEmail({
      customerEmail: user.email,
      customerName: user.name || user.email,
      code,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ResendVerification] Error:", error);
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}
