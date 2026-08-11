-- CreateTable
CREATE TABLE "accounting_sale_exports" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "payload" JSONB NOT NULL,
    "webhookStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "webhookAttempts" INTEGER NOT NULL DEFAULT 0,
    "webhookSentAt" TIMESTAMP(3),
    "webhookError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounting_sale_exports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounting_sale_exports_orderId_key" ON "accounting_sale_exports"("orderId");

-- CreateIndex
CREATE INDEX "accounting_sale_exports_paidAt_idx" ON "accounting_sale_exports"("paidAt");

-- CreateIndex
CREATE INDEX "accounting_sale_exports_orderNumber_idx" ON "accounting_sale_exports"("orderNumber");

-- AddForeignKey
ALTER TABLE "accounting_sale_exports" ADD CONSTRAINT "accounting_sale_exports_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
