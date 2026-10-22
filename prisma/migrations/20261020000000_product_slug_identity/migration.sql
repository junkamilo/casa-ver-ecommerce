-- Identidad de producto por slug (md/DISENO-IDENTIDAD-POS-CHECKOUT.md, pasos G y H).
-- Reseñas, pedidos y carritos dejan de apuntar al id de Neon del producto y usan su slug (la URL
-- /product/<slug>, igual en el POS y en la web), para que la tienda pueda leer el catálogo del POS.
-- Idempotente.

-- Reseñas: slug y nombre del producto; sin FK a products.
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "productSlug" TEXT;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "productName" TEXT;

UPDATE "reviews" r
SET "productSlug" = p."slug", "productName" = COALESCE(r."productName", p."name")
FROM "products" p
WHERE r."productId" = p."id" AND r."productSlug" IS NULL;

-- Reseñas de productos que ya no existen: se conserva el id como slug para no perderlas.
UPDATE "reviews" SET "productSlug" = "productId" WHERE "productSlug" IS NULL;

ALTER TABLE "reviews" ALTER COLUMN "productSlug" SET NOT NULL;
ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "reviews_productId_fkey";
ALTER TABLE "reviews" ALTER COLUMN "productId" DROP NOT NULL;
DROP INDEX IF EXISTS "reviews_orderId_productId_key";
DROP INDEX IF EXISTS "reviews_productId_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_orderId_productSlug_key" ON "reviews"("orderId", "productSlug");
CREATE INDEX IF NOT EXISTS "reviews_productSlug_idx" ON "reviews"("productSlug");

-- Pedidos y carritos: productId pasa de id de Neon a slug (sin FK; ya guardaban snapshot).
UPDATE "order_items" oi SET "productId" = p."slug" FROM "products" p WHERE oi."productId" = p."id";
UPDATE "cart_items" ci SET "productId" = p."slug" FROM "products" p WHERE ci."productId" = p."id";
