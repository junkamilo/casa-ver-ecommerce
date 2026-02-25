import { X } from "lucide-react";

interface CartHeaderProps {
  cartCount: number;
  onClose: () => void;
}

const CartHeader = ({ cartCount, onClose }: CartHeaderProps) => (
  <div className="flex items-center justify-between p-5 border-b border-border">
    <h2 className="text-xl font-bold flex items-center gap-2">
      Carrito
      <span className="bg-muted text-foreground text-xs px-2 py-0.5 rounded-full border border-border">
        {cartCount}
      </span>
    </h2>
    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
      <X className="w-5 h-5" />
    </button>
  </div>
);

export default CartHeader;
