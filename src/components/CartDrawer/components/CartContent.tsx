"use client";

import { CartItemCard } from "./CartItemCard";
import { CartEmptyState } from "./CartEmptyState";
import type { CartContentProps } from "../types";

/**
 * CartContent
 * Contenedor scrolleable que muestra los items del carrito
 * Renderiza CartItemCard para cada item o CartEmptyState si está vacío
 */
export function CartContent({ items, onItemRemove, onQuantityChange }: CartContentProps) {
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-6">
      {items.length === 0 ? (
        <CartEmptyState onContinueShopping={() => {}} />
      ) : (
        items.map((item) => (
          <CartItemCard
            key={item.id}
            item={item}
            onRemove={onItemRemove}
            onUpdateQuantity={onQuantityChange}
          />
        ))
      )}
    </div>
  );
}

export default CartContent;
