"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { StaticImageData } from "next/image";

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  sku: string;
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

const CART_KEY     = "cv_cart";
const BUY_NOW_KEY  = "cv_buy_now";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);

  // ── Hidratación desde localStorage (evita mismatch SSR) ─────────────────────
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_KEY);
      if (storedCart) setItems(JSON.parse(storedCart) as CartItem[]);

      const storedBuyNow = localStorage.getItem(BUY_NOW_KEY);
      if (storedBuyNow) setBuyNowItem(JSON.parse(storedBuyNow) as CartItem);
    } catch {}
  }, []);

  // ── Sincronizar items → localStorage ────────────────────────────────────────
  useEffect(() => {
    try {
      if (items.length > 0) {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
      } else {
        localStorage.removeItem(CART_KEY);
      }
    } catch {}
  }, [items]);

  // ── Body scroll lock cuando el carrito está abierto ─────────────────────────
  // Usar solo overflow: hidden en lugar de manipular position: fixed
  // Esto evita romper el stacking context y afectar event handling en móvil
  useEffect(() => {
    if (!isCartOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isCartOpen]);

  // ── Derivados ────────────────────────────────────────────────────────────────
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal  = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ── Acciones ─────────────────────────────────────────────────────────────────
  const addToCart = useCallback((product: any, qty: number, color: any, size?: string) => {
    const sizeLabel = size || "Única";
    const itemId = `${product.id ?? product.name}-${color.id ?? color.name}-${sizeLabel}`;

    setItems((current) => {
      const existing = current.find((item) => item.id === itemId);
      if (existing) {
        return current.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [
        ...current,
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
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem(CART_KEY); } catch {}
  }, []);

  const openCart  = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const setBuyNow = useCallback((product: any, qty: number, color: any, size?: string) => {
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
    try { localStorage.setItem(BUY_NOW_KEY, JSON.stringify(item)); } catch {}
  }, []);

  const clearBuyNow = useCallback(() => {
    setBuyNowItem(null);
    try { localStorage.removeItem(BUY_NOW_KEY); } catch {}
  }, []);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, subtotal, isCartOpen, openCart, closeCart,
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
