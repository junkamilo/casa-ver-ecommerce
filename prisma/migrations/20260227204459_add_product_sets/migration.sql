-- AlterTable
ALTER TABLE "products" ADD COLUMN     "isSet" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "product_items" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2),
    "videoUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_item_colors" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hexCode" TEXT NOT NULL,

    CONSTRAINT "product_item_colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_item_images" (
    "id" TEXT NOT NULL,
    "colorId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_item_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_item_variants" (
    "id" TEXT NOT NULL,
    "colorId" TEXT NOT NULL,
    "size" "Size" NOT NULL,
    "sku" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "product_item_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_items_productId_idx" ON "product_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_item_colors_itemId_name_key" ON "product_item_colors"("itemId", "name");

-- CreateIndex
CREATE INDEX "product_item_images_colorId_idx" ON "product_item_images"("colorId");

-- CreateIndex
CREATE UNIQUE INDEX "product_item_variants_sku_key" ON "product_item_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_item_variants_colorId_size_key" ON "product_item_variants"("colorId", "size");

-- AddForeignKey
ALTER TABLE "product_items" ADD CONSTRAINT "product_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_item_colors" ADD CONSTRAINT "product_item_colors_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "product_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_item_images" ADD CONSTRAINT "product_item_images_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "product_item_colors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_item_variants" ADD CONSTRAINT "product_item_variants_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "product_item_colors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
