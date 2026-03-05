import Link from "next/link";
import { Fragment } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-4 text-[10px] sm:text-xs text-gray-400 uppercase tracking-[0.2em] font-medium flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={`${item.label}-${index}`}>
              {/* Si es el último elemento o no tiene link, se muestra como texto activo */}
              {isLast || !item.href ? (
                <span className="text-[#154734] font-bold shrink-0">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-[#C19A6B] transition-colors shrink-0"
                >
                  {item.label}
                </Link>
              )}

              {/* Separador (excepto después del último elemento) */}
              {!isLast && <span className="text-gray-300 shrink-0">/</span>}
            </Fragment>
          );
        })}
      </div>
    </nav>
  );
}