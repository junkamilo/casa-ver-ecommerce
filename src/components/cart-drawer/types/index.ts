import { StaticImageData } from "next/image";

export interface CartDrawerItem {
  id: string;
  name: string;
  image: string | StaticImageData;
  price: number;
  quantity: number;
  color: string;
  size?: string;
}

export interface CartHeaderProps {
  cartCount: number;
  onClose: () => void;
}

export interface CartOverlayProps {
  onClose: () => void;
}

export interface CartItemCardProps {
  item: CartDrawerItem;
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
}

export interface CartItemListProps {
  items: CartDrawerItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onClose: () => void;
}

export interface CartFooterProps {
  subtotal: number;
  onClose: () => void;
}

export interface CartEmptyProps {
  onClose: () => void;
}
