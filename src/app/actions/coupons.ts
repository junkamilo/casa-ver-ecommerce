"use server";

import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// ---------------------------------------------------------------------------
// generateFirstPurchaseCoupon
// Se llama cuando un email se registra por primera vez (en register o newsletter).
// Crea un cupón único del 10% vinculado a ese email. Idempotente.
// ---------------------------------------------------------------------------
export async function generateFirstPurchaseCoupon(email: string): Promise<{ success: boolean; code?: string; error?: string }> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Email inválido" };
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Idempotencia: si ya tiene un cupón sin usar para este email, lo devolvemos.
    const existing = await prisma.coupon.findFirst({
      where: { assignedEmail: normalizedEmail, isUsed: false },
    });

    if (existing) {
      return { success: true, code: existing.code };
    }

    // Generar código único: CV-XXXXXXXXXX (uppercase, hex)
    const code = `CV-${randomBytes(5).toString("hex").toUpperCase()}`;

    const coupon = await prisma.coupon.create({
      data: {
        code,
        discountPercentage: 10,
        assignedEmail: normalizedEmail,
        isUsed: false,
      },
    });

    return { success: true, code: coupon.code };
  } catch (err) {
    console.error("[generateFirstPurchaseCoupon] Error:", err);
    return { success: false, error: "Error al generar el cupón" };
  }
}

// ---------------------------------------------------------------------------
// validateCoupon
// Verifica que el cupón exista, no esté usado y pertenezca al email del formulario.
// Devuelve el porcentaje de descuento si es válido.
// ---------------------------------------------------------------------------
export async function validateCoupon(
  code: string,
  email: string
): Promise<{ valid: boolean; discountPercentage?: number; couponId?: string; error?: string }> {
  if (!code || !email) {
    return { valid: false, error: "Código y email son requeridos" };
  }

  const normalizedCode = code.toUpperCase().trim();
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (!coupon) {
      return { valid: false, error: "El cupón no existe" };
    }

    if (coupon.isUsed) {
      return { valid: false, error: "El cupón ya fue utilizado" };
    }

    if (coupon.assignedEmail !== normalizedEmail) {
      return { valid: false, error: "El cupón no pertenece a este correo" };
    }

    return {
      valid: true,
      discountPercentage: coupon.discountPercentage,
      couponId: coupon.id,
    };
  } catch (err) {
    console.error("[validateCoupon] Error:", err);
    return { valid: false, error: "Error al validar el cupón" };
  }
}
