export const CATEGORIES_FALLBACK = [
  { image: null, label: "ENTERIZOS CORTOS", slug: "enterizos-cortos" },
  { image: null, label: "SETS", slug: "sets" },
  { image: null, label: "CHAQUETAS", slug: "chaquetas" },
  { image: null, label: "ENTERIZOS LARGOS", slug: "enterizos-largos" },
  { image: null, label: "BODYS", slug: "bodys" },
];

export const SECTION_CONFIG = {
  title: "Explora por",
  titleItalic: "Categoría",
  href: "/collections",
  linkText: "VER TODO",
  textColor: "text-[#154734]",
  hoverColor: "hover:text-[#C19A6B]",
  fontClass: "font-light",
  emptyMessage: "Pronto agregaremos nuevas categorías y colecciones.",
} as const;
