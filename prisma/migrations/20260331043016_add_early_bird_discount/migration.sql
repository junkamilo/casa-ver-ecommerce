-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "earlyBirdDiscountApplied" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "earlyBirdDiscount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "earlyBirdDiscountAt" TIMESTAMP(3);
