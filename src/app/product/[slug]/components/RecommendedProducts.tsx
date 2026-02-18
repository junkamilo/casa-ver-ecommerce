import Image from "next/image";
import Link from "next/link";
import { StaticImageData } from "next/image";

interface Props {
  images: StaticImageData[];
}

export default function RecommendedProducts({ images }: Props) {
  return (
    <div className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider mb-6 sm:mb-8">
        Recomendados para ti
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        {images.map((img, i) => (
          <Link href="#" key={i} className="cursor-pointer group block">
            <div className="relative aspect-3/4 mb-2 sm:mb-3 overflow-hidden">
              <Image
                src={img}
                alt="Recomendado"
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <h3 className="text-[10px] sm:text-xs font-bold uppercase">
              Producto Recomendado {i + 1}
            </h3>
            <p className="text-xs sm:text-sm">$120.000</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
