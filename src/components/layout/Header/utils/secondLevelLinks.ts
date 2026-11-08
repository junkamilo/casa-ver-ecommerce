import type { NavCategory } from "../types";

export interface SecondLevelLink {
  id: string;
  name: string;
  href: string;
  active: boolean;
}

/**
 * Segundo nivel del menú: las subcategorías de la categoría. Cada subcategoría es una colección
 * (`/collections/<slug>`); la prenda física es la subcategoría.
 */
export function getSecondLevelLinks(category: NavCategory, pathname: string | null): SecondLevelLink[] {
  return category.subcategories.map((sub) => {
    const href = `/collections/${sub.slug}`;
    return { id: sub.id, name: sub.name, href, active: pathname === href };
  });
}
