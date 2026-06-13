-- Migración: product_categories (muchos-a-muchos)
-- Crea la tabla de unión, migra datos existentes y elimina la columna antigua.

-- CreateTable
CREATE TABLE "product_categories" (
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("productId","categoryId")
);

-- CreateIndex
CREATE INDEX "product_categories_categoryId_idx" ON "product_categories"("categoryId");

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- MigrateData: preservar la categoría existente de cada producto
INSERT INTO "product_categories" ("productId", "categoryId")
SELECT "id", "categoryId"
FROM "products"
WHERE "categoryId" IS NOT NULL
ON CONFLICT DO NOTHING;

-- DropForeignKey + DropIndex + DropColumn
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_categoryId_fkey";
DROP INDEX IF EXISTS "products_categoryId_idx";
ALTER TABLE "products" DROP COLUMN "categoryId";
