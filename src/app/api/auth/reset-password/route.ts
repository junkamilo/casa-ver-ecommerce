import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordServerSchema } from "@/lib/auth/validation";

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Cuerpo de solicitud inválido" }, { status: 400 });
    }

    // ── Validación server-side con Zod (incluye complejidad de contraseña) ────
    const parsed = resetPasswordServerSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
      return NextResponse.json({ message }, { status: 400 });
    }

    const { tokenId, password } = parsed.data;

    // ── Buscar token por su ID opaco ──────────────────────────────────────────
    const record = await prisma.passwordResetToken.findUnique({
      where: { id: tokenId },
      select: { userId: true, verified: true, expires: true },
    });

    if (!record) {
      return NextResponse.json(
        { message: "Sesión de recuperación no válida. Reinicia el proceso." },
        { status: 400 }
      );
    }

    // ── Verificar que el OTP fue validado previamente ─────────────────────────
    if (!record.verified) {
      return NextResponse.json(
        { message: "Debes verificar el código antes de cambiar la contraseña." },
        { status: 400 }
      );
    }

    // ── Verificar vigencia ────────────────────────────────────────────────────
    if (new Date() > record.expires) {
      await prisma.passwordResetToken.delete({ where: { id: tokenId } });
      return NextResponse.json(
        { message: "La sesión de recuperación expiró. Solicita un nuevo código." },
        { status: 400 }
      );
    }

    // ── Actualizar contraseña y eliminar token (transacción atómica) ──────────
    const passwordHash = await hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data:  { password: passwordHash },
      }),
      prisma.passwordResetToken.delete({ where: { id: tokenId } }),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[reset-password]", error instanceof Error ? error.message : "Error desconocido");
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
