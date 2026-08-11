import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { z } from "zod";
import { sendWelcomeEmail } from "@/services/email/client";

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
    const pending = await prisma.pendingRegistration.findUnique({
      where: { id: tokenId },
    });

    if (pending) {
      // ── Expiración ──────────────────────────────────────────────────────────
      if (new Date() > new Date(pending.expires)) {
        await prisma.pendingRegistration.delete({ where: { id: tokenId } });
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
        await prisma.pendingRegistration.update({
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
      await prisma.$transaction(async (tx) => {
        await tx.user.create({
          data: {
            name:          pending.name,
            email:         pending.email,
            password:      pending.passwordHash,
            role:          "USER",
            phone:         pending.phone,
            recoveryEmail: pending.recoveryEmail,
            emailVerified: new Date(),
          },
        });
        await tx.pendingRegistration.delete({ where: { id: tokenId } });
      });

      sendWelcomeEmail({ customerEmail: pending.email, customerName: pending.name || pending.email }).catch(
        (err) => console.error("[Email] Error enviando bienvenida:", err)
      );

      return NextResponse.json({ success: true });
    }

    // ── Fallback: buscar en EmailVerificationToken (usuarios ya existentes) ───
    const record = await prisma.emailVerificationToken.findUnique({
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
      await prisma.emailVerificationToken.delete({ where: { id: tokenId } });
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
      await prisma.emailVerificationToken.update({
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
      prisma.emailVerificationToken.delete({ where: { id: tokenId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VerifyEmail]", error instanceof Error ? error.message : "Error desconocido");
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}
