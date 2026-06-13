-- CreateEnum
CREATE TYPE "CouponKind" AS ENUM ('BATCH_SINGLE', 'EMAIL_SINGLE', 'PROMOTIONAL');

-- CreateEnum
CREATE TYPE "CouponDiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- AlterTable coupons
ALTER TABLE "coupons" ADD COLUMN "kind" "CouponKind" NOT NULL DEFAULT 'BATCH_SINGLE';
ALTER TABLE "coupons" ADD COLUMN "discountType" "CouponDiscountType" NOT NULL DEFAULT 'PERCENTAGE';
ALTER TABLE "coupons" ADD COLUMN "discountValue" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "coupons" ADD COLUMN "maxGlobalUses" INTEGER;
ALTER TABLE "coupons" ADD COLUMN "maxUsesPerUser" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "coupons" ADD COLUMN "currentGlobalUses" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "coupons" ADD COLUMN "expiresAt" TIMESTAMP(3);
ALTER TABLE "coupons" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "coupons" ADD COLUMN "label" TEXT;

-- AlterTable orders
ALTER TABLE "orders" ADD COLUMN "appliedCouponId" TEXT;

-- Backfill legacy coupons
UPDATE "coupons"
SET
  "discountValue" = "discountPercentage",
  "kind" = CASE
    WHEN "assignedEmail" IS NOT NULL THEN 'EMAIL_SINGLE'::"CouponKind"
    WHEN "batchId" IS NOT NULL THEN 'BATCH_SINGLE'::"CouponKind"
    ELSE 'BATCH_SINGLE'::"CouponKind"
  END,
  "maxGlobalUses" = 1,
  "currentGlobalUses" = CASE WHEN "isUsed" = true THEN 1 ELSE 0 END;

-- CreateTable coupon_usages
CREATE TABLE "coupon_usages" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coupon_usages_orderId_key" ON "coupon_usages"("orderId");
CREATE INDEX "coupon_usages_couponId_email_idx" ON "coupon_usages"("couponId", "email");
CREATE INDEX "coupon_usages_couponId_documentId_idx" ON "coupon_usages"("couponId", "documentId");
CREATE INDEX "coupon_usages_couponId_userId_idx" ON "coupon_usages"("couponId", "userId");
CREATE INDEX "coupons_kind_idx" ON "coupons"("kind");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_appliedCouponId_fkey" FOREIGN KEY ("appliedCouponId") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
