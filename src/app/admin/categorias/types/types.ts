// ── Entidades ────────────────────────────────────────────────────────────────

export interface GarmentTypeOption {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  isActive: boolean;
  order: number;
  garmentTypes: GarmentTypeOption[];
  _count?: {
    products: number;
  };
}

export type ToastState = { type: "success" | "error"; message: string } | null;

// ── Props de componentes ─────────────────────────────────────────────────────

export interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onToggleActive: (category: Category) => void;
}

export interface CategoryGridProps {
  loading: boolean;
  filtered: Category[];
  onEdit: (category: Category) => void;
  onToggleActive: (category: Category) => void;
}

export interface CategorySearchProps {
  value: string;
  onChange: (v: string) => void;
}

export interface CategoryToastProps {
  toast: ToastState;
}

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  submitting: boolean;
  onSubmit: (e: { preventDefault(): void }) => Promise<void>;
  name: string;
  setName: (v: string) => void;
  image: string;
  setImage: (v: string) => void;
  garmentTypeIds: string[];
  setGarmentTypeIds: (ids: string[]) => void;
  allGarmentTypes: GarmentTypeOption[];
  mode?: "create" | "edit";
}
