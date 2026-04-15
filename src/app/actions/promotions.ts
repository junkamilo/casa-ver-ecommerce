"use server";

import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export interface PromotionStatus {
  id: string;
  name: string;
  discountPercentage: number;
  maxUses: number;
  currentUses: number;
  slotsRemaining: number;
  isActive: boolean;
  /** true si la promoción está activa, tiene cupos y está dentro del rango de fechas */
  isAvailable: boolean;
}

// ---------------------------------------------------------------------------
// getActivePromotion
// Devuelve la primera promoción activa con cupos disponibles.
// Seguro para llamar desde el cliente (solo expone datos públicos).
// ---------------------------------------------------------------------------
export async function getActivePromotion(): Promise<PromotionStatus | null> {
  const now = new Date();

  const promotion = await prisma.promotion.findFirst({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  if (!promotion) return null;

  const slotsRemaining = Math.max(0, promotion.maxUses - promotion.currentUses);

  return {
    id: promotion.id,
    name: promotion.name,
    discountPercentage: promotion.discountPercentage,
    maxUses: promotion.maxUses,
    currentUses: promotion.currentUses,
    slotsRemaining,
    isActive: promotion.isActive,
    isAvailable: slotsRemaining > 0,
  };
}

// ---------------------------------------------------------------------------
// claimPromotionSlot
// Incrementa currentUses ATÓMICAMENTE usando UPDATE ... WHERE para
// prevenir race conditions cuando dos usuarios reclaman el último cupo
// simultáneamente.
//
// Retorna true si el cupo fue reclamado exitosamente, false si ya no quedan.
// ---------------------------------------------------------------------------
export async function claimPromotionSlot(promotionId: string): Promise<boolean> {
  // $executeRaw retorna el número de filas afectadas.
  // La cláusula WHERE garantiza que el incremento solo ocurre si hay cupo.
  // Esto es atómico a nivel SQL — no puede haber race condition.
  const rowsAffected = await prisma.$executeRaw`
    UPDATE "promotions"
    SET "currentUses" = "currentUses" + 1,
        "updatedAt"   = NOW()
    WHERE "id"       = ${promotionId}
      AND "isActive" = true
      AND "currentUses" < "maxUses"
      AND ("startDate" IS NULL OR "startDate" <= NOW())
      AND ("endDate"   IS NULL OR "endDate"   >= NOW())
  `;

  return rowsAffected > 0;
}
