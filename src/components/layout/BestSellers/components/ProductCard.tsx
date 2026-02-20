import Link from "next/link";
import Image from "next/image";
import { ProductCard as ProductCardType } from "../types/types";
import RatingStars from "./RatingStars";

interface ProductCardProps {
  product: ProductCardType;
}

const BRAND_GREEN = "#154734";
const BRAND_GOLD = "#C19A6B";

const ProductCard = ({ product }: ProductCardProps) => {
  // Lógica dinámica para el color del Badge (Etiqueta)
  const isAgotado = product.badge?.toLowerCase() === "agotado";

  return (
    <div className="group relative flex flex-col w-[65vw] sm:w-[40vw] md:w-[calc(25%-18px)] shrink-0 bg-white border border-gray-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(21,71,52,0.15)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden cursor-pointer">

      {/* ── IMAGEN CON EFECTO "MARCO DE GALERÍA" ── */}
      {/* Nota el 'm-2' (margin), esto crea el borde blanco alrededor de la foto */}
      <Link href={`/product/${product.slug}`} className="relative aspect-[3/4] overflow-hidden bg-[#F8F9FA] block m-2">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover object-top group-hover:scale-110 transition-transform duration-[1000ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
          placeholder="blur"
        />

        {/* Badge Dinámico (Verde o Rojo) */}
        {product.badge && (
          <div
            className={`absolute top-3 left-3 text-[9px] font-black px-3 py-1.5 uppercase tracking-[0.2em] shadow-md z-10 transition-colors ${isAgotado
              ? "bg-[#8B1A1A] text-white" // Rojo oscuro elegante para Agotado
              : "bg-white/95 backdrop-blur-sm text-[#154734]" // Blanco translúcido para otros
              }`}
          >
            {product.badge}
          </div>
        )}

        {/* Botón Quick Add Flotante (Aparece en Hover) */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-20">

          {/* Usamos un <span> en lugar de <button> porque ya estamos dentro del <Link> de la imagen */}
          <span
            className="flex justify-center items-center w-full bg-[#154734] text-white text-[10px] font-black tracking-[0.2em] py-3.5 uppercase border border-transparent hover:bg-[#0f3626] hover:border-[#C19A6B]/50 transition-all duration-300 shadow-lg"
          >
            Ver Detalles
          </span>

        </div>

        {/* Velo oscuro sutil en la imagen al hacer hover para resaltar el botón */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none" />
      </Link>

      {/* ── INFORMACIÓN DEL PRODUCTO ── */}
      <div className="px-4 pb-5 pt-3 flex flex-col gap-2.5 bg-white">

        <div className="flex justify-between items-start gap-4">
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-xs font-bold tracking-[0.15em] text-gray-900 uppercase group-hover:text-[#C19A6B] transition-colors leading-relaxed line-clamp-2">
              {product.name}
            </h3>
          </Link>

          <p
            className="text-sm font-medium text-[#154734] shrink-0"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {product.price}
          </p>
        </div>

        {/* Separador sutil */}
        <div className="h-px w-full bg-gray-100 my-2" />

        {/* ── SECCIÓN INFERIOR: Colores y Estrellas (Apilados para escalabilidad) ── */}
        <div className="flex flex-col gap-3 mt-1">
          
          {/* Colores (Con flex-wrap por si el cliente agrega muchos) */}
          {product.colors && (
            <div className="flex flex-wrap gap-2" aria-label="Colores disponibles">
              {product.colors.map((color, ci) => (
                <div 
                  key={ci} 
                  className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#154734] cursor-pointer transition-colors"
                >
                  <span
                    className="w-4 h-4 rounded-full shadow-inner"
                    style={{ backgroundColor: color }}
                    aria-label={color}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Reseñas y Estrellas */}
          {product.rating && (
            <div className="flex items-center gap-1.5">
              <RatingStars rating={product.rating} />
              <span className="text-xs tracking-wider text-gray-500 font-medium">
                {/* SOLUCIÓN: Cambiamos 1 por "1" */}
                ({product.reviews} {product.reviews === "1" ? 'reseña' : 'reseñas'})
              </span>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default ProductCard;