import Link from "next/link";
import { TEXT_BRAND, HOVER_BRAND, BORDER_BRAND } from "../constants/constants";

interface Props {
  isCategoriesActive: boolean;
  onCategoriesEnter: () => void;
}

const linkCls = `text-xs font-bold tracking-[0.15em] text-foreground ${HOVER_BRAND} transition-colors`;

export default function NavLinks({ isCategoriesActive, onCategoriesEnter }: Props) {
  return (
    <nav className="hidden lg:flex items-center gap-6">
      <Link href="/" className={linkCls}>INICIO</Link>
      <Link href="/tienda" className={linkCls}>TIENDA</Link>

      <div className="h-full flex items-center" onMouseEnter={onCategoriesEnter}>
        <Link
          href="/tienda"
          className={`text-xs font-bold tracking-[0.15em] transition-colors py-4 border-b-2 ${
            isCategoriesActive
              ? `${TEXT_BRAND} ${BORDER_BRAND}`
              : `text-foreground border-transparent ${HOVER_BRAND}`
          }`}
        >
          CATEGORÍAS
        </Link>
      </div>
    </nav>
  );
}
