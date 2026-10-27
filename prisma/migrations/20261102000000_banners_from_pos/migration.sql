-- Banners del inicio 100 % en el POS (md/COMPARACION-TABLAS-BANNERS-POS-vs-WEB.md).
--
-- El carrusel del inicio (slides, archivos por dispositivo, encuadre, orden y duración) se administra en el POS
-- (catalog.hero_slides y catalog.hero_settings, V112; Diseño → Banners) y la web solo lee GET /api/public/banners.
-- Al migrar Neon no tenía slides y la duración (3000 ms) la sembró la V112. Las tablas se mueven al esquema
-- "legacy_hero" (fuera de Prisma) como respaldo, sin borrar datos. Para eliminarlas del todo:
-- DROP SCHEMA legacy_hero CASCADE;

CREATE SCHEMA IF NOT EXISTS "legacy_hero";

ALTER TABLE IF EXISTS "hero_slides" SET SCHEMA "legacy_hero";
ALTER TABLE IF EXISTS "hero_settings" SET SCHEMA "legacy_hero";
