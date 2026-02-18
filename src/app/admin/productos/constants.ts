export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "ONESIZE"] as const;
export type Size = (typeof SIZES)[number];

export const newColorForm = () => ({
  tempId: crypto.randomUUID(),
  name: "",
  hexCode: "#000000",
  images: [] as string[],
  variants: Object.fromEntries(
    SIZES.map((s) => [s, { stock: "", priceOverride: "" }])
  ),
});

export const formatPrice = (val: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(val);

export const getStockStatus = (stock: number) => {
  if (stock === 0)
    return { label: "Agotado", color: "bg-red-100 text-red-700 border-red-200" };
  if (stock < 5)
    return { label: "Bajo Stock", color: "bg-amber-100 text-amber-700 border-amber-200" };
  return { label: "En Stock", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
};
