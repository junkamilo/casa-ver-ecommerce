/*
  Warnings:

  - You are about to drop the `sub_product_colors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sub_product_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sub_product_variants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sub_products` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "sub_product_colors" DROP CONSTRAINT "sub_product_colors_subProductId_fkey";

-- DropForeignKey
ALTER TABLE "sub_product_images" DROP CONSTRAINT "sub_product_images_colorId_fkey";

-- DropForeignKey
ALTER TABLE "sub_product_variants" DROP CONSTRAINT "sub_product_variants_colorId_fkey";

-- DropForeignKey
ALTER TABLE "sub_products" DROP CONSTRAINT "sub_products_productId_fkey";

-- DropTable
DROP TABLE "sub_product_colors";

-- DropTable
DROP TABLE "sub_product_images";

-- DropTable
DROP TABLE "sub_product_variants";

-- DropTable
DROP TABLE "sub_products";
