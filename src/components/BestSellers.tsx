import Link from "next/link"; // <--- 1. IMPORTAR LINK
import Image, { StaticImageData } from "next/image";
import { Star } from "lucide-react";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";

interface ProductCard {
  image: StaticImageData;
  name: string;
  price: string;
  rating?: number;
  reviews?: string;
  colors?: string[];
  colorLabel?: string;
  badge?: string;
  slug: string; // <--- 2. NUEVO CAMPO OBLIGATORIO
}

const products: ProductCard[] = [
  {
    image: product1,
    name: "SET SHORT BODY CAMISETA",
    price: "$140.000",
    rating: 5,
    reviews: "1 reseñas",
    colors: ["#a8d4f0", "#8b6f5e", "#2d2d2d", "#c4a882"],
    colorLabel: "AZUL BEBÉ",
    slug: "set-short-body-camiseta", // <--- SLUG AGREGADO
  },
  {
    image: product2,
    name: "SET PANT G",
    price: "$150.000",
    badge: "Agotado",
    slug: "set-pant-g",
  },
  {
    image: product3,
    name: "SET PANT ICON",
    price: "$185.000",
    colors: ["#a8d4f0", "#f5f0c4", "#2d2d2d", "#8b6f5e", "#1a1a1a"],
    colorLabel: "AZUL BEBÉ",
    slug: "set-pant-icon",
  },
  {
    image: product4,
    name: "SET AURORA",
    price: "$190.000",
    rating: 3,
    reviews: "1 reseñas",
    colors: ["#d4c4a8", "#8b6f5e", "#1a1a1a"],
    colorLabel: "BEIGE",
    slug: "set-aurora",
  },
  {
    image: product5,
    name: "SET PANT G SIN PUSH",
    price: "$150.000",
    colors: ["#8b6f5e", "#3d6b8a"],
    colorLabel: "CAFÉ",
    slug: "set-pant-g-sin-push",
  },
];

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < rating ? "fill-foreground text-foreground" : "text-muted-foreground/30"}`}
      />
    ))}
  </div>
);

const BestSellers = () => {
  return (
    <section className="py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <h2 className="text-xl sm:text-2xl font-bold text-center tracking-wider text-foreground mb-6 sm:mb-8 lg:mb-10">
        MÁS VENDIDOS
      </h2>
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {products.map((product, i) => (
          <Link
            href={`/product/${product.slug}`}
            key={i}
            className="min-w-40 sm:min-w-50 lg:min-w-60 flex-1 cursor-pointer group block"
          >
            <div className="relative overflow-hidden mb-2 sm:mb-3">
              <Image
                src={product.image}
                alt={product.name}
                className="w-full aspect-3/4 object-cover group-hover:scale-105 transition-transform duration-500"
                placeholder="blur"
              />
              {product.badge && (
                <span className="absolute top-3 right-3 bg-background text-foreground text-xs px-3 py-1 border border-border">
                  {product.badge}
                </span>
              )}
            </div>
            <h3 className="text-xs sm:text-sm font-semibold tracking-wider text-foreground mb-1">
              {product.name}
            </h3>
            {product.rating && (
              <div className="flex items-center gap-2 mb-1">
                <RatingStars rating={product.rating} />
                <span className="text-xs text-muted-foreground">{product.reviews}</span>
              </div>
            )}
            <p className="text-sm text-foreground mb-2">{product.price}</p>
            {product.colorLabel && (
              <p className="text-xs text-muted-foreground tracking-wider mb-2">
                COLOR: {product.colorLabel}
              </p>
            )}
            {product.colors && (
              <div className="flex gap-1.5">
                {product.colors.map((color, ci) => (
                  <span
                    key={ci}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BestSellers;
