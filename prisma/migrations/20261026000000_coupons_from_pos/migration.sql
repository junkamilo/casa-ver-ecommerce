-- Cupones y promociones: 100 % del POS (md/COMPARACION-TABLAS-PROMOCIONES-POS-vs-WEB.md, fase 4).
--
-- La web ya no guarda cupones: el checkout valida cada código contra el POS
-- (POST /api/public/promotions/validate), los cupones de bienvenida los emite el POS
-- (POST /api/public/promotions/{promotionId}/codes) y el uso queda en sales.promotion_redemptions cuando
-- la web reporta el pedido pagado. El POS crea, edita, programa, activa y audita las promociones.
--
-- 1. Cada orden guarda una foto del cupón que aplicó (código, promoción del POS, tipo y valor) y cada ítem
--    su parte del descuento. Se copian los datos de las órdenes que ya tenían cupón.
-- 2. No se borran datos: coupons, coupon_batches y coupon_usages se renombran a _legacy_* (sin llaves hacia
--    órdenes ni usuarios) para poder revisarlas o revertir. Una migración posterior las eliminará cuando se
--    confirme que no hacen falta, junto con sus enums (CouponKind, CouponSource, CouponScope, ...).

ALTER TABLE "orders"
    ADD COLUMN "couponCode" TEXT,
    ADD COLUMN "posPromotionId" TEXT,
    ADD COLUMN "couponDiscountType" TEXT,
    ADD COLUMN "couponDiscountValue" INTEGER;

ALTER TABLE "order_items" ADD COLUMN "couponDiscount" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Foto del cupón de las órdenes existentes. Los lotes del POS guardaban "<promotionId>:<código>".
UPDATE "orders" o
   SET "couponCode" = c."code",
       "posPromotionId" = CASE WHEN c."source" = 'POS' THEN split_part(c."posPromotionId", ':', 1) END,
       "couponDiscountType" = c."discountType"::text,
       "couponDiscountValue" = c."discountValue"
  FROM "coupons" c
 WHERE o."appliedCouponId" = c."id";

-- El vínculo orden ↔ cupón sigue en _legacy_coupon_usages."orderId" y en la foto copiada arriba.
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_appliedCouponId_fkey";
ALTER TABLE "orders" DROP COLUMN "appliedCouponId";

ALTER TABLE "coupon_usages" DROP CONSTRAINT IF EXISTS "coupon_usages_orderId_fkey";
ALTER TABLE "coupon_usages" DROP CONSTRAINT IF EXISTS "coupon_usages_userId_fkey";
ALTER TABLE "coupon_batches" DROP CONSTRAINT IF EXISTS "coupon_batches_createdById_fkey";

ALTER TABLE IF EXISTS "coupons" RENAME TO "_legacy_coupons";
ALTER TABLE IF EXISTS "coupon_batches" RENAME TO "_legacy_coupon_batches";
ALTER TABLE IF EXISTS "coupon_usages" RENAME TO "_legacy_coupon_usages";
