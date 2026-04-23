import { PrismaProductRepository } from "../infrastructure/prisma-product.repository";
import { ProductNotFoundError } from "./product.errors";
import { deleteCloudinaryAssetsByUrls } from "@/lib/cloudinary-admin";

const productRepository = new PrismaProductRepository();

export async function deleteProductUseCase(input: { id: string }) {
  const result = await productRepository.deleteProductWithRelations(input.id);
  if (!result) {
    throw new ProductNotFoundError("Producto no encontrado");
  }

  if (result.assetUrls.length > 0) {
    try {
      await deleteCloudinaryAssetsByUrls(result.assetUrls);
    } catch (cloudinaryError) {
      console.error("[PRODUCT_DELETE] Error limpiando archivos en Cloudinary", cloudinaryError);
    }
  }

  return { success: true };
}
