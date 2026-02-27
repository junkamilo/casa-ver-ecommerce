import Image from "next/image";
import Link from "next/link";

import { RecommendedProduct } from "../types";

interface Props {
  products: RecommendedProduct[];
}

export default function RecommendedProducts({ products }: Props) {
  if (!products.length) return null;

  return (
    <div className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider mb-6 sm:mb-8">
        Recomendados para ti
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        {products.map((product) => (
          <Link
            href={`/product/${product.slug}`}
            key={product.id}
            className="cursor-pointer group block"
          >
            <div className="relative aspect-3/4 mb-2 sm:mb-3 overflow-hidden bg-muted">
              {product.imageUrl && (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              )}
            </div>
            <h3 className="text-[10px] sm:text-xs font-bold uppercase">{product.name}</h3>
            <p className="text-xs sm:text-sm">${product.price.toLocaleString("es-CO")}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
