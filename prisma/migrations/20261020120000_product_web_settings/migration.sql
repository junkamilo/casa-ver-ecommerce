-- Capa web de los productos del POS (md/DISENO-IDENTIDAD-POS-CHECKOUT.md §8): lo que la web decide sobre
-- un producto del POS, separado de la copia del catálogo en "products" para poder dejar de copiarlo.
-- Aditiva e idempotente.

CREATE TABLE IF NOT EXISTS "product_web_settings" (
    "slug" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "coverImageUrl" TEXT,
    "videoUrl" TEXT,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "isOnSale" BOOLEAN NOT NULL DEFAULT false,
    "isOnSaleAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_web_settings_pkey" PRIMARY KEY ("slug")
);

CREATE INDEX IF NOT EXISTS "product_web_settings_publishedAt_idx" ON "product_web_settings"("publishedAt");

-- Copia de lo que hoy guarda la copia de cada producto del POS. Portada y video solo si los puso la web
-- (las fotos del POS llegan como /media/... o <base>/media/files/...); la oferta solo si es manual.
INSERT INTO "product_web_settings"
    ("slug", "metaTitle", "metaDescription", "coverImageUrl", "videoUrl", "isNew", "isOnSale", "isOnSaleAt",
     "publishedAt", "updatedAt")
SELECT
    p."slug",
    p."metaTitle",
    p."metaDescription",
    CASE WHEN p."coverImageUrl" LIKE '/media/%' OR p."coverImageUrl" LIKE '%/media/files/%' THEN NULL
         ELSE p."coverImageUrl" END,
    CASE WHEN p."videoUrl" LIKE '/media/%' OR p."videoUrl" LIKE '%/media/files/%' THEN NULL
         ELSE p."videoUrl" END,
    p."isNew",
    p."isOnSale" AND NOT p."onSaleFromPos",
    CASE WHEN p."isOnSale" AND NOT p."onSaleFromPos" THEN p."isOnSaleAt" END,
    p."createdAt",
    CURRENT_TIMESTAMP
FROM "products" p
WHERE p."posSlug" IS NOT NULL
ON CONFLICT ("slug") DO NOTHING;
