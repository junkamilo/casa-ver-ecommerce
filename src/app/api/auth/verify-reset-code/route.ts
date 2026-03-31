import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const MAX_ATTEMPTS = 5;

// Validación estricta: tokenId opaco + código exactamente 6 dígitos
const verifyResetSchema = z.object({
  tokenId: z.string().min(1).max(128),
  code: z
    .string()
    .regex(/^\d{6}$/, "El código debe ser exactamente 6 dígitos numéricos"),
});

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Cuerpo de solicitud inválido" }, { status: 400 });
    }

    const parsed = verifyResetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Datos inválidos" }, { status: 400 });
    }

    const { tokenId, code } = parsed.data;

    // ── Buscar token por su ID opaco ──────────────────────────────────────────
    const record = await prisma.passwordResetToken.findUnique({
      where: { id: tokenId },
    });

    if (!record) {
      return NextResponse.json(
        { message: "Token inválido. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    // ── Expiración ────────────────────────────────────────────────────────────
    if (new Date() > record.expires) {
      await prisma.passwordResetToken.delete({ where: { id: tokenId } });
      return NextResponse.json(
        { message: "El código ha expirado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    // ── Límite de intentos ────────────────────────────────────────────────────
    // Si ya se agotaron los intentos, eliminar el token para forzar un nuevo flujo
    // y devolver 429 — no dejar el token bloqueado en BD.
    if (record.attempts >= MAX_ATTEMPTS) {
      await prisma.passwordResetToken.delete({ where: { id: tokenId } });
      return NextResponse.json(
        { message: "Demasiados intentos fallidos. Solicita un nuevo código." },
        { status: 429 }
      );
    }

    // ── Comparar código ───────────────────────────────────────────────────────
    const isValid = await compare(code, record.codeHash);

    if (!isValid) {
      const newAttempts = record.attempts + 1;

      // Si este intento agota el límite, eliminar el token directamente
      if (newAttempts >= MAX_ATTEMPTS) {
        await prisma.passwordResetToken.delete({ where: { id: tokenId } });
        return NextResponse.json(
          { message: "Código incorrecto. Solicita un nuevo código." },
          { status: 400 }
        );
      }

      await prisma.passwordResetToken.update({
        where: { id: tokenId },
        data:  { attempts: newAttempts },
      });

      const remaining = MAX_ATTEMPTS - newAttempts;
      return NextResponse.json(
        {
          message: `Código incorrecto. Te quedan ${remaining} intento${remaining === 1 ? "" : "s"}.`,
        },
        { status: 400 }
      );
    }

    // ── Código válido → marcar como verificado ────────────────────────────────
    await prisma.passwordResetToken.update({
      where: { id: tokenId },
      data:  { verified: true },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[verify-reset-code]", error instanceof Error ? error.message : "Error desconocido");
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
