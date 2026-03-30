import Link from "next/link";
import Image from "next/image";
import { ProductItem } from "../types";
import RatingStars from "./RatingStars";

interface ProductCardProps {
  item: ProductItem;
  badgeVariant?: "white" | "gold";
}

const badgeColorClass = (badge?: string, variant: "white" | "gold" = "gold") => {
  if (!badge) return "";
  const b = badge.toLowerCase();
  if (b === "agotado") return "bg-[#8B1A1A] text-white";
  if (b === "nuevo producto") return "bg-red-600 text-white";
  if (b === "en oferta") return "bg-[#C19A6B] text-white";
  if (b === "nuevo y en oferta") return "bg-[#154734] text-white";
  // fallback legacy badges
  if (variant === "white") return "bg-white/95 backdrop-blur-sm text-[#154734]";
  return "bg-[#C19A6B] text-white";
};

const ProductCard = ({ item, badgeVariant = "gold" }: ProductCardProps) => {

  return (
    <Link
      href={`/product/${item.slug}`}
      className="group cursor-pointer flex flex-col h-full bg-white p-2 sm:p-3 md:p-4 rounded-[1.5rem] border border-[#C19A6B]/20 hover:border-[#C19A6B]/60 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-5px_rgba(193,154,107,0.15)] transition-all duration-500 w-full"
    >
      {/* Contenedor de la Imagen */}
      <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-xl bg-[#FAFAFA] border border-gray-50">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover object-top group-hover:scale-110 transition-transform duration-[1000ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
          {...(typeof item.image !== "string" && { placeholder: "blur" })}
        />

        {/* Badge (Etiqueta) */}
        {item.badge && (
          <span
            className={`absolute top-3 right-3 z-20 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-md ${badgeColorClass(item.badge, badgeVariant)}`}
          >
            {item.badge}
          </span>
        )}

        {/* Efecto de cristal muy sutil en hover (Reemplaza al antiguo bloque de Ver Detalles) */}
        <div className="absolute inset-0 bg-[#154734]/0 group-hover:bg-[#154734]/5 transition-colors duration-500 pointer-events-none" />
      </div>

      {/* Información del Producto */}
      <div className="px-1 text-center sm:text-left flex flex-col flex-1 items-center sm:items-start gap-2">
        <h3 className="text-sm sm:text-sm md:text-base font-bold uppercase tracking-widest transition-colors w-full truncate text-[#154734] group-hover:text-[#C19A6B]">
          {item.name}
        </h3>

        {/* Precios */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-base sm:text-sm md:text-base mb-1">
          <span className="font-medium text-[#154734]">{item.price}</span>
          {item.oldPrice && (
            <span className="text-gray-400 line-through text-sm font-light">{item.oldPrice}</span>
          )}
        </div>

        {/* Parte inferior: Colores y Rating */}
        <div className="mt-auto pt-3 w-full flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#C19A6B]/15 group-hover:border-[#C19A6B]/40 transition-colors">
          
          {/* Muestras de Color */}
          {item.colors && item.colors.length > 0 ? (
            <div className="flex gap-2 sm:gap-1.5 items-center flex-wrap" aria-label="Colores disponibles">
              {item.colors.map((color, ci) => (
                <div
                  key={ci}
                  title={color}
                  className="w-6 h-6 sm:w-5 sm:h-5 md:w-4 md:h-4 rounded-full border border-gray-200 shadow-sm transition-all duration-200 shrink-0 hover:scale-110 hover:border-gray-400"
                  style={{ backgroundColor: color }}
                  aria-label={color}
                />
              ))}
            </div>
          ) : (
            <div /> // Espaciador invisible si no hay colores
          )}

          {/* Calificación (Rating Stars) */}
          {item.rating && (
            <div className="flex items-center gap-1">
              <RatingStars rating={item.rating} />
              <span className="text-[9px] tracking-widest text-gray-400 font-medium ml-1">
                ({item.reviews})
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
