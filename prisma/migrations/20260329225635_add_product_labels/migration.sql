-- AlterTable
ALTER TABLE "products" ADD COLUMN     "isOnSale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOnSaleAt" TIMESTAMP(3),
ADD COLUMN     "isProductNew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isProductNewAt" TIMESTAMP(3);
