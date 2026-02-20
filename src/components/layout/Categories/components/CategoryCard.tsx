import Link from "next/link";
import Image, { StaticImageData } from "next/image";

interface CategoryCardProps {
  image: StaticImageData | string;
  label: string;
  slug: string;
}

const CategoryCard = ({ image, label, slug }: CategoryCardProps) => (
  <Link
    href={`/collections/${slug}`}
    // Cambiamos a aspect-[4/5] para un formato de moda más vertical y elegante
    className="group block relative cursor-pointer w-[65vw] sm:w-[40vw] md:w-[calc(25%-18px)] shrink-0 aspect-[4/5] overflow-hidden bg-[#F8F9FA] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(21,71,52,0.2)] transition-all duration-500"
  >
    {/* Imagen con zoom lento */}
    <Image
      src={image}
      alt={label}
      fill
      className="object-cover object-center group-hover:scale-110 transition-transform duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
      sizes="(max-width: 640px) 65vw, (max-width: 768px) 40vw, 25vw"
      placeholder="blur"
    />

    {/* Velo Degradado Inferior (Para que el texto blanco siempre se lea bien) */}
    <div className="absolute inset-0 bg-gradient-to-t from-[#081c14]/90 via-[#0a2318]/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

    {/* Marco Interior Dorado (Aparece sutilmente en hover) */}
    <div className="absolute inset-4 border border-[#C19A6B]/0 group-hover:border-[#C19A6B]/30 transition-colors duration-700 pointer-events-none z-10" />

    {/* Contenido de Texto */}
    <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 z-20">
      <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
        <h3 className="text-white text-lg sm:text-xl font-bold tracking-[0.2em] uppercase mb-2 drop-shadow-md">
          {label}
        </h3>
        
        {/* Línea decorativa y texto secundario que "nace" al pasar el mouse */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
          <span className="h-[1px] w-4 bg-[#C19A6B]" />
          <span className="text-[#C19A6B] text-[10px] sm:text-xs font-black tracking-[0.25em] uppercase">
            Explorar
          </span>
        </div>
      </div>
    </div>
  </Link>
);

export default CategoryCard;
