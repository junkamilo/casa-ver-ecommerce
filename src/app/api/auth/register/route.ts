import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { sendVerificationEmail } from "@/services/email/client";
import { registerServerSchema, generateSecureCode } from "@/lib/auth/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ── Validación estricta server-side con Zod ──────────────────────────────
    const parsed = registerServerSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
      return NextResponse.json({ message }, { status: 400 });
    }

    const { email, password, name, recoveryEmail, phone } = parsed.data;

    // ── Verificar si el correo ya existe ─────────────────────────────────────
    const userFound = await prisma.user.findUnique({ where: { email } });
    if (userFound) {
      return NextResponse.json(
        { message: "El correo ya está registrado" },
        { status: 400 }
      );
    }

    // ── Crear usuario con emailVerified null ──────────────────────────────────
    const hashedPassword = await hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
        phone: phone || null,
        recoveryEmail: recoveryEmail || null,
        emailVerified: null,
      },
      select: { id: true }, // solo necesitamos el ID
    });

    // ── Generar y persistir código de verificación ────────────────────────────
    const code = generateSecureCode();
    const codeHash = await hash(code, 10);
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    const token = await (prisma as any).emailVerificationToken.upsert({
      where:  { userId: newUser.id },
      create: { userId: newUser.id, codeHash, expires, attempts: 0 },
      update: { codeHash, expires, attempts: 0 },
      select: { id: true },
    });

    // ── Enviar email con el código ────────────────────────────────────────────
    await sendVerificationEmail({
      customerEmail: email,
      customerName: name || email,
      code,
    });

    // ── Respuesta mínima: solo el tokenId opaco (sin userId ni datos del user) ─
    return NextResponse.json(
      { tokenId: token.id, requiresVerification: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register]", error);
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}
