-- Categorías, subcategorías y tipos de prenda: 100 % del POS.
--
-- La tienda ya no lee ni escribe estas tablas: el menú, las colecciones (/collections/<slug>), el
-- carrusel del home y la ubicación de cada producto salen del árbol que publica el POS
-- (GET /api/public/catalog/categories y /garment-types). El POS es quien crea y edita.
--
-- No se borran datos: las tablas se renombran a _legacy_* para poder revisarlas o revertir
-- (renombrándolas de vuelta). Una migración posterior las eliminará cuando se confirme que no hacen falta.
-- Los cupones con alcance por categorías guardan desde ahora webIds del POS (coupons.scopeCategoryIds).

ALTER TABLE IF EXISTS "product_garment_types"  RENAME TO "_legacy_product_garment_types";
ALTER TABLE IF EXISTS "category_garment_types" RENAME TO "_legacy_category_garment_types";
ALTER TABLE IF EXISTS "product_categories"     RENAME TO "_legacy_product_categories";
ALTER TABLE IF EXISTS "garment_types"          RENAME TO "_legacy_garment_types";
ALTER TABLE IF EXISTS "categories"             RENAME TO "_legacy_categories";

-- Las promociones del POS con alcance por categorías guardaban ids de Neon; se vacían para que el
-- próximo aviso o el cron del POS las vuelva a escribir con webIds del POS. Mientras tanto, un cupón
-- de este tipo no aplica a ningún producto (nunca a más de los debidos).
UPDATE "coupons"
SET "scopeCategoryIds" = '{}'
WHERE "source" = 'POS' AND "scopeType" = 'CATEGORIES';
