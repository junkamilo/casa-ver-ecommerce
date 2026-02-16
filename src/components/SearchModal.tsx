"use client";

import { X, Search as SearchIcon } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

// --- IMPORTAMOS IMÁGENES DE EJEMPLO (Usamos las que ya tienes) ---
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

// Datos de ejemplo para "Visto recientemente"
const recentlyViewed = [
  {
    image: product1,
    name: "SET SHORT BODY CAMISETA",
    price: "$140.000",
    slug: "set-short-body",
  },
];

// Datos de ejemplo para "Productos" sugeridos
const suggestedProducts = [
  { image: product2, name: "BODY BASIC", price: "$90.000", slug: "body-basic" },
  { image: product3, name: "BODY BASIC NEGRO", price: "$110.000", slug: "body-basic-negro" },
  { image: product4, name: "BODY BOTONES", price: "$80.000", slug: "body-botones" },
  { image: product1, name: "BODY MAGNOLIO", price: "$120.000", slug: "body-magnolio" },
];

interface SearchModalProps {
  onClose: () => void;
}

const SearchModal = ({ onClose }: SearchModalProps) => {
  return (
    // 1. Overlay - en móvil ocupa toda la pantalla, en desktop tiene padding superior
    <div
      className="fixed inset-0 bg-black/50 z-100 flex items-start justify-center pt-0 sm:pt-20 md:pt-24 px-0 sm:px-4"
      onClick={onClose}
    >
      {/* 2. Contenedor del modal - fullscreen en móvil, contenido en desktop */}
      <div
        className="bg-background w-full h-full sm:h-auto sm:max-w-3xl sm:rounded-xl shadow-xl overflow-hidden relative animate-in fade-in slide-in-from-top-5 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 sm:p-6">
          {/* 3. Input de Búsqueda */}
          <div className="relative flex items-center border-b border-border pb-2 mb-4 sm:mb-6">
            <SearchIcon className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Buscar"
              className="flex-1 bg-transparent outline-none text-base sm:text-lg text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
          </div>

          <div className="space-y-6 sm:space-y-8 overflow-y-auto max-h-[calc(100vh-120px)] sm:max-h-[60vh] pr-1 sm:pr-2">
            {/* 4. Sección: Visto recientemente */}
            <section>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Visto recientemente</h3>
                <button className="text-sm text-muted-foreground hover:text-brand transition-colors">
                  Borrar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {recentlyViewed.map((item, i) => (
                  <ProductSearchCard key={i} item={item} onClose={onClose} />
                ))}
              </div>
            </section>

            {/* 5. Sección: Productos sugeridos */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 sm:mb-4">Productos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {suggestedProducts.map((item, i) => (
                  <ProductSearchCard key={i} item={item} onClose={onClose} />
                ))}
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
