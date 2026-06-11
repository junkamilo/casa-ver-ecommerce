import type { CategoryListItemDTO, GarmentTypeDTO } from "@/modules/adminCatalog/categories/contracts/category.dto";

// ── Entidades ────────────────────────────────────────────────────────────────

export type GarmentTypeOption = GarmentTypeDTO;

export type Category = Omit<CategoryListItemDTO, "image"> & {
  image?: string;
};

export type ToastState = { type: "success" | "error"; message: string } | null;

// ── Props de componentes ─────────────────────────────────────────────────────

export interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onToggleActive: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export interface CategoryGridProps {
  loading: boolean;
  filtered: Category[];
  onEdit: (category: Category) => void;
  onToggleActive: (category: Category) => void;
  onDelete: (category: Category) => void;
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
