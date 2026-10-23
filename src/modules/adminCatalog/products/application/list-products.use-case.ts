import type { ProductListQueryDTO } from "../contracts/product-list.dto";
import { productListQuerySchema } from "../contracts/product-list.schema";
import { PrismaProductRepository } from "../infrastructure/prisma-product.repository";
import { ProductValidationError } from "./product.errors";
import { isPosCatalogConfigured } from "@/modules/posIntegration/infrastructure/pos-config";
import { getPosCategoriesBySlug } from "@/modules/posIntegration/application/get-pos-product-categories.use-case";
import { normalizePosSlug } from "@/modules/posIntegration/domain/pos-mapper";

const productRepository = new PrismaProductRepository();

export async function listProductsUseCase(input: unknown) {
  const parsed = productListQuerySchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new ProductValidationError(firstIssue?.message ?? "Parámetros inválidos");
  }

  const query: ProductListQueryDTO = {
    page: parsed.data.page,
    limit: parsed.data.limit,
  };

  const result = await productRepository.listProducts(query);
  const posCatalogEnabled = isPosCatalogConfigured();
  if (!posCatalogEnabled) return { ...result, posCatalogEnabled };

  // Categorías de cada producto del POS, como las publica el POS hoy (la web no guarda categorías).
  const posSlugs = result.data.map((p) => p.posSlug).filter((slug): slug is string => Boolean(slug));
  const categoriesBySlug = await getPosCategoriesBySlug(posSlugs);
  const data = result.data.map((p) => ({
    ...p,
    categories: p.posSlug
      ? (categoriesBySlug.get(normalizePosSlug(p.posSlug)) ?? []).map((c) => ({ id: c.webId, name: c.name }))
      : [],
  }));
  return { ...result, data, posCatalogEnabled };
}
