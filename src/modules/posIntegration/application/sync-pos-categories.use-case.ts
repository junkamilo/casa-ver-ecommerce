import type { PosCategory } from "../contracts/pos-catalog.schema";
import { mapPosCategory } from "../domain/pos-mapper";
import { listCategories } from "../infrastructure/pos-catalog.client";
import { PrismaPosSyncRepository } from "../infrastructure/prisma-pos-sync.repository";

const repository = new PrismaPosSyncRepository();

export type PosCategorySyncResult = { upserted: number; deactivated: number };

/**
 * Refleja en la web el árbol de categorías del POS: cada categoría y subcategoría queda como una
 * categoría de la web enlazada por `posWebId` (las subcategorías con `parentId`). Así las colecciones
 * `/collections/<slug>` encuentran los productos del POS. También crea los tipos de prenda que publica
 * el POS. Las categorías espejo que el POS ya no publica se desactivan.
 */
export async function syncPosCategories(tree?: PosCategory[]): Promise<PosCategorySyncResult> {
  const categories = tree ?? (await listCategories());
  const seen: string[] = [];
  let upserted = 0;

  for (const category of categories) {
    const parentId = await repository.upsertPosCategory(mapPosCategory(category), null);
    seen.push(category.webId);
    upserted++;
    for (const sub of category.subcategories) {
      await repository.upsertPosCategory(mapPosCategory(sub), parentId);
      seen.push(sub.webId);
      upserted++;
    }
  }

  await repository.ensureGarmentTypes(
    categories
      .flatMap((c) => c.subcategories)
      .map((s) => s.garmentType)
      .filter((t): t is NonNullable<typeof t> => t != null)
      .map((t) => ({ slug: t.slug.trim().toLowerCase(), name: t.name.trim(), order: t.sortOrder })),
  );

  // Un árbol vacío es más probable una falla del POS que un borrado total: no se desactiva nada.
  const deactivated = categories.length > 0 ? await repository.deactivatePosCategoriesExcept(seen) : 0;
  return { upserted, deactivated };
}
