-- Additive columns present on production via schema but missing from older migrate history
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "abandonedCheckoutEmailSentAt" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "reviewRequestEmailSentAt" TIMESTAMP(3);
