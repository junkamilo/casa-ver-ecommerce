-- CreateEnum
CREATE TYPE "CouponCodeSource" AS ENUM ('RANDOM', 'CUSTOM');

-- AlterTable
ALTER TABLE "coupons" ADD COLUMN "codeSource" "CouponCodeSource";

-- Cupones promocionales existentes sin origen explícito → aleatorio por defecto
UPDATE "coupons"
SET "codeSource" = 'RANDOM'
WHERE "kind" = 'PROMOTIONAL' AND "codeSource" IS NULL;
