-- AlterTable
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "posWebId" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "posSlug" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "posSyncedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "posAvailable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "posLowStock" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE IF NOT EXISTS "pos_webhook_events" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "occurredAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "pos_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "categories_posWebId_key" ON "categories"("posWebId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "products_posSlug_key" ON "products"("posSlug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "pos_webhook_events_eventId_key" ON "pos_webhook_events"("eventId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "pos_webhook_events_status_idx" ON "pos_webhook_events"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "pos_webhook_events_receivedAt_idx" ON "pos_webhook_events"("receivedAt");
