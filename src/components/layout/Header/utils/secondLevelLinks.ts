import type { NavCategory } from "../types";

export interface SecondLevelLink {
  id: string;
  name: string;
  href: string;
  active: boolean;
}

/**
 * Segundo nivel del menú: subcategorías para las categorías del POS,
 * tipos de prenda (`?tipo=`) para las de la web.
 */
export function getSecondLevelLinks(
  category: NavCategory,
  pathname: string | null,
  activeTipo: string | null,
): SecondLevelLink[] {
  if (category.source === "pos") {
    return category.subcategories.map((sub) => {
      const href = `/collections/${sub.slug}`;
      return { id: sub.id, name: sub.name, href, active: pathname === href };
    });
  }
  return category.garmentTypes.map((gt) => ({
    id: gt.id,
    name: gt.name,
    href: `/collections/${category.slug}?tipo=${gt.slug}`,
    active: pathname === `/collections/${category.slug}` && activeTipo === gt.slug,
  }));
}
