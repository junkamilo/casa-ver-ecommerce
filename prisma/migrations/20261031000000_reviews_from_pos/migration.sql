-- Reseñas 100 % en el POS (md/COMPARACION-TABLAS-RESENAS-POS-vs-WEB.md).
--
-- Las reseñas, sus enlaces del correo (token) y su moderación viven en el POS (catalog.reviews, V110; Diseño →
-- Reseñas). La web solo las envía y muestra las aprobadas por la API pública. La tabla reviews de Neon se mueve
-- al esquema "legacy_reviews" (fuera de Prisma) como respaldo, sin borrar datos. Para eliminarla del todo:
-- DROP SCHEMA legacy_reviews CASCADE;

CREATE SCHEMA IF NOT EXISTS "legacy_reviews";

-- El enum ReviewStatus se retira: la columna pasa a texto antes de mover la tabla.
ALTER TABLE "reviews" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "reviews" ALTER COLUMN "status" TYPE TEXT USING "status"::TEXT;

ALTER TABLE "reviews" SET SCHEMA "legacy_reviews";

DROP TYPE IF EXISTS "ReviewStatus";
