import { SelectedColor, SetItemForm, SubProductForm } from "../types";

/**
 * Calcula el stock efectivo de un conjunto de colores.
 * Si algún color tiene variantStocks definidos, suma todos esos stocks.
 * Si no, usa el fallbackStock (string) parseado como entero.
 */
export function calcEffectiveStock(colors: SelectedColor[], fallbackStock: string): number {
  const hasVariants = colors.some((c) => Object.keys(c.variantStocks || {}).length > 0);
  if (hasVariants) {
    return colors.reduce(
      (sum, c) =>
        sum + Object.values(c.variantStocks || {}).reduce((s, v) => s + Number(v), 0),
      0
    );
  }
  return fallbackStock ? parseInt(fallbackStock, 10) : 0;
}

/** Factory: crea un SetItemForm vacío con localId único */
export function newSetItem(): SetItemForm {
  return {
    localId: crypto.randomUUID(),
    name: "",
    description: "",
    price: "",
    comparePrice: "",
    videoUrl: "",
    stock: "",
    colors: [],
    sizes: [],
  };
}

/** Factory: crea un SubProductForm vacío con localId único */
export function newSubProduct(): SubProductForm {
  return {
    localId: crypto.randomUUID(),
    name: "",
    description: "",
    price: "",
    videoUrl: "",
    stock: "",
    colors: [],
    sizes: [],
  };
}
