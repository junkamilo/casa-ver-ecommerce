import { isAllowedRemoteImage } from "@/lib/image-hosts";
import type { PosCategory } from "../contracts/pos-catalog.schema";

export const POS_CATEGORY_ID_PREFIX = "pos-";

/** Misma forma que consume el carrusel de categorías del home. */
export interface PosCarouselCategory {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  isActive: boolean;
}

/** Misma forma que `NavCategory` del header. */
export interface PosNavCategory {
  id: string;
  name: string;
  slug: string;
  source: "pos";
  subcategories: { id: string; name: string; slug: string }[];
  products: { id: string; name: string; slug: string }[];
  garmentTypes: { id: string; name: string; slug: string }[];
}

const posId = (webId: string) => `${POS_CATEGORY_ID_PREFIX}${webId}`;
const bySortOrder = <T extends { sortOrder: number; name: string }>(a: T, b: T) =>
  a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "es");

export function sortPosCategoryTree(tree: PosCategory[]): PosCategory[] {
  return [...tree]
    .sort(bySortOrder)
    .map((category) => ({ ...category, subcategories: [...category.subcategories].sort(bySortOrder) }));
}

// Una imagen de un dominio no permitido haría fallar `next/image`; sin imagen la tarjeta sale verde.
const cardImage = (url: string | null) => (isAllowedRemoteImage(url) ? url : null);

/** Carrusel del home: solo categorías principales (las subcategorías van en el menú). */
export function toPosCarouselItems(tree: PosCategory[]): PosCarouselCategory[] {
  return sortPosCategoryTree(tree).map((category) => ({
    id: posId(category.webId),
    name: category.name,
    slug: category.slug,
    image: cardImage(category.imageUrl),
    isActive: true,
  }));
}

export function toPosNavCategories(tree: PosCategory[]): PosNavCategory[] {
  return sortPosCategoryTree(tree).map((category) => ({
    id: posId(category.webId),
    name: category.name,
    slug: category.slug,
    source: "pos",
    subcategories: category.subcategories.map((sub) => ({ id: posId(sub.webId), name: sub.name, slug: sub.slug })),
    products: [],
    // Tipos de prenda de sus subcategorías, sin repetir (filtro ?tipo= de la colección).
    garmentTypes: [
      ...new Map(
        category.subcategories
          .map((sub) => sub.garmentType)
          .filter((type): type is NonNullable<typeof type> => type != null)
          .map((type) => [type.slug, { id: `${POS_CATEGORY_ID_PREFIX}gt-${type.slug}`, name: type.name, slug: type.slug }]),
      ).values(),
    ],
  }));
}

// ── Taxonomía de la tienda ───────────────────────────────────────────────────
//
// Categorías, subcategorías y tipos de prenda de la tienda: salen SOLO del árbol que publica el POS
// (la web ya no guarda categorías). Cada categoría y cada subcategoría es una colección en
// `/collections/<slug>`; el POS garantiza que un slug no se repite en toda la vitrina (V104).

export interface PosCollection {
  kind: "category" | "subcategory";
  webId: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  /** Slug de la categoría padre (solo subcategorías). */
  parentSlug: string | null;
}

export interface PosGarmentType {
  slug: string;
  name: string;
  sortOrder: number;
}

export interface PosTaxonomy {
  bySlug: Map<string, PosCollection>;
  byWebId: Map<string, PosCollection>;
  garmentTypes: Map<string, PosGarmentType>;
}

export const normalizeCollectionSlug = (slug: string) => slug.trim().toLowerCase();

export function buildPosTaxonomy(tree: PosCategory[]): PosTaxonomy {
  const bySlug = new Map<string, PosCollection>();
  const byWebId = new Map<string, PosCollection>();
  const garmentTypes = new Map<string, PosGarmentType>();

  const add = (collection: PosCollection) => {
    byWebId.set(collection.webId, collection);
    // Si el POS llegara a publicar un slug repetido, gana el primero (orden del POS): una URL, una colección.
    if (!bySlug.has(collection.slug)) bySlug.set(collection.slug, collection);
  };

  for (const category of sortPosCategoryTree(tree)) {
    const categorySlug = normalizeCollectionSlug(category.slug);
    add({
      kind: "category",
      webId: category.webId,
      slug: categorySlug,
      name: category.name.trim(),
      description: category.description,
      imageUrl: cardImage(category.imageUrl),
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
      parentSlug: null,
    });
    for (const sub of category.subcategories) {
      add({
        kind: "subcategory",
        webId: sub.webId,
        slug: normalizeCollectionSlug(sub.slug),
        name: sub.name.trim(),
        description: sub.description,
        imageUrl: cardImage(sub.imageUrl),
        metaTitle: sub.metaTitle,
        metaDescription: sub.metaDescription,
        parentSlug: categorySlug,
      });
      if (sub.garmentType) {
        const slug = normalizeCollectionSlug(sub.garmentType.slug);
        if (!garmentTypes.has(slug)) {
          garmentTypes.set(slug, { slug, name: sub.garmentType.name.trim(), sortOrder: sub.garmentType.sortOrder });
        }
      }
    }
  }
  return { bySlug, byWebId, garmentTypes };
}

/** Firma del árbol: cambia si el POS agrega, quita, renombra o reordena algo (polling del header). */
export function posCategoryTreeSignature(tree: PosCategory[]): string {
  const parts = sortPosCategoryTree(tree).flatMap((category) => [
    `${category.webId}:${category.slug}:${category.name}:${category.sortOrder}:${category.updatedAt ?? ""}`,
    ...category.subcategories.map(
      (sub) =>
        `${sub.webId}:${sub.slug}:${sub.name}:${sub.sortOrder}:${sub.updatedAt ?? ""}:${sub.garmentType?.slug ?? ""}:${sub.garmentType?.name ?? ""}`,
    ),
  ]);
  let hash = 0;
  for (const char of parts.join("|")) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0;
  return `${tree.length}-${parts.length}-${(hash >>> 0).toString(36)}`;
}

/**
 * Slugs de `/collections/<slug>` que muestra una categoría (la suya y las de sus subcategorías) o una
 * subcategoría, según su webId. Vacío si el webId no está en el árbol (p. ej. una categoría recién creada).
 */
export function collectionSlugsForWebId(tree: PosCategory[], webId: string): string[] {
  for (const category of tree) {
    if (category.webId === webId) {
      return [category.slug, ...category.subcategories.map((sub) => sub.slug)].map(normalizeCollectionSlug);
    }
    const sub = category.subcategories.find((s) => s.webId === webId);
    if (sub) return [normalizeCollectionSlug(sub.slug)];
  }
  return [];
}
