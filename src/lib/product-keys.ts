import type { Prisma, PrismaClient } from "@prisma/client";

type Client = PrismaClient | Prisma.TransactionClient;

export type ProductKeyRow = { id: string; slug: string; posSlug: string | null };

/**
 * Productos de Neon por su clave: el slug (identidad actual de `OrderItem`/`CartItem.productId` y de las
 * reseñas) o el id de Neon (pedidos y carritos guardados antes de la migración a slugs). Devuelve
 * clave → producto; las claves sin producto (p. ej. productos del POS sin copia) no aparecen.
 */
export async function findProductsByKeys(client: Client, keys: string[]): Promise<Map<string, ProductKeyRow>> {
  const unique = [...new Set(keys.filter(Boolean))];
  if (unique.length === 0) return new Map();
  const rows = await client.product.findMany({
    where: { OR: [{ id: { in: unique } }, { slug: { in: unique } }] },
    select: { id: true, slug: true, posSlug: true },
  });
  const result = new Map<string, ProductKeyRow>();
  for (const row of rows) {
    result.set(row.id, row);
    result.set(row.slug, row);
  }
  return result;
}

/** Slug de cada clave de producto (id de Neon o slug); un slug sin producto en Neon se devuelve tal cual. */
export async function productSlugsByKeys(client: Client, keys: string[]): Promise<Map<string, string>> {
  const found = await findProductsByKeys(client, keys);
  return new Map(keys.map((key) => [key, found.get(key)?.slug ?? key]));
}
