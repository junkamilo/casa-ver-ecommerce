"use client";

import { X, Search as SearchIcon } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

// --- IMPORTAMOS IMÁGENES DE EJEMPLO (Usamos las que ya tienes) ---

// Datos de ejemplo para "Productos" sugeridos


interface SearchModalProps {
  onClose: () => void;
}

const SearchModal = ({ onClose }: SearchModalProps) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-100 flex items-start justify-center pt-0 sm:pt-12 md:pt-20 lg:pt-24 px-0 sm:px-4"
      onClick={onClose}
    >
      <div
        className="bg-background w-full h-full sm:h-auto sm:max-w-3xl 2xl:max-w-4xl sm:rounded-lg md:rounded-xl shadow-xl overflow-hidden relative animate-in fade-in slide-in-from-top-5 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 text-muted-foreground hover:text-foreground z-10 p-2 touch-target active:scale-90"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="p-4 sm:p-6 md:p-8">
          <div className="relative flex items-center border-b border-border pb-2 sm:pb-3 mb-4 sm:mb-6 md:mb-8">
            <SearchIcon className="w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground mr-2 sm:mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Buscar"
              className="flex-1 bg-transparent outline-none text-base sm:text-lg md:text-xl text-foreground placeholder:text-muted-foreground h-10 sm:h-12"
              autoFocus
            />
          </div>

          <div className="space-y-6 sm:space-y-8 overflow-y-auto max-h-[calc(100vh-140px)] sm:max-h-[calc(80vh-100px)] pr-2 sm:pr-3">

            <section>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">Visto recientemente</h3>
                <button className="text-xs sm:text-sm text-muted-foreground hover:text-brand transition-colors p-1 touch-target active:scale-90">
                  Borrar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

              </div>
            </section>

            <section>
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 sm:mb-4">Productos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">

              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para las tarjeticas de producto dentro del modal
const ProductSearchCard = ({ item, onClose }: { item: any, onClose: () => void }) => (
  <Link
    href={`/tienda?producto=${item.slug}`}
    className="flex items-start gap-3 group cursor-pointer"
    onClick={onClose}
  >
    <div className="relative w-16 h-20 sm:w-20 sm:h-24 shrink-0 overflow-hidden rounded-md bg-muted">
      <Image
        src={item.image}
        alt={item.name}
        fill
        className="object-cover group-hover:scale-105 transition-transform"
      />
    </div>
    <div className="min-w-0">
      <h4 className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 group-hover:text-brand transition-colors">
        {item.name}
      </h4>
      <p className="text-xs sm:text-sm font-semibold text-foreground mt-1">{item.price}</p>
    </div>
  </Link>
);

export default SearchModal;
