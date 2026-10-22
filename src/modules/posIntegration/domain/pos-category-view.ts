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
