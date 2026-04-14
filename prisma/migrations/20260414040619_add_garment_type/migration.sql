-- CreateTable: tabla dinámica de tipos de prenda (reemplaza enum GarmentType estático)
CREATE TABLE "garment_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "garment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable: relación muchos-a-muchos entre Category y GarmentType
CREATE TABLE "category_garment_types" (
    "categoryId" TEXT NOT NULL,
    "garmentTypeId" TEXT NOT NULL,

    CONSTRAINT "category_garment_types_pkey" PRIMARY KEY ("categoryId","garmentTypeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "garment_types_slug_key" ON "garment_types"("slug");

-- CreateIndex
CREATE INDEX "garment_types_isActive_idx" ON "garment_types"("isActive");

-- CreateIndex
CREATE INDEX "garment_types_order_idx" ON "garment_types"("order");

-- AlterTable: columna nullable FK en products (no toca datos existentes)
ALTER TABLE "products" ADD COLUMN "garmentTypeId" TEXT;

-- AlterTable: columna nullable FK en product_items (no toca datos existentes)
ALTER TABLE "product_items" ADD COLUMN "garmentTypeId" TEXT;

-- AddForeignKey
ALTER TABLE "category_garment_types" ADD CONSTRAINT "category_garment_types_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_garment_types" ADD CONSTRAINT "category_garment_types_garmentTypeId_fkey"
    FOREIGN KEY ("garmentTypeId") REFERENCES "garment_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_garmentTypeId_fkey"
    FOREIGN KEY ("garmentTypeId") REFERENCES "garment_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_items" ADD CONSTRAINT "product_items_garmentTypeId_fkey"
    FOREIGN KEY ("garmentTypeId") REFERENCES "garment_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
