import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, password } = await req.json();

    if (!userId || !password || typeof password !== "string") {
      return NextResponse.json({ message: "Datos incompletos" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    const record = await (prisma as any).passwordResetToken.findUnique({
      where: { userId },
    });

    if (!record) {
      return NextResponse.json(
        { message: "Sesión de recuperación no válida. Reinicia el proceso." },
        { status: 400 }
      );
    }

    // Verificar que el código fue validado previamente
    if (!record.verified) {
      return NextResponse.json(
        { message: "Debes verificar el código antes de cambiar la contraseña." },
        { status: 400 }
      );
    }

    // Verificar que el token aún esté vigente (mismo plazo de 15 min)
    if (new Date() > new Date(record.expires)) {
      await (prisma as any).passwordResetToken.delete({ where: { userId } });
      return NextResponse.json(
        { message: "La sesión de recuperación expiró. Solicita un nuevo código." },
        { status: 400 }
      );
    }

    // Hashear nueva contraseña
    const passwordHash = await hash(password, 10);

    // Actualizar contraseña y eliminar token en una transacción
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: passwordHash },
      }),
      (prisma as any).passwordResetToken.delete({ where: { userId } }),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[reset-password]", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
