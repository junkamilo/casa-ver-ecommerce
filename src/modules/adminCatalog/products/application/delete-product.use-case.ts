import { PrismaProductRepository } from "../infrastructure/prisma-product.repository";
import { ProductNotFoundError } from "./product.errors";
import { deleteMediaAssetsByUrls } from "@/lib/media-admin";

const productRepository = new PrismaProductRepository();

export async function deleteProductUseCase(input: { id: string }) {
  const result = await productRepository.deleteProductWithRelations(input.id);
  if (!result) {
    throw new ProductNotFoundError("Producto no encontrado");
  }

  if (result.assetUrls.length > 0) {
    try {
      await deleteMediaAssetsByUrls(result.assetUrls);
    } catch (mediaError) {
      console.error("[PRODUCT_DELETE] Error limpiando archivos en Bunny", mediaError);
    }
  }

  return { success: true };
}
