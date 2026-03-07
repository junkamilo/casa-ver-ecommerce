"use client";

import Image from "next/image";

interface Props {
  gallery: string[];
  selectedImage: number;
  productName: string;
  onSelect: (index: number) => void;
  activeColorHex?: string;
}

export default function ProductGallery({
  gallery,
  selectedImage,
  productName,
  onSelect,
  activeColorHex,
}: Props) {
  if (!gallery.length) return null;

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 sm:gap-5">

      {/* Miniaturas */}
      <div className="flex lg:flex-col gap-2 sm:gap-3 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden py-2 lg:py-0 scrollbar-hide lg:w-20 xl:w-24 shrink-0 lg:max-h-150 xl:max-h-175">
        {gallery.map((url, i) => {
          const isSelected = selectedImage === i;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              aria-label={`Ver imagen ${i + 1} de ${productName}`}
              className={`relative w-16 h-20 sm:w-20 sm:h-28 lg:w-full lg:h-28 xl:h-32 shrink-0 rounded-xl overflow-hidden transition-all duration-500 ease-out focus:outline-none ${
                isSelected
                  ? "ring-2 ring-[#C19A6B] ring-offset-2 opacity-100 shadow-sm"
                  : "opacity-55 grayscale-30 hover:opacity-100 hover:grayscale-0 hover:shadow-md hover:ring-1 hover:ring-[#C19A6B]/40 hover:ring-offset-1"
              }`}
            >
              <Image
                src={url}
                alt={`Miniatura ${i + 1} de ${productName}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80px, 120px"
              />
            </button>
          );
        })}
      </div>

      {/* Imagen principal — contenedor con glow exterior dinámico */}
      <div
        className="relative w-full aspect-4/5 sm:aspect-3/4 xl:aspect-2/3 bg-[#FAFAFA] rounded-2xl overflow-hidden shadow-sm border border-gray-100 group cursor-crosshair"
        style={{
          transition: "box-shadow 700ms ease-in-out",
          boxShadow: activeColorHex
            ? `0 0 0 1px ${activeColorHex}30, 0 8px 40px ${activeColorHex}35, 0 2px 12px ${activeColorHex}25`
            : "0 1px 3px 0 rgb(0 0 0 / 0.1)",
        }}
      >

        {/* Capa de tinte de color — backgroundColor transiciona nativamente */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundColor: activeColorHex ? `${activeColorHex}22` : "transparent",
            transition: "background-color 700ms ease-in-out",
          }}
        />

        {/* Skeleton de carga */}
        <div className="absolute inset-0 bg-linear-to-tr from-[#FAFAFA] to-gray-50 animate-pulse z-1" />

        <Image
          src={gallery[selectedImage]}
          alt={productName}
          fill
          priority
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] z-10"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />

        {/* Contador de imágenes — mobile */}
        <div className="absolute bottom-4 left-4 z-20 lg:hidden">
          <span className="bg-black/30 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            {selectedImage + 1} / {gallery.length}
          </span>
        </div>

        {/* Marca de agua sutil */}
        <div className="absolute bottom-4 right-4 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span className="text-[10px] uppercase tracking-[0.3em] font-black text-white mix-blend-difference drop-shadow-md">
            Casa Verde
          </span>
        </div>
      </div>
    </div>
  );
}
