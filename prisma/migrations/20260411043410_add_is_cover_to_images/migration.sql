-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "isCover" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "product_item_images" ADD COLUMN     "isCover" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "product_images_colorId_isCover_idx" ON "product_images"("colorId", "isCover");

-- CreateIndex
CREATE INDEX "product_item_images_colorId_isCover_idx" ON "product_item_images"("colorId", "isCover");
