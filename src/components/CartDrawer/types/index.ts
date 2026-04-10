import type { CartItem } from "@/context/CartContext";

export interface CartOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CartPanelProps {
  children: React.ReactNode;
  isOpen: boolean;
}

export interface CartHeaderProps {
  cartCount: number;
  onClose: () => void;
}

export interface CartItemCardProps {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}

export interface QuantityControlsProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  minQuantity?: number;
}

export interface CartContentProps {
  items: CartItem[];
  onItemRemove: (id: string) => void;
  onQuantityChange: (id: string, delta: number) => void;
}

export interface CartEmptyStateProps {
  onContinueShopping: () => void;
}

export interface CartFooterProps {
  subtotal: number;
  itemCount: number;
  onCheckout: () => void;
}

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
