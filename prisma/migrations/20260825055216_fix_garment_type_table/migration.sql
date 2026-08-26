-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "shippingRateId" TEXT;

-- AlterTable
ALTER TABLE "municipalities" ADD COLUMN     "shippingRateId" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "shippingRateName" TEXT,
ADD COLUMN     "shippingZone" TEXT;

-- CreateTable
CREATE TABLE "shipping_configs" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "freeShippingThreshold" INTEGER NOT NULL,
    "defaultRateId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_rates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shipping_configs_defaultRateId_key" ON "shipping_configs"("defaultRateId");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_rates_name_key" ON "shipping_rates"("name");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_shippingRateId_fkey" FOREIGN KEY ("shippingRateId") REFERENCES "shipping_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municipalities" ADD CONSTRAINT "municipalities_shippingRateId_fkey" FOREIGN KEY ("shippingRateId") REFERENCES "shipping_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_configs" ADD CONSTRAINT "shipping_configs_defaultRateId_fkey" FOREIGN KEY ("defaultRateId") REFERENCES "shipping_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
