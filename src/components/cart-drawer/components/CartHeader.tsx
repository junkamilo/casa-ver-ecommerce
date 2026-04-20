import { X, Trash2 } from "lucide-react";
import type { CartHeaderProps } from "../types";

const CartHeader = ({ cartCount, onClose, onClear }: CartHeaderProps) => (
  <div className="flex items-center justify-between p-5 border-b border-border">
    <h2 className="text-xl font-bold flex items-center gap-2">
      Carrito
      <span className="bg-muted text-foreground text-xs px-2 py-0.5 rounded-full border border-border">
        {cartCount}
      </span>
    </h2>

    <div className="flex items-center gap-1">
      {cartCount > 0 && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50 active:scale-95"
          aria-label="Vaciar carrito"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Vaciar
        </button>
      )}
      <button
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted active:scale-95"
        aria-label="Cerrar carrito"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  </div>
);

export default CartHeader;
