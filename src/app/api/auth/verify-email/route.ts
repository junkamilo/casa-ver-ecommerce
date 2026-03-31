import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  try {
    const { tokenId, code } = await request.json();

    if (!tokenId || !code || typeof tokenId !== "string" || typeof code !== "string") {
      return NextResponse.json({ message: "Datos requeridos" }, { status: 400 });
    }

    // ── Buscar en registros pendientes (flujo de nuevo registro) ──────────────
    const pending = await (prisma as any).pendingRegistration.findUnique({
      where: { id: tokenId },
    });

    if (pending) {
      // ── Expiración ──────────────────────────────────────────────────────────
      if (new Date() > new Date(pending.expires)) {
        await (prisma as any).pendingRegistration.delete({ where: { id: tokenId } });
        return NextResponse.json(
          { message: "El código ha expirado. Solicita uno nuevo." },
          { status: 400 }
        );
      }

      // ── Límite de intentos ──────────────────────────────────────────────────
      if (pending.attempts >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { message: "Demasiados intentos fallidos. Solicita un nuevo código." },
          { status: 429 }
        );
      }

      // ── Comparar código ─────────────────────────────────────────────────────
      const isValid = await compare(code.trim(), pending.codeHash);

      if (!isValid) {
        await (prisma as any).pendingRegistration.update({
          where: { id: tokenId },
          data:  { attempts: pending.attempts + 1 },
        });
        const remaining = MAX_ATTEMPTS - pending.attempts - 1;
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

      // ── Código correcto → crear usuario y eliminar registro pendiente ────────
      const EARLY_BIRD_LIMIT = 10;
      const EARLY_BIRD_DISCOUNT_PCT = 10;

      await prisma.$transaction(async (tx) => {
        // Verificar cuántos cupos early bird quedan (atómico dentro de la tx)
        const earlyBirdCount = await tx.user.count({
          where: { earlyBirdDiscount: true },
        });
        const isEarlyBird = earlyBirdCount < EARLY_BIRD_LIMIT;

        await tx.user.create({
          data: {
            name:               pending.name,
            email:              pending.email,
            password:           pending.passwordHash,
            role:               "USER",
            phone:              pending.phone,
            recoveryEmail:      pending.recoveryEmail,
            emailVerified:      new Date(),
            earlyBirdDiscount:  isEarlyBird,
            earlyBirdDiscountAt: isEarlyBird ? new Date() : undefined,
          },
        });
        await (tx as any).pendingRegistration.delete({ where: { id: tokenId } });
      });

      // Responder indicando si el nuevo usuario es early bird
      const createdUser = await prisma.user.findUnique({
        where: { email: pending.email },
        select: { earlyBirdDiscount: true },
      });

      return NextResponse.json({
        success: true,
        earlyBirdDiscount: createdUser?.earlyBirdDiscount ?? false,
        earlyBirdDiscountPct: createdUser?.earlyBirdDiscount ? EARLY_BIRD_DISCOUNT_PCT : 0,
      });
    }

    // ── Fallback: buscar en EmailVerificationToken (usuarios ya existentes) ───
    const record = await (prisma as any).emailVerificationToken.findUnique({
      where: { id: tokenId },
    });

    if (!record) {
      return NextResponse.json(
        { message: "Token inválido o ya utilizado" },
        { status: 400 }
      );
    }

    // ── Expiración ────────────────────────────────────────────────────────────
    if (new Date() > new Date(record.expires)) {
      await (prisma as any).emailVerificationToken.delete({ where: { id: tokenId } });
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
      await (prisma as any).emailVerificationToken.update({
        where: { id: tokenId },
        data:  { attempts: record.attempts + 1 },
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

    // ── Código correcto → verificar email y eliminar token ────────────────────
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data:  { emailVerified: new Date() },
      }),
      (prisma as any).emailVerificationToken.delete({ where: { id: tokenId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VerifyEmail]", error);
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}
