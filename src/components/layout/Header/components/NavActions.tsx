import Link from "next/link";
import { Search, User, ShoppingBag, Shield } from "lucide-react";
import UserMenu from "@/components/UserMenu";
import { TEXT_BRAND, HOVER_BRAND, BRAND_GOLD } from "../constants/constants";

interface Props {
  isAdmin: boolean;
  cartCount: number;
  isUserMenuOpen: boolean;
  onSearchOpen: () => void;
  onCartOpen: () => void;
  onUserMenuToggle: () => void;
  onUserMenuClose: () => void;
}

export default function NavActions({
  isAdmin,
  cartCount,
  isUserMenuOpen,
  onSearchOpen,
  onCartOpen,
  onUserMenuToggle,
  onUserMenuClose,
}: Props) {
  return (
    <div className="flex items-center gap-4 sm:gap-6">
      {isAdmin && (
        <Link
          href="/admin"
          className={`text-[${BRAND_GOLD}] hover:text-[#154734] transition-colors relative group`}
          aria-label="Panel Admin"
          title="Panel Admin"
        >
          <Shield className="w-5 h-5" />
          <span
            className={`absolute -top-1.5 -right-1.5 w-2 h-2 bg-[${BRAND_GOLD}] rounded-full group-hover:bg-[#154734] transition-colors`}
          />
        </Link>
      )}

      <button
        className={`text-foreground ${HOVER_BRAND} transition-colors`}
        onClick={onSearchOpen}
        aria-label="Buscar"
      >
        <Search className="w-5 h-5" />
      </button>

      <div className="relative">
        <button
          className={`transition-colors ${
            isUserMenuOpen ? TEXT_BRAND : `text-foreground ${HOVER_BRAND}`
          }`}
          onClick={onUserMenuToggle}
        >
          <User className="w-5 h-5" />
        </button>
        {isUserMenuOpen && <UserMenu onClose={onUserMenuClose} />}
      </div>

      <button
        className={`text-foreground ${HOVER_BRAND} transition-colors relative`}
        onClick={onCartOpen}
      >
        <ShoppingBag className="w-5 h-5" />
        {cartCount > 0 && (
          <span
            className={`absolute -top-1.5 -right-1.5 bg-[${BRAND_GOLD}] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-in zoom-in duration-300`}
          >
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
}
