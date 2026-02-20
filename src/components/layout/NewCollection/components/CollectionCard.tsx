import Link from "next/link";
import Image from "next/image";
import { CollectionItem } from "../types/types";

interface CollectionCardProps {
  item: CollectionItem;
}

const CollectionCard = ({ item }: CollectionCardProps) => {
  const isAgotado = item.badge?.toLowerCase() === "agotado";

  return (
    <div className="group relative flex flex-col w-[65vw] sm:w-[40vw] md:w-[calc(25%-18px)] shrink-0 bg-white border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(21,71,52,0.12)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden cursor-pointer">
      
      {/* ── IMAGEN & OVERLAYS ── */}
      <Link href={`/product/${item.slug}`} className="relative aspect-[3/4] overflow-hidden bg-[#F8F9FA] block m-2">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover object-top group-hover:scale-110 transition-transform duration-[1000ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
          placeholder="blur"
        />
        
        {/* Badge Dinámico: Dorado para Nuevos, Rojo para Agotados */}
        {item.badge && (
          <div 
            className={`absolute top-3 left-3 text-[9px] font-black px-3 py-1.5 uppercase tracking-[0.2em] shadow-md z-10 transition-colors ${
              isAgotado 
                ? "bg-[#8B1A1A] text-white" 
                : "bg-[#C19A6B] text-white" // Dorado premium
            }`}
          >
            {item.badge}
          </div>
        )}

        {/* Botón Flotante */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-20">
          <span className="flex justify-center items-center w-full bg-[#154734] text-white text-[10px] font-black tracking-[0.2em] py-3.5 uppercase border border-transparent hover:bg-[#0f3626] hover:border-[#C19A6B]/50 transition-all duration-300 shadow-lg">
            Ver Detalles
          </span>
        </div>
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none" />
      </Link>

      {/* ── INFORMACIÓN DEL PRODUCTO ── */}
      <div className="px-4 pb-5 pt-3 flex flex-col gap-2.5 bg-white">
        
        <div className="flex justify-between items-start gap-4">
          <Link href={`/product/${item.slug}`}>
            <h3 className="text-xs font-bold tracking-[0.15em] text-gray-900 uppercase group-hover:text-[#C19A6B] transition-colors leading-relaxed line-clamp-2">
              {item.name}
            </h3>
          </Link>
        </div>

        <div className="h-px w-full bg-gray-100 my-1" />

        <div className="flex flex-col gap-3 mt-1">
          {/* Colores */}
          {item.colors && (
            <div className="flex flex-wrap gap-2" aria-label="Colores disponibles">
              {item.colors.map((color, ci) => (
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

          {/* Precios: Actual y Anterior */}
          <div className="flex items-center gap-3">
            <span 
              className="text-sm font-medium text-[#154734]" 
              style={{ fontFamily: "Georgia, serif" }}
            >
              {item.price}
            </span>
            {item.oldPrice && (
              <span 
                className="text-xs text-gray-400 line-through decoration-gray-300 decoration-1" 
                style={{ fontFamily: "Georgia, serif" }}
              >
                {item.oldPrice}
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CollectionCard;
