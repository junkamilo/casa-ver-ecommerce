// ── Domain types ────────────────────────────────────────────────────────────
export interface NavSubcategory {
  id: string;
  name: string;
  slug: string;
}

export interface NavProduct {
  id: string;
  name: string;
  slug: string;
}

export interface NavCategory {
  id: string;
  name: string;
  slug: string;
  subcategories: NavSubcategory[];
  products: NavProduct[];
}

// ── Component Props ──────────────────────────────────────────────────────────
export interface HeaderClientProps {
  categories: NavCategory[];
}

export interface NavActionsProps {
  isAdmin: boolean;
  cartCount: number;
  isUserMenuOpen: boolean;
  onSearchOpen: () => void;
  onCartOpen: () => void;
  onUserMenuToggle: () => void;
  onUserMenuClose: () => void;
}

export interface NavLinksProps {
  isCategoriesActive: boolean;
  onCategoriesEnter: () => void;
}

export interface MegaMenuProps {
  visible: boolean;
  categories: NavCategory[];
  onEnter: () => void;
  onLeave: () => void;
  onClose: () => void;
}

export interface MobileMenuProps {
  isAdmin: boolean;
  categories: NavCategory[];
  onClose: () => void;
  onSearchOpen: () => void;
}
