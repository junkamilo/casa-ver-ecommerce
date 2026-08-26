-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "coverImageUrl" TEXT;

-- AlterTable
ALTER TABLE "product_items" ADD COLUMN IF NOT EXISTS "coverImageUrl" TEXT;

-- Backfill products: first cover image of the first color (by color id / creation order)
UPDATE "products" p
SET "coverImageUrl" = sub.url
FROM (
  SELECT DISTINCT ON (pc."productId")
    pc."productId",
    pi.url
  FROM "product_colors" pc
  INNER JOIN "product_images" pi ON pi."colorId" = pc.id AND pi."isCover" = true
  ORDER BY pc."productId", pc.id ASC, pi."order" ASC
) AS sub
WHERE p.id = sub."productId"
  AND p."coverImageUrl" IS NULL;

-- Fallback products: any first image of first color if no isCover row
UPDATE "products" p
SET "coverImageUrl" = sub.url
FROM (
  SELECT DISTINCT ON (pc."productId")
    pc."productId",
    pi.url
  FROM "product_colors" pc
  INNER JOIN "product_images" pi ON pi."colorId" = pc.id
  ORDER BY pc."productId", pc.id ASC, pi."order" ASC
) AS sub
WHERE p.id = sub."productId"
  AND p."coverImageUrl" IS NULL;

-- Backfill product items: first cover image of first item color
UPDATE "product_items" it
SET "coverImageUrl" = sub.url
FROM (
  SELECT DISTINCT ON (pic."itemId")
    pic."itemId",
    pii.url
  FROM "product_item_colors" pic
  INNER JOIN "product_item_images" pii ON pii."colorId" = pic.id AND pii."isCover" = true
  ORDER BY pic."itemId", pic.id ASC, pii."order" ASC
) AS sub
WHERE it.id = sub."itemId"
  AND it."coverImageUrl" IS NULL;

UPDATE "product_items" it
SET "coverImageUrl" = sub.url
FROM (
  SELECT DISTINCT ON (pic."itemId")
    pic."itemId",
    pii.url
  FROM "product_item_colors" pic
  INNER JOIN "product_item_images" pii ON pii."colorId" = pic.id
  ORDER BY pic."itemId", pic.id ASC, pii."order" ASC
) AS sub
WHERE it.id = sub."itemId"
  AND it."coverImageUrl" IS NULL;
