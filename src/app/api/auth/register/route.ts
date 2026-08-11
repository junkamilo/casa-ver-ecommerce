import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { sendVerificationEmail } from "@/services/email/client";
import { registerServerSchema, generateSecureCode } from "@/lib/auth/validation";
import { rateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const rl = await rateLimit(`${ip}:register`, RATE_LIMIT_CONFIGS.auth);
  if (!rl.success) {
    return NextResponse.json(
      { message: "Demasiados intentos. Espera un momento e intenta de nuevo." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  try {
    const body = await request.json();

    // ── Validación estricta server-side con Zod ──────────────────────────────
    const parsed = registerServerSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
      return NextResponse.json({ message }, { status: 400 });
    }

    const { email, password, name, recoveryEmail, phone } = parsed.data;

    // ── Verificar si ya existe un usuario VERIFICADO con ese correo ──────────
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json(
        { message: "El correo ya está registrado" },
        { status: 400 }
      );
    }

    // Si existe un usuario sin verificar (registro antiguo con bug), eliminarlo
    if (existingUser && !existingUser.emailVerified) {
      await prisma.user.delete({ where: { email } });
    }

    // ── Generar código y hash de contraseña ───────────────────────────────────
    const hashedPassword = await hash(password, 10);
    const code = generateSecureCode();
    const codeHash = await hash(code, 10);
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // ── Guardar registro pendiente (SIN crear usuario todavía) ────────────────
    // El usuario solo se crea en la BD cuando verifique su correo exitosamente.
    const pending = await prisma.pendingRegistration.upsert({
      where:  { email },
      create: {
        name:         name || null,
        email,
        passwordHash: hashedPassword,
        phone:        phone || null,
        recoveryEmail: recoveryEmail || null,
        codeHash,
        expires,
        attempts:     0,
      },
      update: {
        name:         name || null,
        passwordHash: hashedPassword,
        phone:        phone || null,
        recoveryEmail: recoveryEmail || null,
        codeHash,
        expires,
        attempts:     0,
        createdAt:    new Date(),
      },
      select: { id: true },
    });

    // ── Enviar email con el código ────────────────────────────────────────────
    await sendVerificationEmail({
      customerEmail: email,
      customerName: name || email,
      code,
    });

    // ── Respuesta mínima: solo el tokenId opaco ───────────────────────────────
    return NextResponse.json(
      { tokenId: pending.id, requiresVerification: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register]", error instanceof Error ? error.message : "Error desconocido");
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}
