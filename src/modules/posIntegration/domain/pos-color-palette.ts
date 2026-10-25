import type { PosColorFacet } from "../contracts/pos-catalog.schema";

/**
 * Paleta de colores de la tienda: los colores activos del POS (`GET /colors`). La web ya no guarda colores
 * propios; los productos creados en la web solo muestran (y venden) los colores que existen en el POS, con el
 * nombre y el hex del POS. Se cruzan por nombre, sin distinguir mayúsculas, tildes ni espacios repetidos.
 */
export type PosColorPalette = ReadonlyMap<string, PosColorFacet>;

export function colorKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function buildPosColorPalette(colors: readonly PosColorFacet[]): PosColorPalette {
  return new Map(colors.map((color) => [colorKey(color.name), color]));
}

/** Color del POS que corresponde a un color guardado en un producto de la web, o `undefined`. */
export function findPaletteColor(palette: PosColorPalette, name: string): PosColorFacet | undefined {
  return palette.get(colorKey(name));
}

/**
 * Colores de un producto de la web restringidos a la paleta del POS: quita los que el POS no tiene y usa el
 * nombre y el hex del POS en los que sí. Una paleta vacía (el POS aún no tiene colores) deja la lista vacía.
 */
export function restrictToPosPalette<T extends { name: string; hexCode: string }>(
  colors: readonly T[],
  palette: PosColorPalette,
): T[] {
  const result: T[] = [];
  for (const color of colors) {
    const match = findPaletteColor(palette, color.name);
    if (match) result.push({ ...color, name: match.name, hexCode: match.hexCode });
  }
  return result;
}
