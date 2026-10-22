-- Promociones del POS (docs/promociones-web-y-pos.md, B.7). Aditiva: los cupones existentes quedan como WEB.

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "CouponSource" AS ENUM ('WEB', 'POS');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CouponScope" AS ENUM ('ORDER', 'PRODUCTS', 'CATEGORIES');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- AlterTable
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "source" "CouponSource" NOT NULL DEFAULT 'WEB';
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "posPromotionId" TEXT;
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "posSyncedAt" TIMESTAMP(3);
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "minPurchase" INTEGER;
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "scopeType" "CouponScope" NOT NULL DEFAULT 'ORDER';
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "scopeProductIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "scopeCategoryIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "onSaleFromPos" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "coupons_posPromotionId_key" ON "coupons"("posPromotionId");
