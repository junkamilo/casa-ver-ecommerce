import { ShoppingBag } from "lucide-react";
import type { CartEmptyProps } from "../types";

const CartEmpty = ({ onClose }: CartEmptyProps) => (
  <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
    <ShoppingBag className="w-12 h-12 mb-4 text-muted-foreground" />
    <p className="text-lg font-medium">Tu carrito está vacío</p>
    <button onClick={onClose} className="mt-4 text-sm underline hover:text-brand">
      Seguir comprando
    </button>
  </div>
);

export default CartEmpty;
