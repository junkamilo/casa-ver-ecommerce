import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const { tokenId, code } = await req.json();

    if (!tokenId || !code || typeof tokenId !== "string" || typeof code !== "string") {
      return NextResponse.json({ message: "Datos incompletos" }, { status: 400 });
    }

    // ── Buscar token por su ID opaco ──────────────────────────────────────────
    const record = await (prisma as any).passwordResetToken.findUnique({
      where: { id: tokenId },
    });

    if (!record) {
      return NextResponse.json(
        { message: "Token inválido. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    // ── Expiración ────────────────────────────────────────────────────────────
    if (new Date() > new Date(record.expires)) {
      await (prisma as any).passwordResetToken.delete({ where: { id: tokenId } });
      return NextResponse.json(
        { message: "El código ha expirado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    // ── Límite de intentos ────────────────────────────────────────────────────
    if (record.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { message: "Demasiados intentos fallidos. Solicita un nuevo código." },
        { status: 429 }
      );
    }

    // ── Comparar código ───────────────────────────────────────────────────────
    const isValid = await compare(code.trim(), record.codeHash);

    if (!isValid) {
      await (prisma as any).passwordResetToken.update({
        where: { id: tokenId },
        data:  { attempts: record.attempts + 1 },
      });
      const remaining = MAX_ATTEMPTS - record.attempts - 1;
      return NextResponse.json(
        { message: `Código incorrecto. Te quedan ${remaining} intento(s).` },
        { status: 400 }
      );
    }

    // ── Código válido → marcar como verificado ────────────────────────────────
    await (prisma as any).passwordResetToken.update({
      where: { id: tokenId },
      data:  { verified: true },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[verify-reset-code]", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
