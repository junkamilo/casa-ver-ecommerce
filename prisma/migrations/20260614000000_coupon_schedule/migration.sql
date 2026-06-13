-- CreateEnum
CREATE TYPE "CouponScheduleMode" AS ENUM ('NONE', 'SINGLE_DAY', 'DATE_RANGE');

-- AlterTable
ALTER TABLE "coupons" ADD COLUMN "scheduleMode" "CouponScheduleMode" NOT NULL DEFAULT 'NONE';
ALTER TABLE "coupons" ADD COLUMN "validFrom" TIMESTAMP(3);
ALTER TABLE "coupons" ADD COLUMN "validTo" TIMESTAMP(3);

-- Backfill promotional coupons with legacy expiresAt
UPDATE "coupons"
SET
  "scheduleMode" = 'SINGLE_DAY',
  "validFrom" = (DATE_TRUNC('day', "expiresAt" AT TIME ZONE 'America/Bogota') AT TIME ZONE 'America/Bogota'),
  "validTo" = ((DATE_TRUNC('day', "expiresAt" AT TIME ZONE 'America/Bogota') + INTERVAL '1 day' - INTERVAL '1 millisecond') AT TIME ZONE 'America/Bogota')
WHERE "kind" = 'PROMOTIONAL' AND "expiresAt" IS NOT NULL;
