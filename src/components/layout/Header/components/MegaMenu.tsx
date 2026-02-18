import Link from "next/link";
import { HOVER_BRAND, megaMenuData, TEXT_BRAND } from "../constants/constants";


interface Props {
  visible: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClose: () => void;
}

export default function MegaMenu({ visible, onEnter, onLeave, onClose }: Props) {
  return (
    <div
      className={`hidden lg:block absolute top-full left-0 w-full bg-background/95 backdrop-blur-sm border-b border-border shadow-lg transition-all duration-300 ease-in-out z-40 overflow-hidden ${
        visible ? "opacity-100 visible max-h-[400px]" : "opacity-0 invisible max-h-0"
      }`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="container mx-auto px-8 py-10">
        <div className="grid grid-cols-4 gap-8">
          {megaMenuData.map((column) => (
            <div key={column.title} className="flex flex-col gap-4">
              <h3
                className={`text-xs font-bold tracking-[0.2em] ${TEXT_BRAND} uppercase border-b border-border pb-2 mb-1`}
              >
                {column.title}
              </h3>
              <div className="flex flex-col gap-3">
                {column.items.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/collections/${item.slug}`}
                    className={`text-sm text-foreground ${HOVER_BRAND} hover:translate-x-1 transition-all`}
                    onClick={onClose}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
