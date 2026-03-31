"use server";

import { prisma } from "@/lib/prisma";
import { EARLY_BIRD_LIMIT, EARLY_BIRD_DISCOUNT_PCT } from "@/lib/earlybird.constants";

export interface EarlyBirdStatus {
  hasDiscount: boolean;
  discountPct: number;
  slotsUsed: number;
  slotsRemaining: number;
}

/**
 * Verifica si un email tiene el descuento Early Bird activo.
 * Seguro: solo lee datos del usuario autenticado por email.
 */
export async function checkEarlyBirdStatus(email: string): Promise<EarlyBirdStatus> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { hasDiscount: false, discountPct: 0, slotsUsed: 0, slotsRemaining: EARLY_BIRD_LIMIT };
  }

  const [user, slotsUsed] = await Promise.all([
    prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { earlyBirdDiscount: true },
    }),
    prisma.user.count({ where: { earlyBirdDiscount: true } }),
  ]);

  const hasDiscount = user?.earlyBirdDiscount === true;

  return {
    hasDiscount,
    discountPct: hasDiscount ? EARLY_BIRD_DISCOUNT_PCT : 0,
    slotsUsed,
    slotsRemaining: Math.max(0, EARLY_BIRD_LIMIT - slotsUsed),
  };
}

/**
 * Retorna solo el conteo de cupos para el panel admin.
 */
export async function getEarlyBirdCount(): Promise<{ used: number; total: number }> {
  const used = await prisma.user.count({ where: { earlyBirdDiscount: true } });
  return { used, total: EARLY_BIRD_LIMIT };
}
