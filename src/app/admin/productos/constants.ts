export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "ONESIZE"] as const;
export type Size = (typeof SIZES)[number];

export const PRESET_COLORS = [
  { name: "Negro",         hex: "#1C1C1C" },
  { name: "Blanco",        hex: "#F5F5F5" },
  { name: "Gris",          hex: "#9E9E9E" },
  { name: "Gris Oscuro",   hex: "#424242" },
  { name: "Beige",         hex: "#D4B896" },
  { name: "Camel",         hex: "#C19A6B" },
  { name: "Marrón",        hex: "#795548" },
  { name: "Chocolate",     hex: "#4E342E" },
  { name: "Rojo",          hex: "#E53935" },
  { name: "Borgoña",       hex: "#7B1C2B" },
  { name: "Vino",          hex: "#722F37" },
  { name: "Rosa",          hex: "#F48FB1" },
  { name: "Palo de Rosa",  hex: "#D4A5A5" },
  { name: "Coral",         hex: "#FF6F61" },
  { name: "Naranja",       hex: "#FB8C00" },
  { name: "Mostaza",       hex: "#F9A825" },
  { name: "Amarillo",      hex: "#FDD835" },
  { name: "Verde",         hex: "#43A047" },
  { name: "Verde Militar", hex: "#4B5320" },
  { name: "Verde Olivo",   hex: "#6B8E23" },
  { name: "Verde Botella", hex: "#154734" },
  { name: "Azul",          hex: "#1E88E5" },
  { name: "Azul Marino",   hex: "#1A237E" },
  { name: "Azul Cielo",    hex: "#87CEEB" },
  { name: "Índigo",        hex: "#3F51B5" },
  { name: "Lila",          hex: "#CE93D8" },
  { name: "Morado",        hex: "#7B1FA2" },
  { name: "Terracota",     hex: "#C0652B" },
] as const;

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
