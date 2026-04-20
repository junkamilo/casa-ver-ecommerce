import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { CartEmptyProps } from "../types";

const CartEmpty = ({ onClose }: CartEmptyProps) => (
  <div className="h-full flex flex-col items-center justify-center text-center px-6">
    <div className="opacity-40 mb-2">
      <ShoppingBag className="w-14 h-14 text-muted-foreground mx-auto" />
    </div>
    <p className="text-base font-semibold text-foreground mt-3">Tu carrito está vacío</p>
    <p className="text-xs text-muted-foreground mt-1 mb-5">
      Agrega productos para comenzar tu compra
    </p>
    <Link
      href="/colecciones"
      onClick={onClose}
      className="px-5 py-2.5 bg-[#154734] text-white text-sm font-medium rounded-lg hover:bg-[#103a2a] active:scale-95 transition-all"
    >
      Ver colecciones
    </Link>
  </div>
);

export default CartEmpty;
