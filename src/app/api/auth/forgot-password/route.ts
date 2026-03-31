import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/services/email/client";
import { generateSecureCode } from "@/lib/auth/validation";
import { z } from "zod";

const forgotSchema = z.object({
  recoveryEmail: z
    .string()
    .trim()
    .email("Correo de recuperación inválido")
    .max(254, "Correo demasiado largo")
    .transform((v) => v.toLowerCase()),
});

// Respuesta genérica: nunca revelar si el recoveryEmail existe en la BD
const GENERIC_OK = {
  message:
    "Si el correo existe en nuestra base de datos, recibirás un código en los próximos minutos.",
};

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Cuerpo de solicitud inválido" }, { status: 400 });
    }

    const parsed = forgotSchema.safeParse(body);
    if (!parsed.success) {
      // Respuesta genérica incluso en error de formato → no revelar información
      return NextResponse.json(GENERIC_OK, { status: 200 });
    }

    const normalizedEmail = parsed.data.recoveryEmail;

    // ── Buscar usuario por recoveryEmail ──────────────────────────────────────
    const user = await prisma.user.findFirst({
      where: { recoveryEmail: { equals: normalizedEmail, mode: "insensitive" } },
      select: { id: true, name: true, recoveryEmail: true },
    });

    if (!user || !user.recoveryEmail) {
      // No revelar si existe: respuesta idéntica en ambos casos
      return NextResponse.json(GENERIC_OK, { status: 200 });
    }

    // ── Cooldown: no permitir reenvío antes de 60 s ───────────────────────────
    const existing = await prisma.passwordResetToken.findUnique({
      where: { userId: user.id },
      select: { createdAt: true },
    });

    if (existing) {
      const secondsSince = (Date.now() - existing.createdAt.getTime()) / 1000;
      if (secondsSince < 60) {
        const waitSeconds = Math.ceil(60 - secondsSince);
        return NextResponse.json(
          {
            message: `Espera ${waitSeconds} segundos antes de solicitar otro código.`,
            cooldown: waitSeconds,
          },
          { status: 429 }
        );
      }
    }

    // ── Generar OTP y persistir ───────────────────────────────────────────────
    const code = generateSecureCode();
    const codeHash = await hash(code, 10);
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    const token = await prisma.passwordResetToken.upsert({
      where:  { userId: user.id },
      create: { userId: user.id, codeHash, expires, attempts: 0, verified: false },
      update: { codeHash, expires, attempts: 0, verified: false, createdAt: new Date() },
      select: { id: true },
    });

    // ── Enviar email al recoveryEmail ─────────────────────────────────────────
    await sendPasswordResetEmail({
      customerEmail: user.recoveryEmail,
      customerName:  user.name || user.recoveryEmail,
      code,
    });

    // ── Devolver tokenId opaco (sin userId, sin email) ────────────────────────
    return NextResponse.json({ tokenId: token.id }, { status: 200 });
  } catch (error) {
    console.error("[forgot-password]", error instanceof Error ? error.message : "Error desconocido");
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
