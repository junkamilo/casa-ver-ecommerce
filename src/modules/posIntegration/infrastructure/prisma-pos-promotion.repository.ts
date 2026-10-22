import { prisma } from "@/lib/prisma";
import { batchCouponKey, posPromotionIdOf, type MappedPosPromotion } from "../domain/pos-promotion-mapper";
import { PosSyncConflictError } from "./prisma-pos-sync.repository";

export type PosPromotionUpsertResult = {
  couponId: string;
  code: string;
  change: "created" | "updated" | "adopted";
};

/**
 * Cupones `source = POS`: copia de solo lectura de las promociones del POS, enlazada por
 * `posPromotionId`. Los cupones de la web (`source = WEB`) no se tocan, salvo la adopción explícita
 * de un cupón promocional desactivado con el mismo código (migración gradual al POS).
 */
export class PrismaPosPromotionRepository {
  /** Productos de la web por slug del POS (sin distinguir mayúsculas). */
  async findProductIdsByPosSlugs(slugs: string[]): Promise<string[]> {
    if (slugs.length === 0) return [];
    const rows = await prisma.product.findMany({
      where: { OR: slugs.map((slug) => ({ posSlug: { equals: slug, mode: "insensitive" as const } })) },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }

  /** Categorías espejo por webId del POS. */
  async findCategoryIdsByPosWebIds(webIds: string[]): Promise<string[]> {
    if (webIds.length === 0) return [];
    const rows = await prisma.category.findMany({ where: { posWebId: { in: webIds } }, select: { id: true } });
    return rows.map((r) => r.id);
  }

  /**
   * Crea o actualiza el cupón de una promoción del POS. Nunca toca `currentGlobalUses` ni los usos.
   * - Ya enlazado (mismo posPromotionId): se actualiza; si cambió el código y choca con otro cupón → conflicto.
   * - Nuevo con un código libre: se crea.
   * - Nuevo con el código de un cupón promocional de la web DESACTIVADO: se adopta (pasa a ser del POS y
   *   conserva su historial). Así se migra un cupón de la web al POS sin perder sus usos.
   * - Nuevo con el código de un cupón de la web activo o de otro tipo: conflicto; el cupón de la web no cambia.
   */
  async upsert(mapped: MappedPosPromotion, scopeProductIds: string[], scopeCategoryIds: string[]): Promise<PosPromotionUpsertResult> {
    const data = {
      code: mapped.code,
      label: mapped.label,
      kind: "PROMOTIONAL" as const,
      source: "POS" as const,
      codeSource: "CUSTOM" as const,
      discountType: mapped.discountType,
      discountValue: mapped.discountValue,
      discountPercentage: mapped.discountPercentage,
      maxGlobalUses: mapped.maxGlobalUses,
      maxUsesPerUser: mapped.maxUsesPerUser,
      scheduleMode: mapped.scheduleMode,
      validFrom: mapped.validFrom,
      validTo: mapped.validTo,
      expiresAt: null,
      isActive: mapped.isActive,
      minPurchase: mapped.minPurchase,
      scopeType: mapped.scopeType,
      scopeProductIds,
      scopeCategoryIds,
      posPromotionId: mapped.posPromotionId,
      posSyncedAt: new Date(),
    };

    return prisma.$transaction(async (tx) => {
      const linked = await tx.coupon.findUnique({ where: { posPromotionId: mapped.posPromotionId } });
      const byCode = await tx.coupon.findUnique({ where: { code: mapped.code } });

      if (linked) {
        if (byCode && byCode.id !== linked.id) {
          throw new PosSyncConflictError(
            `La promoción ${mapped.posPromotionId} cambió su código a ${mapped.code}, pero ese código ya lo usa otro cupón`,
          );
        }
        await tx.coupon.update({ where: { id: linked.id }, data });
        return { couponId: linked.id, code: mapped.code, change: "updated" as const };
      }

      if (!byCode) {
        const created = await tx.coupon.create({ data: { ...data, currentGlobalUses: 0, isUsed: false } });
        return { couponId: created.id, code: mapped.code, change: "created" as const };
      }

      const adoptable = byCode.source === "WEB" && byCode.kind === "PROMOTIONAL" && byCode.isActive === false;
      if (!adoptable) {
        throw new PosSyncConflictError(
          byCode.source === "POS"
            ? `El código ${mapped.code} ya lo usa otra promoción del POS (${byCode.posPromotionId})`
            : `El código ${mapped.code} ya lo usa un cupón de la web. Desactívalo en la web para migrarlo al POS`,
        );
      }
      // Adopción: el cupón de la web pasa a ser del POS y conserva sus usos (currentGlobalUses y CouponUsage).
      await tx.coupon.update({ where: { id: byCode.id }, data });
      return { couponId: byCode.id, code: mapped.code, change: "adopted" as const };
    });
  }

  /**
   * Lote (BATCH) del POS: cada código es un cupón BATCH_SINGLE de un solo uso (pestaña «Cupones»).
   * Uso entre canales:
   * - El POS dice `used` (se usó en la tienda o el POS ya registró el pedido web) → el cupón queda usado.
   * - El POS dice libre y el cupón lo había marcado el POS (sin orden de la web) → se libera (venta anulada).
   * - Si lo usó una orden de la web (`usedByOrderId`), manda el ciclo de la web (se libera si el pago falla).
   * Códigos que choquen con cupones ajenos se omiten y se informan en `conflicts`.
   */
  async upsertBatch(mapped: MappedPosPromotion): Promise<{ created: number; updated: number; removed: number; conflicts: string[] }> {
    const result = { created: 0, updated: 0, removed: 0, conflicts: [] as string[] };
    const now = new Date();
    const keys = new Set<string>();

    for (const item of mapped.batchCodes) {
      const key = batchCouponKey(mapped.posPromotionId, item.code);
      keys.add(key);
      const base = {
        kind: "BATCH_SINGLE" as const,
        source: "POS" as const,
        codeSource: "RANDOM" as const,
        label: mapped.label,
        discountType: "PERCENTAGE" as const,
        discountValue: mapped.discountValue,
        discountPercentage: mapped.discountValue,
        maxGlobalUses: 1,
        maxUsesPerUser: 1,
        scheduleMode: "NONE" as const,
        validFrom: null,
        validTo: null,
        isActive: mapped.isActive,
        minPurchase: null,
        scopeType: "ORDER" as const,
        scopeProductIds: [],
        scopeCategoryIds: [],
        posPromotionId: key,
        posSyncedAt: now,
      };

      const existing = await prisma.coupon.findUnique({
        where: { code: item.code },
        select: { id: true, posPromotionId: true, isUsed: true, usedByOrderId: true },
      });
      if (!existing) {
        await prisma.coupon.create({
          data: { ...base, code: item.code, isUsed: item.used, usedAt: item.used ? now : null },
        });
        result.created++;
        continue;
      }
      if (existing.posPromotionId !== key) {
        result.conflicts.push(`${item.code} ya existe en la web`);
        continue;
      }
      const usage =
        item.used && !existing.isUsed
          ? { isUsed: true, usedAt: now }
          : !item.used && existing.isUsed && !existing.usedByOrderId
            ? { isUsed: false, usedAt: null }
            : {};
      await prisma.coupon.update({ where: { id: existing.id }, data: { ...base, ...usage } });
      result.updated++;
    }

    // Códigos del lote que el POS ya no publica: se retiran como cualquier cupón del POS.
    const local = await prisma.coupon.findMany({
      where: { posPromotionId: { startsWith: batchCouponKey(mapped.posPromotionId, "") } },
      select: { posPromotionId: true },
    });
    for (const row of local) {
      if (!keys.has(row.posPromotionId as string)) {
        await this.removeCoupon(row.posPromotionId as string);
        result.removed++;
      }
    }
    return result;
  }

  /**
   * La promoción ya no es para la web (eliminada en el POS o sin canal WEB). Con usos u órdenes se
   * desactiva y conserva su historial; sin usos se borra. En un lote se aplica a cada uno de sus códigos.
   */
  async removeByPosPromotionId(posPromotionId: string): Promise<"deactivated" | "deleted" | "missing"> {
    const keys = await prisma.coupon.findMany({
      where: {
        OR: [
          { posPromotionId },
          { posPromotionId: { startsWith: batchCouponKey(posPromotionId, "") } },
        ],
      },
      select: { posPromotionId: true },
    });
    if (keys.length === 0) return "missing";
    const outcomes = [];
    for (const row of keys) outcomes.push(await this.removeCoupon(row.posPromotionId as string));
    return outcomes.includes("deactivated") ? "deactivated" : "deleted";
  }

  private async removeCoupon(key: string): Promise<"deactivated" | "deleted"> {
    const coupon = await prisma.coupon.findUnique({
      where: { posPromotionId: key },
      select: { id: true, isUsed: true, currentGlobalUses: true, _count: { select: { usages: true, orders: true } } },
    });
    if (!coupon) return "deleted";
    const used =
      coupon.isUsed || coupon.currentGlobalUses > 0 || coupon._count.usages > 0 || coupon._count.orders > 0;
    if (used) {
      await prisma.coupon.update({ where: { id: coupon.id }, data: { isActive: false, posSyncedAt: new Date() } });
      return "deactivated";
    }
    await prisma.coupon.delete({ where: { id: coupon.id } });
    return "deleted";
  }

  /** promotionId del POS de los cupones del POS guardados en la web (los lotes una sola vez). */
  async listPosPromotionIds(): Promise<string[]> {
    const rows = await prisma.coupon.findMany({
      where: { source: "POS", posPromotionId: { not: null } },
      select: { posPromotionId: true },
    });
    return [...new Set(rows.map((r) => posPromotionIdOf(r.posPromotionId) as string))];
  }
}
