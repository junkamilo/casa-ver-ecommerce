-- Productos e inventario 100 % en el POS (md/COMPARACION-TABLAS-INVENTARIO-Y-PRODUCTOS-POS-vs-WEB.md).
--
-- La tienda lee productos, variantes, precios, fotos e inventario de la API pública del POS, y el checkout
-- reserva las unidades en el POS (inventory.stock_reservations, V109) mientras el cliente paga. La web solo
-- guarda su capa por slug (product_web_settings). Las tablas de catálogo y stock de Neon dejan de usarse:
-- se mueven al esquema "legacy_catalog" (fuera de Prisma) como respaldo de solo lectura, sin borrar datos.
-- Para eliminarlas del todo más adelante: DROP SCHEMA legacy_catalog CASCADE;

CREATE SCHEMA IF NOT EXISTS "legacy_catalog";

-- El enum ProductStatus se retira: la columna pasa a texto antes de mover la tabla.
ALTER TABLE "products" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "products" ALTER COLUMN "status" TYPE TEXT USING "status"::TEXT;

ALTER TABLE "stock_reservations"    SET SCHEMA "legacy_catalog";
ALTER TABLE "product_item_variants" SET SCHEMA "legacy_catalog";
ALTER TABLE "product_item_images"   SET SCHEMA "legacy_catalog";
ALTER TABLE "product_item_colors"   SET SCHEMA "legacy_catalog";
ALTER TABLE "product_items"         SET SCHEMA "legacy_catalog";
ALTER TABLE "product_variants"      SET SCHEMA "legacy_catalog";
ALTER TABLE "product_images"        SET SCHEMA "legacy_catalog";
ALTER TABLE "product_colors"        SET SCHEMA "legacy_catalog";
ALTER TABLE "products"              SET SCHEMA "legacy_catalog";

DROP TYPE IF EXISTS "ProductStatus";
