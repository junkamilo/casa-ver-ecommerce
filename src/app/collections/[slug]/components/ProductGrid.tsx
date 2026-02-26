import Image from "next/image";
import Link from "next/link";
import type { CollectionProduct } from "../types";

interface ProductGridProps {
  products: CollectionProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
      {products.map((item, i) => (
        <Link
          href={`/product/${item.slug}`}
          key={i}
          className="group cursor-pointer block"
        >
          <div className="relative aspect-[3/4] mb-3 overflow-hidden bg-muted">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {item.badge && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                {item.badge}
              </span>
            )}
          </div>

          <h3 className="text-xs font-bold text-foreground uppercase mb-1 tracking-wide group-hover:underline underline-offset-4">
            {item.name}
          </h3>

          <div className="flex items-center gap-2 text-sm mb-2">
            <span className="font-medium">${item.price.toLocaleString()}</span>
            {item.oldPrice && (
              <span className="text-muted-foreground line-through text-xs">
                ${item.oldPrice.toLocaleString()}
              </span>
            )}
          </div>

          {item.colorLabel && (
            <p className="text-xs text-muted-foreground mb-2">Color: {item.colorLabel}</p>
          )}

          {item.colors && (
            <div className="flex gap-1.5">
              {item.colors.map((color, idx) => (
                <div
                  key={idx}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
