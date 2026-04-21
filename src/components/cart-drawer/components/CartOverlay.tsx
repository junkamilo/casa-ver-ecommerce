import type { CartOverlayProps } from "../types";

const CartOverlay = ({ onClose }: CartOverlayProps) => (
  <div
    className="absolute inset-0 bg-black/40 animate-in fade-in duration-300"
    onClick={onClose}
    onTouchEnd={onClose}
    role="button"
    tabIndex={-1}
    aria-label="Cerrar carrito"
    style={{ touchAction: "manipulation" }}
  />
);

export default CartOverlay;
