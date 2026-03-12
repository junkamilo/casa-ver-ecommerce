import Link from "next/link";
import Image from "next/image";
import { ProductItem } from "../types";
import RatingStars from "./RatingStars";

interface ProductCardProps {
  item: ProductItem;
  badgeVariant?: "white" | "gold";
}

const ProductCard = ({ item, badgeVariant = "gold" }: ProductCardProps) => {
  const isAgotado = item.badge?.toLowerCase() === "agotado";

  return (
    <Link
      href={`/product/${item.slug}`}
      // ¡IMPORTANTE!: Mantenemos las clases de ancho (w-[65vw]...) y shrink-0 para que el carrusel no se rompa
      className="group cursor-pointer flex flex-col h-full bg-white p-3 sm:p-4 rounded-[1.5rem] border border-[#C19A6B]/20 hover:border-[#C19A6B]/60 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-5px_rgba(193,154,107,0.15)] transition-all duration-500 w-[65vw] sm:w-[40vw] md:w-[calc(25%-18px)] shrink-0"
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

        {/* Badge (Etiqueta Premium) */}
        {item.badge && (
          <span
            className={`absolute top-3 right-3 z-20 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-md ${
              isAgotado
                ? "bg-[#8B1A1A]"
                : badgeVariant === "white"
                ? "bg-white/95 backdrop-blur-sm text-[#154734]"
                : "bg-[#C19A6B]"
            }`}
          >
            {item.badge}
          </span>
        )}

        {/* Efecto de cristal muy sutil en hover (Reemplaza al antiguo bloque de Ver Detalles) */}
        <div className="absolute inset-0 bg-[#154734]/0 group-hover:bg-[#154734]/5 transition-colors duration-500 pointer-events-none" />
      </div>

      {/* Información del Producto */}
      <div className="px-1 text-center sm:text-left flex flex-col flex-1 items-center sm:items-start gap-2">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors w-full truncate text-[#154734] group-hover:text-[#C19A6B]">
          {item.name}
        </h3>

        {/* Precios */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-sm mb-1">
          <span className="font-medium text-[#154734]">${item.price}</span>
          {item.oldPrice && (
            <span className="text-gray-400 line-through text-xs font-light">${item.oldPrice}</span>
          )}
        </div>

        {/* Parte inferior: Colores y Rating */}
        <div className="mt-auto pt-3 w-full flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#C19A6B]/15 group-hover:border-[#C19A6B]/40 transition-colors">
          
          {/* Muestras de Color */}
          {item.colors && item.colors.length > 0 ? (
            <div className="flex gap-1.5 items-center flex-wrap" aria-label="Colores disponibles">
              {item.colors.map((color, ci) => (
                <div
                  key={ci}
                  title={color}
                  className="w-4 h-4 rounded-full border border-gray-200 shadow-sm transition-all duration-200 shrink-0 hover:scale-110 hover:border-gray-400"
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
