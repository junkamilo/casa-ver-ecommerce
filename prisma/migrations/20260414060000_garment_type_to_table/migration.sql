-- Migración: reemplaza enum GarmentType por tabla dinámica garment_types
-- No pierde datos existentes (los campos enum eran nullable y recién agregados)

-- 1. Quitar columnas enum de products y product_items (nullable, sin datos)
ALTER TABLE "products" DROP COLUMN IF EXISTS "garmentType";
ALTER TABLE "product_items" DROP COLUMN IF EXISTS "garmentType";

-- 2. Eliminar el enum ahora que ninguna columna lo referencia
DROP TYPE IF EXISTS "GarmentType";

-- 3. Crear tabla dinámica de tipos de prenda
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

CREATE UNIQUE INDEX "garment_types_slug_key" ON "garment_types"("slug");
CREATE INDEX "garment_types_isActive_idx" ON "garment_types"("isActive");
CREATE INDEX "garment_types_order_idx" ON "garment_types"("order");

-- 4. Crear tabla relación muchos-a-muchos Category ↔ GarmentType
CREATE TABLE "category_garment_types" (
    "categoryId" TEXT NOT NULL,
    "garmentTypeId" TEXT NOT NULL,

    CONSTRAINT "category_garment_types_pkey" PRIMARY KEY ("categoryId","garmentTypeId")
);

-- 5. Agregar columna FK nullable en products y product_items
ALTER TABLE "products" ADD COLUMN "garmentTypeId" TEXT;
ALTER TABLE "product_items" ADD COLUMN "garmentTypeId" TEXT;

-- 6. Foreign keys
ALTER TABLE "category_garment_types"
    ADD CONSTRAINT "category_garment_types_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "category_garment_types"
    ADD CONSTRAINT "category_garment_types_garmentTypeId_fkey"
    FOREIGN KEY ("garmentTypeId") REFERENCES "garment_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "products"
    ADD CONSTRAINT "products_garmentTypeId_fkey"
    FOREIGN KEY ("garmentTypeId") REFERENCES "garment_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "product_items"
    ADD CONSTRAINT "product_items_garmentTypeId_fkey"
    FOREIGN KEY ("garmentTypeId") REFERENCES "garment_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
