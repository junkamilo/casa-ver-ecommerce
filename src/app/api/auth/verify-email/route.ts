import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { z } from "zod";

const MAX_ATTEMPTS = 5;

// Validación estricta: tokenId opaco (1-128 chars) + código exactamente 6 dígitos
const verifyEmailSchema = z.object({
  tokenId: z.string().min(1).max(128),
  code: z
    .string()
    .regex(/^\d{6}$/, "El código debe ser exactamente 6 dígitos numéricos"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifyEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Datos inválidos" },
        { status: 400 }
      );
    }

    const { tokenId, code } = parsed.data;

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
      const isValid = await compare(code, pending.codeHash);

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
      // Estrategia anti-race-condition para Early Bird:
      //   1. Intentamos reclamar el cupo con UPDATE atómico (currentUses < maxUses).
      //   2. Si rowsAffected > 0, el cupo quedó reservado para este usuario.
      //   3. El usuario se crea dentro de la misma transacción DB.
      // No usamos SELECT + UPDATE porque entre ambas consultas otro proceso
      // podría haber reclamado el último cupo.
      const EARLY_BIRD_DISCOUNT_PCT = 10;
      const EARLY_BIRD_PROMOTION_ID = "early-bird-2026";

      await prisma.$transaction(async (tx) => {
        // Intentar reclamar cupo atómicamente en la tabla promotions
        const claimed: number = await tx.$executeRaw`
          UPDATE "promotions"
          SET "currentUses" = "currentUses" + 1,
              "updatedAt"   = NOW()
          WHERE "id"        = ${EARLY_BIRD_PROMOTION_ID}
            AND "isActive"  = true
            AND "currentUses" < "maxUses"
            AND ("startDate" IS NULL OR "startDate" <= NOW())
            AND ("endDate"   IS NULL OR "endDate"   >= NOW())
        `;

        const isEarlyBird = claimed > 0;

        await tx.user.create({
          data: {
            name:                pending.name,
            email:               pending.email,
            password:            pending.passwordHash,
            role:                "USER",
            phone:               pending.phone,
            recoveryEmail:       pending.recoveryEmail,
            emailVerified:       new Date(),
            earlyBirdDiscount:   isEarlyBird,
            earlyBirdDiscountAt: isEarlyBird ? new Date() : undefined,
          },
        });
        await (tx as any).pendingRegistration.delete({ where: { id: tokenId } });
      });

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
    const isValid = await compare(code, record.codeHash);

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
    console.error("[VerifyEmail]", error instanceof Error ? error.message : "Error desconocido");
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}
