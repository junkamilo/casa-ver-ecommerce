"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { StaticImageData } from "next/image";

// Definimos cómo se ve un producto en el carrito
export interface CartItem {
  id: string;
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
  cartCount: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Calcular total de items (para la bolita roja)
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calcular dinero total
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addToCart = (product: any, qty: number, color: any, size?: string) => {
    const sizeLabel = size || "Única";
    const itemId = `${product.name}-${color.name}-${sizeLabel}`;

    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === itemId);

      if (existingItem) {
        return currentItems.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }

      return [...currentItems, {
        id: itemId,
        name: product.name,
        price: product.price,
        image: product.gallery?.[0] || product.image,
        color: color.name,
        size: sizeLabel,
        quantity: qty
      }];
    });

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
      items, addToCart, removeFromCart, updateQuantity, 
      cartCount, subtotal, isCartOpen, openCart: () => setIsCartOpen(true), closeCart: () => setIsCartOpen(false) 
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