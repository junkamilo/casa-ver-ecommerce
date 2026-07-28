-- AlterTable (additive only — no data deletion)
ALTER TABLE "products" ADD COLUMN "isSuggested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "suggestedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "products_isSuggested_status_idx" ON "products"("isSuggested", "status");
