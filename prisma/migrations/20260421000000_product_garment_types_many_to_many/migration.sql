-- Migración: product_garment_types (muchos-a-muchos)
-- Crea la tabla de unión, migra datos existentes y elimina la columna antigua.

-- CreateTable
CREATE TABLE "product_garment_types" (
    "productId" TEXT NOT NULL,
    "garmentTypeId" TEXT NOT NULL,

    CONSTRAINT "product_garment_types_pkey" PRIMARY KEY ("productId","garmentTypeId")
);

-- AddForeignKey
ALTER TABLE "product_garment_types" ADD CONSTRAINT "product_garment_types_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_garment_types" ADD CONSTRAINT "product_garment_types_garmentTypeId_fkey"
    FOREIGN KEY ("garmentTypeId") REFERENCES "garment_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- MigrateData: preservar el garmentTypeId existente en cada producto
INSERT INTO "product_garment_types" ("productId", "garmentTypeId")
SELECT "id", "garmentTypeId"
FROM "products"
WHERE "garmentTypeId" IS NOT NULL;

-- DropColumn: eliminar la columna FK antigua
ALTER TABLE "products" DROP COLUMN "garmentTypeId";
