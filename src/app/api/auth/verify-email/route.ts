import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json(
        { message: "Datos requeridos" },
        { status: 400 }
      );
    }

    const record = await (prisma as any).emailVerificationToken.findUnique({
      where: { userId },
    });

    if (!record) {
      return NextResponse.json(
        { message: "No hay un código pendiente para este usuario" },
        { status: 400 }
      );
    }

    // Verificar expiración
    if (new Date() > new Date(record.expires)) {
      await (prisma as any).emailVerificationToken.delete({ where: { userId } });
      return NextResponse.json(
        { message: "El código ha expirado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    // Bloquear después de MAX_ATTEMPTS intentos fallidos
    if (record.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { message: "Demasiados intentos fallidos. Solicita un nuevo código." },
        { status: 429 }
      );
    }

    // Comparar código con el hash almacenado
    const isValid = await compare(String(code).trim(), record.codeHash);

    if (!isValid) {
      // Incrementar contador de intentos
      await (prisma as any).emailVerificationToken.update({
        where: { userId },
        data: { attempts: record.attempts + 1 },
      });

      const remaining = MAX_ATTEMPTS - record.attempts - 1;
      return NextResponse.json(
        {
          message:
            remaining > 0
              ? `Código incorrecto. Te quedan ${remaining} intento${remaining === 1 ? "" : "s"}.`
              : "Código incorrecto. Solicita un nuevo código.",
        },
        { status: 400 }
      );
    }

    // Código correcto → verificar email y eliminar token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() },
      }),
      (prisma as any).emailVerificationToken.delete({ where: { userId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VerifyEmail] Error:", error);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
