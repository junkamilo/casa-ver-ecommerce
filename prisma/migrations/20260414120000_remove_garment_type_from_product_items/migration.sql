-- Remove garmentTypeId from product_items (subcategories inherit type from parent category)
ALTER TABLE "product_items" DROP CONSTRAINT IF EXISTS "product_items_garmentTypeId_fkey";
ALTER TABLE "product_items" DROP COLUMN IF EXISTS "garmentTypeId";
