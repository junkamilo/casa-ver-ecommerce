-- Colores: 100 % del POS (md/COMPARACION-TABLAS-COLOR-POS-vs-WEB.md).
--
-- La tienda ya no lee ni escribe la tabla de colores de la web: la paleta sale de los colores activos que
-- publica el POS (GET /api/public/catalog/colors) y el POS es quien crea, edita y desactiva. Los productos
-- creados en la web solo muestran y venden los colores que existen en el POS (cruce por nombre).
--
-- No se borran datos: la tabla se renombra a _legacy_colors para poder revisarla o revertir (renombrándola
-- de vuelta). Una migración posterior la eliminará cuando se confirme que no hace falta. Los colores de cada
-- producto (product_colors, product_images, product_variants) no cambian.

ALTER TABLE IF EXISTS "colors" RENAME TO "_legacy_colors";
