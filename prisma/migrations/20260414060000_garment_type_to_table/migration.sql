-- Migración: reemplaza enum GarmentType por tabla dinámica garment_types
-- No pierde datos existentes (los campos enum eran nullable y recién agregados)
-- Idempotente: la tabla garment_types/category_garment_types ya pudo haber sido
-- creada por la migración 20260414040619_add_garment_type; todos los pasos usan
-- guards para poder re-ejecutarse (shadow DB) sin chocar con objetos existentes.

-- 1. Quitar columnas enum de products y product_items (nullable, sin datos)
ALTER TABLE "products" DROP COLUMN IF EXISTS "garmentType";
ALTER TABLE "product_items" DROP COLUMN IF EXISTS "garmentType";

-- 2. Eliminar el enum ahora que ninguna columna lo referencia
DROP TYPE IF EXISTS "GarmentType";

-- 3. Crear tabla dinámica de tipos de prenda
CREATE TABLE IF NOT EXISTS "garment_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "garment_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "garment_types_slug_key" ON "garment_types"("slug");
CREATE INDEX IF NOT EXISTS "garment_types_isActive_idx" ON "garment_types"("isActive");
CREATE INDEX IF NOT EXISTS "garment_types_order_idx" ON "garment_types"("order");

-- 4. Crear tabla relación muchos-a-muchos Category ↔ GarmentType
CREATE TABLE IF NOT EXISTS "category_garment_types" (
    "categoryId" TEXT NOT NULL,
    "garmentTypeId" TEXT NOT NULL,

    CONSTRAINT "category_garment_types_pkey" PRIMARY KEY ("categoryId","garmentTypeId")
);

-- 5. Agregar columna FK nullable en products y product_items
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "garmentTypeId" TEXT;
ALTER TABLE "product_items" ADD COLUMN IF NOT EXISTS "garmentTypeId" TEXT;

-- 6. Foreign keys
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'category_garment_types_categoryId_fkey') THEN
    ALTER TABLE "category_garment_types"
      ADD CONSTRAINT "category_garment_types_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'category_garment_types_garmentTypeId_fkey') THEN
    ALTER TABLE "category_garment_types"
      ADD CONSTRAINT "category_garment_types_garmentTypeId_fkey"
      FOREIGN KEY ("garmentTypeId") REFERENCES "garment_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_garmentTypeId_fkey') THEN
    ALTER TABLE "products"
      ADD CONSTRAINT "products_garmentTypeId_fkey"
      FOREIGN KEY ("garmentTypeId") REFERENCES "garment_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_items_garmentTypeId_fkey') THEN
    ALTER TABLE "product_items"
      ADD CONSTRAINT "product_items_garmentTypeId_fkey"
      FOREIGN KEY ("garmentTypeId") REFERENCES "garment_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
