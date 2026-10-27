import type { PosProduct } from "@/modules/posIntegration/contracts/pos-catalog.schema";
import { mapPosProduct } from "@/modules/posIntegration/domain/pos-mapper";
import type { PosCollection, PosTaxonomy } from "@/modules/posIntegration/domain/pos-category-view";
import type { RawCollectionProduct } from "@/modules/collections/domain/product-mapper.entity";
import {
  resolveWebCover,
  resolveWebOnSale,
  type ProductWebOverlay,
} from "@/modules/catalog/product/domain/pos-product-detail.entity";
import {
  isSearchQueryActive,
  productMatchesSearch,
  scoreSearchRelevance,
  type SearchRelevanceFields,
} from "@/modules/search/domain/search.entity";

// ── Catálogo de lectura de la tienda ─────────────────────────────────────────
//
// Una entrada por producto visible del POS (API + capa web). Los listados, la búsqueda, los sugeridos y los recomendados filtran y ordenan
// estas entradas en memoria; la tarjeta sale por el mismo `transformProduct` de siempre.

export interface CatalogEntry {
  slug: string;
  source: "POS";
  /** Tarjeta con `variants.stock` por color (el home la usa para el badge "Agotado"). */
  card: RawCollectionProduct;
  /** Alta en la tienda: ordena los listados (más nuevo primero). */
  publishedAt: Date;
  isFeatured: boolean;
  isNew: boolean;
  isSuggested: boolean;
  suggestedAt: Date | null;
  /** Slugs de las colecciones del POS donde aparece (categorías y subcategorías). */
  categorySlugs: string[];
  garmentTypeSlugs: string[];
  search: Required<SearchRelevanceFields>;
}

/** Categorías y tipos de prenda de la tienda: los del árbol publicado por el POS. */
export type CatalogTaxonomy = Pick<PosTaxonomy, "byWebId" | "garmentTypes">;

export type WebSettings = ProductWebOverlay & { isNew: boolean; publishedAt: Date };

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Producto del POS + lo que la web decide sobre él. */
export function posToCatalogEntry(
  pos: PosProduct,
  settings: WebSettings | null,
  taxonomy: CatalogTaxonomy,
): CatalogEntry {
  const mapped = mapPosProduct(pos);
  // Solo las colecciones que el POS publica (una categoría oculta no lleva productos a la tienda).
  const categories = mapped.categoryWebIds
    .map((webId) => taxonomy.byWebId.get(webId))
    .filter((c): c is PosCollection => Boolean(c));
  const garmentTypeNames = mapped.garmentTypeSlugs
    .map((slug) => taxonomy.garmentTypes.get(slug)?.name)
    .filter((name): name is string => Boolean(name));

  return {
    slug: mapped.posSlug,
    source: "POS",
    card: {
      name: mapped.name,
      slug: mapped.posSlug,
      basePrice: mapped.basePrice,
      comparePrice: mapped.comparePrice,
      isSet: false,
      isProductNew: mapped.labels.isProductNew,
      isProductNewAt: mapped.labels.isProductNewAt,
      isOnSale: resolveWebOnSale(mapped, settings),
      coverImageUrl: resolveWebCover(mapped, settings),
      images: [],
      items: [],
      colors: mapped.colors.map((color) => ({
        name: color.name,
        hexCode: color.hexCode,
        images: color.images.slice(0, 1).map((img) => ({ url: img.url })),
        variants: color.variants.map((v) => ({ stock: v.stock })),
      })),
    },
    // Sin alta registrada (producto aún no visto por el webhook): su última actualización en el POS.
    publishedAt: settings?.publishedAt ?? parseDate(pos.updatedAt) ?? new Date(0),
    isFeatured: mapped.labels.isFeatured,
    isNew: settings?.isNew ?? false,
    isSuggested: mapped.labels.isSuggested,
    suggestedAt: mapped.labels.suggestedAt,
    categorySlugs: [...new Set(categories.map((c) => c.slug))],
    garmentTypeSlugs: mapped.garmentTypeSlugs,
    search: {
      name: mapped.name,
      slug: mapped.posSlug,
      metaTitle: settings?.metaTitle ?? null,
      metaDescription: settings?.metaDescription ?? null,
      description: mapped.description,
      garmentTypeNames,
      categoryNames: [...new Set(categories.map((c) => c.name))],
      itemNames: [],
    },
  };
}

// ── Orden, búsqueda y tarjetas ───────────────────────────────────────────────

/** Más nuevo primero (como el `orderBy: createdAt desc` de los listados). */
export function sortByPublished(entries: CatalogEntry[]): CatalogEntry[] {
  return [...entries].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

function searchableText(entry: CatalogEntry): string {
  const s = entry.search;
  return [
    s.name,
    s.description,
    s.slug,
    s.metaTitle,
    s.metaDescription,
    ...s.garmentTypeNames,
    ...s.categoryNames,
    ...s.itemNames,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Filtra por la búsqueda `q` conservando el orden (listados). Sin búsqueda activa no filtra. */
export function filterBySearch(entries: CatalogEntry[], q: string | undefined): CatalogEntry[] {
  if (!isSearchQueryActive(q)) return entries;
  const query = q!.trim();
  return entries.filter((entry) => productMatchesSearch(searchableText(entry), query));
}

/** Coincidencias de `q` por relevancia; empate: destacados y luego más nuevos (buscador). */
export function rankBySearch(entries: CatalogEntry[], q: string): CatalogEntry[] {
  return filterBySearch(entries, q)
    .map((entry) => ({ entry, score: scoreSearchRelevance(entry.search, q) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.entry.isFeatured !== b.entry.isFeatured) return a.entry.isFeatured ? -1 : 1;
      return b.entry.publishedAt.getTime() - a.entry.publishedAt.getTime();
    })
    .map(({ entry }) => entry);
}

/** Tarjeta para `transformProduct`; sin `withStock` no lleva variantes (no se pinta "Agotado"). */
export function toCard(entry: CatalogEntry, withStock = false): RawCollectionProduct {
  if (withStock) return entry.card;
  return {
    ...entry.card,
    colors: entry.card.colors.map(({ name, hexCode, images }) => ({ name, hexCode, images })),
    items: entry.card.items.map((item) => ({
      ...item,
      colors: item.colors.map(({ name, hexCode, images }) => ({ name, hexCode, images })),
    })),
  };
}
