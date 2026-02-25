"use client";

import { ShoppingBag } from "lucide-react";
import type { CartEmptyStateProps } from "../types";

/**
 * CartEmptyState
 * Componente que se muestra cuando el carrito está vacío
 * Muestra mensaje y botón para continuar comprando
 */
export function CartEmptyState({ onContinueShopping }: CartEmptyStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
      <ShoppingBag className="w-12 h-12 mb-4 text-muted-foreground" />
      <p className="text-lg font-medium">Tu carrito está vacío</p>
      <button
        onClick={onContinueShopping}
        className="mt-4 text-sm underline hover:text-brand transition-colors"
        aria-label="Volver a comprar"
      >
        Seguir comprando
      </button>
    </div>
  );
}

export default CartEmptyState;
