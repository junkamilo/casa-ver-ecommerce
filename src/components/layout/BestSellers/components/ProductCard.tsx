import Link from "next/link";
import Image from "next/image";
import { ProductCard as ProductCardType } from "../types/types";
import RatingStars from "./RatingStars";

interface ProductCardProps {
  product: ProductCardType;
}

const ProductCard = ({ product }: ProductCardProps) => (
  <Link
    href={`/product/${product.slug}`}
    className="group block cursor-pointer w-[45vw] sm:w-[40vw] md:w-[calc(25%-18px)] shrink-0 hover:-translate-y-0.5 transition-all duration-300"
  >
    <div className="relative overflow-hidden mb-3 aspect-[3/4] bg-muted shadow-premium group-hover:shadow-premium-hover transition-shadow duration-300">
      <Image
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
        placeholder="blur"
      />
      {product.badge && (
        <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm">
          {product.badge}
        </span>
      )}
    </div>

    <h3 className="text-xs sm:text-sm font-bold tracking-wider text-foreground mb-1 uppercase group-hover:text-brand transition-colors">
      {product.name}
    </h3>

    {product.rating && (
      <div className="flex items-center gap-2 mb-1">
        <RatingStars rating={product.rating} />
        <span className="text-xs text-muted-foreground">({product.reviews})</span>
      </div>
    )}

    <p className="text-sm font-medium text-primary mb-2">{product.price}</p>

    {product.colors && (
      <div className="flex gap-1.5" aria-label="Colores disponibles">
        {product.colors.map((color, ci) => (
          <span
            key={ci}
            className="w-4 h-4 rounded-full border border-border"
            style={{ backgroundColor: color }}
            aria-label={color}
          />
        ))}
      </div>
    )}
  </Link>
);

export default ProductCard;
