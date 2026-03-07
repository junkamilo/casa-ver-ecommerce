-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'MERCADOPAGO';

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productId_fkey";
