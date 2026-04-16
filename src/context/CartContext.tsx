"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { StaticImageData } from "next/image";

export interface CartItem {
  id: string;
  variantId: string;    // ID de la variante en BD (requerido para crear la orden)
  productId: string;    // ID del producto padre en BD
  sku: string;          // SKU de la variante
  name: string;
  price: number;
  image: StaticImageData | string;
  color: string;
  size: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity: number, color: any, size?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  buyNowItem: CartItem | null;
  setBuyNow: (product: any, quantity: number, color: any, size?: string) => void;
  clearBuyNow: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);

  // Cargar desde sessionStorage tras hidratación (evita mismatch SSR/cliente)
  useEffect(() => {
    try {
      const storedCart = sessionStorage.getItem("cartItems");
      if (storedCart) setItems(JSON.parse(storedCart) as CartItem[]);

      const storedBuyNow = sessionStorage.getItem("buyNowItem");
      if (storedBuyNow) setBuyNowItem(JSON.parse(storedBuyNow) as CartItem);
    } catch {}
  }, []);

  // Sincronizar items → sessionStorage en cada cambio
  useEffect(() => {
    try {
      if (items.length > 0) {
        sessionStorage.setItem("cartItems", JSON.stringify(items));
      } else {
        sessionStorage.removeItem("cartItems");
      }
    } catch {}
  }, [items]);

  // Calcular total de items (para la bolita roja)
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calcular dinero total
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addToCart = (product: any, qty: number, color: any, size?: string) => {
    const sizeLabel = size || "Única";
    const itemId = `${product.id ?? product.name}-${color.id ?? color.name}-${sizeLabel}`;

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === itemId);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + qty } : item
        );
      }

      return [
        ...currentItems,
        {
          id: itemId,
          variantId: product.variantId ?? color.variantId ?? "",
          productId: product.id ?? "",
          sku: product.sku ?? color.sku ?? "",
          name: product.name,
          price: product.price,
          image: product.gallery?.[0] || product.image,
          color: color.name,
          size: sizeLabel,
          quantity: qty,
        },
      ];
    });
  };

  const setBuyNow = (product: any, qty: number, color: any, size?: string) => {
    const sizeLabel = size || "Única";
    const item: CartItem = {
      id: `buynow-${product.id ?? product.name}-${color.id ?? color.name}-${sizeLabel}`,
      variantId: product.variantId ?? color.variantId ?? "",
      productId: product.id ?? "",
      sku: product.sku ?? color.sku ?? "",
      name: product.name,
      price: product.price,
      image: product.gallery?.[0] || product.image,
      color: color.name,
      size: sizeLabel,
      quantity: qty,
    };
    setBuyNowItem(item);
    try { sessionStorage.setItem("buyNowItem", JSON.stringify(item)); } catch {}
  };

  const clearBuyNow = () => {
    setBuyNowItem(null);
    try { sessionStorage.removeItem("buyNowItem"); } catch {}
  };

  const clearCart = () => {
    setItems([]);
    try { sessionStorage.removeItem("cartItems"); } catch {}
  };

  const removeFromCart = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(currentItems => currentItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, subtotal, isCartOpen, openCart: () => setIsCartOpen(true), closeCart: () => setIsCartOpen(false),
      buyNowItem, setBuyNow, clearBuyNow,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de un CartProvider");
  return context;
};