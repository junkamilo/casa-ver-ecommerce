-- CreateEnum
CREATE TYPE "PromoPopupPlacement" AS ENUM ('HOME', 'PRODUCT', 'CHECKOUT');

-- CreateTable
CREATE TABLE "promo_popups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "placement" "PromoPopupPlacement" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "headline" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "couponCode" TEXT NOT NULL,
    "disclaimer" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL,
    "ctaUrl" TEXT NOT NULL DEFAULT '/tienda',
    "delaySeconds" INTEGER NOT NULL DEFAULT 3,
    "scheduleMode" "CouponScheduleMode" NOT NULL DEFAULT 'NONE',
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_popups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promo_popups_placement_isActive_idx" ON "promo_popups"("placement", "isActive");
