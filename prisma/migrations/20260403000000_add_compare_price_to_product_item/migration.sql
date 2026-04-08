-- AlterTable: add comparePrice to product_items
ALTER TABLE "product_items" ADD COLUMN "comparePrice" DECIMAL(10,2);
