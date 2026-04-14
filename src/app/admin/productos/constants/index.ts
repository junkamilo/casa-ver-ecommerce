// ── Product Constants ─────────────────────────────────────────────────────────

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "ONESIZE"] as const;
export type Size = (typeof SIZES)[number];

export const PRESET_COLORS = [
  { name: "Rojo",             hex: "#E53935" },
  { name: "Azul Navy",        hex: "#1A237E" },
  { name: "Blanco",           hex: "#F5F5F5" },
  { name: "Negro",            hex: "#1C1C1C" },
  { name: "Celeste",          hex: "#87CEEB" },
  { name: "Amarillo Pastel",  hex: "#FFF176" },
  { name: "Café",             hex: "#795548" },
  { name: "Beige",            hex: "#D4B896" },
  { name: "Arena",            hex: "#C2B280" },
  { name: "Rosa Pastel",      hex: "#F8BBD9" },
  { name: "Verde Militar",    hex: "#4B5320" },
  { name: "Vino",             hex: "#722F37" },
  { name: "Verde Pastel",     hex: "#A8D5A2" },
  { name: "Terracota",        hex: "#C0652B" },
  { name: "Verde Esmeralda",  hex: "#046307" },
  { name: "Naranja",          hex: "#FB8C00" },
  { name: "Gris",             hex: "#9E9E9E" },
] as const;


export const STATUS_OPTIONS = [
  { value: "ACTIVE",   label: "Activo",   dot: "bg-emerald-500" },
  { value: "INACTIVE", label: "Inactivo", dot: "bg-gray-400"    },
] as const;

// ── Inventory Constants ───────────────────────────────────────────────────────

export const MAX_IMAGES_PER_COLOR = 8;
export const MIN_STOCK = 2;
export const MAX_STOCK = 9999;

// ── Formatters ────────────────────────────────────────────────────────────────

export const formatPrice = (val: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(val);

export const getStockStatus = (stock: number) => {
  if (stock === 0)
    return { label: "Agotado",    color: "bg-red-100 text-red-700 border-red-200"       };
  if (stock < 5)
    return { label: "Bajo Stock", color: "bg-amber-100 text-amber-700 border-amber-200" };
  return   { label: "En Stock",   color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
};

// ── Style Helpers ─────────────────────────────────────────────────────────────

/** Input principal del formulario de producto (acento dorado) */
export const inputCls = (hasError = false) =>
  `w-full px-4 py-2.5 rounded-lg border ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-[#C19A6B] focus:ring-[#C19A6B]/10"
  } focus:ring-4 outline-none text-sm transition-colors`;

/** Campo de formulario para tarjetas de subcategoría (acento verde) */
export const fieldCls = (hasError = false) =>
  `w-full px-3 py-2.5 text-sm border ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-[#154734] focus:ring-[#154734]/20"
  } rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 bg-white transition-colors`;

/** Campo de formulario para tarjetas de sub-producto (acento dorado) */
export const fieldClsGold = (hasError = false) =>
  `w-full px-3 py-2.5 text-sm border ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-[#C19A6B] focus:ring-[#C19A6B]/20"
  } rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 bg-white transition-colors`;
