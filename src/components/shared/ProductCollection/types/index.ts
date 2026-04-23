// --- Modelos de datos ---

export interface CollectionProduct {
  images: string[];
  name: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  slug: string;
  colors?: { name: string; hexCode: string; imageUrl?: string | null }[];
  isSet?: boolean;
  minPrice?: number;
}

export interface FilterOptions {
  availableColors: { name: string; hexCode: string }[];
  maxPriceDb: number;
}

// --- Props de componentes ---

export interface CollectionClientProps {
  products: CollectionProduct[];
  filterOptions: FilterOptions;
  setItemKey?: string | null;
}

export interface ProductToolbarProps {
  count: number;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onFilterOpen?: () => void;
  hasActiveFilters?: boolean;
}

export interface ProductGridProps {
  products: CollectionProduct[];
  setItemKey?: string | null;
}

export interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  availableColors: { name: string; hexCode: string }[];
  maxPriceDb: number;
  // Estado de filtros (manejado por useCollectionClient)
  selectedColor: string | null;
  minPrice: string;
  maxPrice: string;
  hasActiveFilters: boolean;
  onColorToggle: (hexCode: string) => void;
  onPriceChange: (key: "minPrice" | "maxPrice", value: string) => void;
  onClearFilters: () => void;
}
