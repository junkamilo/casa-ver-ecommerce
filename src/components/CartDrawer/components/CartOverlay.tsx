"use client";

import type { CartOverlayProps } from "../types";

/**
 * CartOverlay
 * Componente que renderiza el overlay oscuro detrás del drawer
 * Se cierra al hacer click sobre él
 */
export function CartOverlay({ isOpen, onClose }: CartOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 bg-black/40 animate-in fade-in duration-300"
      onClick={onClose}
      role="button"
      tabIndex={-1}
      aria-label="Cerrar carrito"
    />
  );
}

export default CartOverlay;
