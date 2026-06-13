-- Remove Early Bird program: promotions table and related columns

ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_appliedPromotionId_fkey";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "appliedPromotionId";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "earlyBirdDiscountApplied";

ALTER TABLE "users" DROP COLUMN IF EXISTS "earlyBirdDiscount";
ALTER TABLE "users" DROP COLUMN IF EXISTS "earlyBirdDiscountAt";

DROP TABLE IF EXISTS "promotions";
