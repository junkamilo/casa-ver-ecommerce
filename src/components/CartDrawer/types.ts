import type { CartItem } from "@/context/CartContext";

/**
 * Props para el componente CartOverlay
 */
export interface CartOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Props para el componente CartPanel
 */
export interface CartPanelProps {
  children: React.ReactNode;
  isOpen: boolean;
}

/**
 * Props para el componente CartHeader
 */
export interface CartHeaderProps {
  cartCount: number;
  onClose: () => void;
}

/**
 * Props para el componente CartItemCard
 */
export interface CartItemCardProps {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}

/**
 * Props para el componente QuantityControls
 */
export interface QuantityControlsProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  minQuantity?: number;
}

/**
 * Props para el componente CartContent
 */
export interface CartContentProps {
  items: CartItem[];
  onItemRemove: (id: string) => void;
  onQuantityChange: (id: string, delta: number) => void;
}

/**
 * Props para el componente CartEmptyState
 */
export interface CartEmptyStateProps {
  onContinueShopping: () => void;
}

/**
 * Props para el componente CartFooter
 */
export interface CartFooterProps {
  subtotal: number;
  itemCount: number;
  onCheckout: () => void;
}

/**
 * Return type del hook useCartDrawer
 */
export interface UseCartDrawerReturn {
  isOpen: boolean;
  closeCart: () => void;
  items: CartItem[];
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  subtotal: number;
  cartCount: number;
  handleOverlayClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}
