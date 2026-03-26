import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { sendVerificationEmail } from "@/services/email/client";
import { generateSecureCode } from "@/lib/auth/validation";

const RESEND_COOLDOWN_SECONDS = 60;

export async function POST(request: Request) {
  try {
    const { tokenId } = await request.json();

    if (!tokenId || typeof tokenId !== "string") {
      return NextResponse.json({ message: "tokenId requerido" }, { status: 400 });
    }

    // ── Buscar en registros pendientes (flujo de nuevo registro) ──────────────
    const pending = await (prisma as any).pendingRegistration.findUnique({
      where: { id: tokenId },
    });

    if (pending) {
      // ── Cooldown ────────────────────────────────────────────────────────────
      const secondsSinceCreated =
        (Date.now() - new Date(pending.createdAt).getTime()) / 1000;

      if (secondsSinceCreated < RESEND_COOLDOWN_SECONDS) {
        const waitSeconds = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceCreated);
        return NextResponse.json(
          { message: `Espera ${waitSeconds} segundos antes de solicitar otro código.`, waitSeconds },
          { status: 429 }
        );
      }

      // ── Generar nuevo código ────────────────────────────────────────────────
      const code = generateSecureCode();
      const codeHash = await hash(code, 10);
      const expires = new Date(Date.now() + 15 * 60 * 1000);

      const updated = await (prisma as any).pendingRegistration.update({
        where: { id: tokenId },
        data:  { codeHash, expires, attempts: 0, createdAt: new Date() },
        select: { id: true },
      });

      await sendVerificationEmail({
        customerEmail: pending.email,
        customerName:  pending.name || pending.email,
        code,
      });

      return NextResponse.json({ success: true, tokenId: updated.id });
    }

    // ── Fallback: buscar en EmailVerificationToken (usuarios ya existentes) ───
    const existing = await (prisma as any).emailVerificationToken.findUnique({
      where: { id: tokenId },
      include: { user: { select: { id: true, email: true, name: true, emailVerified: true } } },
    });

    if (!existing || !existing.user) {
      return NextResponse.json({ message: "Token no encontrado" }, { status: 404 });
    }

    const user = existing.user;

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Este correo ya está verificado" },
        { status: 400 }
      );
    }

    // ── Cooldown ──────────────────────────────────────────────────────────────
    const secondsSinceCreated =
      (Date.now() - new Date(existing.createdAt).getTime()) / 1000;

    if (secondsSinceCreated < RESEND_COOLDOWN_SECONDS) {
      const waitSeconds = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceCreated);
      return NextResponse.json(
        { message: `Espera ${waitSeconds} segundos antes de solicitar otro código.`, waitSeconds },
        { status: 429 }
      );
    }

    // ── Generar nuevo código ──────────────────────────────────────────────────
    const code = generateSecureCode();
    const codeHash = await hash(code, 10);
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    const newToken = await (prisma as any).emailVerificationToken.update({
      where: { id: tokenId },
      data:  { codeHash, expires, attempts: 0, createdAt: new Date() },
      select: { id: true },
    });

    await sendVerificationEmail({
      customerEmail: user.email,
      customerName:  user.name || user.email,
      code,
    });

    return NextResponse.json({ success: true, tokenId: newToken.id });
  } catch (error) {
    console.error("[ResendVerification]", error);
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}
