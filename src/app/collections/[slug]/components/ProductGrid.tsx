import Link from "next/link";
import { Play } from "lucide-react";
import type { CollectionProduct } from "../types";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".ogg"];

function isVideo(url: string): boolean {
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

interface ProductGridProps {
  products: CollectionProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
        No hay productos disponibles en esta colección.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
      {products.map((item) => (
        <Link
          href={`/product/${item.slug}`}
          key={item.slug}
          className="group cursor-pointer block"
        >
          <div className="relative aspect-3/4 mb-3 overflow-hidden bg-muted">
            {item.mediaUrl ? (
              isVideo(item.mediaUrl) ? (
                <>
                  <video
                    src={item.mediaUrl}
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <Play className="w-10 h-10 text-white drop-shadow" />
                  </div>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.mediaUrl}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )
            ) : (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                Sin imagen
              </div>
            )}

            {item.badge && (
              <span
                className={`absolute top-2 right-2 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                  item.badge === "Oferta"
                    ? "bg-red-500"
                    : item.badge === "Nuevo"
                    ? "bg-[#154734]"
                    : "bg-[#C19A6B]"
                }`}
              >
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

          {item.colors && (
            <div className="flex gap-1.5">
              {item.colors.map((color) => (
                <div
                  key={color.name}
                  title={color.name}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: color.hexCode }}
                />
              ))}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
