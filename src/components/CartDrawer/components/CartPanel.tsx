"use client";

import type { CartPanelProps } from "../types";

/**
 * CartPanel
 * Panel blanco principal del drawer
 * Contenedor flex column que ocupa toda la altura
 */
export function CartPanel({ children, isOpen }: CartPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="relative w-full max-w-[420px] bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {children}
    </div>
  );
}

export default CartPanel;
