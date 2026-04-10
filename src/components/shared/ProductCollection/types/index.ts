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
}

export interface ProductToolbarProps {
  count: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onFilterOpen?: () => void;
  hasActiveFilters?: boolean;
}

export interface ProductGridProps {
  products: CollectionProduct[];
  viewMode: "grid" | "list";
}

export interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  availableColors: { name: string; hexCode: string }[];
  maxPriceDb: number;
}
