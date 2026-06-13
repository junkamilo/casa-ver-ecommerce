-- Coupon batches for admin bulk generation

CREATE TABLE "coupon_batches" (
    "id"                 TEXT NOT NULL,
    "discountPercentage" INTEGER NOT NULL,
    "quantity"           INTEGER NOT NULL,
    "createdById"        TEXT,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_batches_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "coupon_batches"
    ADD CONSTRAINT "coupon_batches_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "coupons" ALTER COLUMN "assignedEmail" DROP NOT NULL;

ALTER TABLE "coupons" ADD COLUMN "batchId" TEXT;
ALTER TABLE "coupons" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "coupons"
    ADD CONSTRAINT "coupons_batchId_fkey"
    FOREIGN KEY ("batchId") REFERENCES "coupon_batches"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "coupons_batchId_idx" ON "coupons"("batchId");
