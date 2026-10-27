// ── Domain Types ─────────────────────────────────────────────────────────────

export type { AdminPosProductDTO as ProductListItem } from "@/modules/adminCatalog/products/contracts/admin-pos-product.dto";

/** Categoría del POS (solo para filtrar el listado): las categorías se crean y asignan en el POS. */
export interface Category {
  id: string;
  name: string;
}

/** Color del POS con sus fotos (para elegir la portada). */
export interface SelectedColor {
  name: string;
  hexCode: string;
  images: string[];
}

export type ToastState = { type: "success" | "error"; message: string } | null;

// ── Component Props ───────────────────────────────────────────────────────────

export interface ProductFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  filterCategory: string;
  onCategoryChange: (v: string) => void;
  categories: Category[];
}

export interface ToastNotificationProps {
  toast: ToastState;
}

export interface LabelToggleProps {
  active: boolean;
  onToggle: () => void;
  icon: React.ElementType;
  label: string;
  description: string;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
  infoText?: string;
}
