import type { AdminProductListItemDTO } from "@/modules/adminCatalog/products/contracts/product-list.dto";
import type { GarmentTypeDTO } from "@/modules/adminCatalog/categories/contracts/category.dto";

// ── Domain Types ─────────────────────────────────────────────────────────────

export type ProductListItem = AdminProductListItemDTO;

export type GarmentTypeOption = GarmentTypeDTO;

export interface Category {
  id: string;
  name: string;
  garmentTypes: GarmentTypeOption[];
}

export interface SelectedColor {
  name: string;
  hexCode: string;
  images: string[];
  variantStocks?: { [size: string]: number };
}

export interface SetItemForm {
  localId: string;
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  videoUrl: string;
  stock: string;
  colors: SelectedColor[];
  sizes: string[];
}


export type ToastState = { type: "success" | "error"; message: string } | null;

// ── Form Error Types (derivados de los schemas Zod) ───────────────────────────

export type ProductFormErrors = Partial<
  Record<
    "name" | "description" | "basePrice" | "comparePrice" | "stock" | "categoryId" | "videoUrl",
    string
  >
>;

export type SingleItemFormErrors = Partial<
  Record<"name" | "price" | "comparePrice" | "videoUrl" | "colors" | "sizes" | "colorImages", string>
>;

export type ItemFormErrors = Record<string, SingleItemFormErrors>;


// ── Component Props ───────────────────────────────────────────────────────────

export interface BlockHeaderProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}

export interface FieldErrorProps {
  msg?: string | null;
  withIcon?: boolean;
}

export interface ProductModalProps {
  editingId: string | null;
  formLoading: boolean;
  submitting: boolean;
  categories: Category[];
  presetColors: PresetColor[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  name: string; setName: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  basePrice: string; setBasePrice: (v: string) => void;
  comparePrice: string; setComparePrice: (v: string) => void;
  stock: string; setStock: (v: string) => void;
  categoryId: string; setCategoryId: (v: string) => void;
  status: string; setStatus: (v: string) => void;
  isFeatured: boolean; setIsFeatured: (v: boolean) => void;
  isNew: boolean; setIsNew: (v: boolean) => void;
  isProductNew: boolean; setIsProductNew: (v: boolean) => void;
  isProductNewAt: string | null; setIsProductNewAt: (v: string | null) => void;
  isOnSale: boolean; setIsOnSale: (v: boolean) => void;
  isOnSaleAt: string | null; setIsOnSaleAt: (v: string | null) => void;
  selectedColors: SelectedColor[];
  selectedSizes: string[];
  videoUrl: string; setVideoUrl: (v: string) => void;
  toggleColor: (name: string, hexCode: string) => void;
  toggleSize: (size: string) => void;
  setColorImages: (colorName: string, images: string[]) => void;
  updateVariantStock: (colorName: string, size: string, stock: number) => void;
  garmentTypes: string[]; setGarmentTypes: (v: string[]) => void;
  isSet: boolean; setIsSet: (v: boolean) => void;
  setItems: SetItemForm[];
  addSetItem: () => void;
  removeSetItem: (localId: string) => void;
  updateSetItem: (localId: string, updates: Partial<SetItemForm>) => void;
  toggleSetItemColor: (localId: string, name: string, hexCode: string) => void;
  toggleSetItemSize: (localId: string, size: string) => void;
  setSetItemColorImages: (localId: string, colorName: string, images: string[]) => void;
  updateSetItemVariantStock: (localId: string, colorName: string, size: string, stock: number) => void;
}

export interface ProductTableProps {
  products: ProductListItem[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

export interface ProductMobileListProps {
  products: ProductListItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

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

export interface GeneralInfoSectionProps {
  name: string; onName: (v: string) => void;
  description: string; onDescription: (v: string) => void;
  categoryId: string; onCategory: (v: string) => void;
  status: string; onStatus: (v: string) => void;
  isFeatured: boolean; onFeatured: (v: boolean) => void;
  isNew: boolean; onNew: (v: boolean) => void;
  isProductNew: boolean; onProductNew: (v: boolean) => void;
  isProductNewAt: string | null; onProductNewAt: (v: string | null) => void;
  isOnSale: boolean; onOnSale: (v: boolean) => void;
  isOnSaleAt: string | null; onOnSaleAt: (v: string | null) => void;
  garmentTypes: string[]; onGarmentType: (v: string[]) => void;
  categories: Category[];
  errors?: ProductFormErrors;
  isSet?: boolean;
}

export interface PresetColor {
  name: string;
  hex: string;
}

export interface ColorsSectionProps {
  selectedColors: SelectedColor[];
  selectedSizes: string[];
  disabled: boolean;
  presetColors: PresetColor[];
  colorError?: string | null;
  sizeError?: string | null;
  colorImagesError?: string | null;
  onToggleColor: (name: string, hexCode: string) => void;
  onToggleSize: (size: string) => void;
  onSetColorImages: (colorName: string, images: string[]) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

export interface SetItemCardProps {
  item: SetItemForm;
  index: number;
  disabled: boolean;
  presetColors: PresetColor[];
  errors?: SingleItemFormErrors;
  onRemove: (id: string) => void;
  onUpdate: (id: string, u: Partial<SetItemForm>) => void;
  onToggleColor: (id: string, name: string, hex: string) => void;
  onToggleSize: (id: string, size: string) => void;
  onSetColorImages: (id: string, colorName: string, images: string[]) => void;
  onUpdateVariantStock: (id: string, colorName: string, size: string, stock: number) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

export interface SetItemsSectionProps {
  items: SetItemForm[];
  disabled: boolean;
  presetColors: PresetColor[];
  itemErrors?: ItemFormErrors;
  noItemsError?: string | null;
  onAdd: () => void;
  onRemove: (localId: string) => void;
  onUpdate: (localId: string, updates: Partial<SetItemForm>) => void;
  onToggleColor: (localId: string, name: string, hexCode: string) => void;
  onToggleSize: (localId: string, size: string) => void;
  onSetColorImages: (localId: string, colorName: string, images: string[]) => void;
  onUpdateVariantStock: (localId: string, colorName: string, size: string, stock: number) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}


export interface VariantStockSectionProps {
  selectedColors: SelectedColor[];
  selectedSizes: string[];
  disabled: boolean;
  onUpdate: (colorName: string, size: string, stock: number) => void;
}

export interface VideoSectionProps {
  videoUrl: string;
  onVideoUrl: (v: string) => void;
  disabled: boolean;
  onUploadingChange?: (isUploading: boolean) => void;
}
