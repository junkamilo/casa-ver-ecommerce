-- AlterTable
ALTER TABLE "product_items" ADD COLUMN IF NOT EXISTS "isCardFeatured" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: for each product, mark the lowest-order item as featured if none is
UPDATE "product_items" pi
SET "isCardFeatured" = true
FROM (
  SELECT DISTINCT ON ("productId")
    id
  FROM "product_items"
  ORDER BY "productId", "order" ASC, id ASC
) AS first_item
WHERE pi.id = first_item.id
  AND NOT EXISTS (
    SELECT 1
    FROM "product_items" other
    WHERE other."productId" = pi."productId"
      AND other."isCardFeatured" = true
  );
