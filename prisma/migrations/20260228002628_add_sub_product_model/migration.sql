-- CreateTable
CREATE TABLE "sub_products" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "videoUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_product_colors" (
    "id" TEXT NOT NULL,
    "subProductId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hexCode" TEXT NOT NULL,

    CONSTRAINT "sub_product_colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_product_images" (
    "id" TEXT NOT NULL,
    "colorId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sub_product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_product_variants" (
    "id" TEXT NOT NULL,
    "colorId" TEXT NOT NULL,
    "size" "Size" NOT NULL,
    "sku" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sub_product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sub_products_productId_idx" ON "sub_products"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "sub_product_colors_subProductId_name_key" ON "sub_product_colors"("subProductId", "name");

-- CreateIndex
CREATE INDEX "sub_product_images_colorId_idx" ON "sub_product_images"("colorId");

-- CreateIndex
CREATE UNIQUE INDEX "sub_product_variants_sku_key" ON "sub_product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "sub_product_variants_colorId_size_key" ON "sub_product_variants"("colorId", "size");

-- AddForeignKey
ALTER TABLE "sub_products" ADD CONSTRAINT "sub_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_product_colors" ADD CONSTRAINT "sub_product_colors_subProductId_fkey" FOREIGN KEY ("subProductId") REFERENCES "sub_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_product_images" ADD CONSTRAINT "sub_product_images_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "sub_product_colors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_product_variants" ADD CONSTRAINT "sub_product_variants_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "sub_product_colors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
