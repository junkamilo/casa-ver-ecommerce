-- Envíos del POS: las tarifas quedan enlazadas a su UUID en el POS. Aditiva.

-- AlterTable
ALTER TABLE "shipping_rates" ADD COLUMN IF NOT EXISTS "posRateId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "shipping_rates_posRateId_key" ON "shipping_rates"("posRateId");
