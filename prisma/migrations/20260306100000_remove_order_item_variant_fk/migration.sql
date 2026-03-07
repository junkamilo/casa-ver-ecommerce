-- Drop FK constraint from order_items.variantId so it can reference
-- either product_variants or product_item_variants (for set products)
ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "order_items_variantId_fkey";
