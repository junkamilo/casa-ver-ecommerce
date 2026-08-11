"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search as SearchIcon, Loader2, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  /** Conjunto: precio mostrado en tienda suele ser el mínimo entre ítems (basePrice del padre puede ser 0). */
  isSet?: boolean;
  minPrice?: number | null;
  image: string | null;
  /** Portada en video: en el buscador se muestra bloque verde con el nombre (como categorías sin foto). */
  coverVideo?: boolean;
}

interface SearchModalProps {
  onClose: () => void;
}

// ── localStorage helpers ──────────────────────────────────────────────────────

const RECENT_KEY = "cv_recent_products";
const MAX_RECENT = 6;

function formatPrice(price: number): string {
  return `$${price.toLocaleString("es-CO")}`;
}

function getRecentProducts(): SearchProduct[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveToRecent(product: SearchProduct) {
  const list = getRecentProducts().filter((p) => p.id !== product.id);
  localStorage.setItem(
    RECENT_KEY,
    JSON.stringify([product, ...list].slice(0, MAX_RECENT))
  );
}

function clearRecentProducts() {
  localStorage.removeItem(RECENT_KEY);
}

// ── Component ─────────────────────────────────────────────────────────────────
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".ogg"];

function isVideoUrl(url: string): boolean {
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

// ── Modal ─────────────────────────────────────────────────────────────────────

const SearchModal = ({ onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recent, setRecent] = useState<SearchProduct[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar recientes al abrir
  useEffect(() => {
    queueMicrotask(() => setRecent(getRecentProducts()));
  }, []);

  // Búsqueda con debounce de 300ms
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      const clearId = setTimeout(() => {
        setResults([]);
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(clearId);
    }

    const loadingId = setTimeout(() => setIsLoading(true), 0);
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data: SearchProduct[]) => setResults(data))
        .catch(() => setResults([]))
        .finally(() => setIsLoading(false));
    }, 300);

    return () => {
      clearTimeout(loadingId);
      clearTimeout(timer);
    };
  }, [query]);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleProductClick = (product: SearchProduct) => {
    saveToRecent(product);
    onClose();
  };

  const handleClearRecent = () => {
    clearRecentProducts();
    setRecent([]);
  };

  const trimmedQuery = query.trim();
  const showRecent = trimmedQuery.length === 0 && recent.length > 0;
  const showResults = trimmedQuery.length >= 2;
  const showEmpty = trimmedQuery.length === 0 && recent.length === 0;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-0 sm:pt-12 md:pt-20 lg:pt-24 px-0 sm:px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-background w-full h-full sm:h-auto sm:max-w-3xl 2xl:max-w-4xl sm:rounded-lg md:rounded-xl shadow-xl overflow-hidden relative animate-in fade-in slide-in-from-top-5 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 text-muted-foreground hover:text-foreground z-10 p-2 touch-target active:scale-90"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="p-4 sm:p-6 md:p-8">
          {/* Input */}
          <div className="relative flex items-center border-b border-border pb-2 sm:pb-3 mb-4 sm:mb-6 md:mb-8">
            {isLoading ? (
              <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground mr-2 sm:mr-3 shrink-0 animate-spin" />
            ) : (
              <SearchIcon className="w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground mr-2 sm:mr-3 shrink-0" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="flex-1 bg-transparent outline-none text-base sm:text-lg md:text-xl text-foreground placeholder:text-muted-foreground h-10 sm:h-12"
              autoFocus
              style={{ touchAction: "manipulation" }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/60"
                aria-label="Limpiar"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="space-y-6 sm:space-y-8 overflow-y-auto max-h-[calc(100vh-140px)] sm:max-h-[calc(80vh-100px)] pr-2 sm:pr-3">

            {/* Vistos recientemente */}
            {showRecent && (
              <section>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Visto recientemente
                  </h3>
                  <button
                    onClick={handleClearRecent}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-[#154734] transition-colors p-1 touch-target active:scale-90"
                  >
                    Borrar
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {recent.map((p) => (
                    <ProductSearchCard
                      key={p.id}
                      item={p}
                      onClose={() => handleProductClick(p)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Resultados de búsqueda */}
            {showResults && (
              <section>
                <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 sm:mb-4">
                  Productos
                </h3>

                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="w-full aspect-3/4 rounded-md bg-muted mb-2" />
                        <div className="h-3 bg-muted rounded w-3/4 mb-1" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : results.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {results.map((p) => (
                      <ProductSearchCard
                        key={p.id}
                        item={p}
                        onClose={() => handleProductClick(p)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                    <Package className="w-10 h-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No se encontraron productos para{" "}
                      <span className="font-medium text-foreground">
                        &quot;{trimmedQuery}&quot;
                      </span>
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Estado vacío inicial */}
            {showEmpty && (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                <SearchIcon className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Escribe para buscar productos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Tarjeta de producto ───────────────────────────────────────────────────────

const ProductSearchCard = ({
  item,
  onClose,
}: {
  item: SearchProduct;
  onClose: () => void;
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = !!item.image && !isVideoUrl(item.image) && !imageFailed;

  return (
    <Link
      href={`/product/${item.slug}`}
      className="flex flex-col group cursor-pointer"
      onClick={onClose}
    >
      <div className="relative w-full aspect-3/4 overflow-hidden rounded-md bg-muted mb-2">
        {hasImage ? (
          <Image
            src={item.image!}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, 200px"
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#154734]">
            <Package className="w-8 h-8 text-white/60" />
          </div>
        )}
      </div>
      <h4 className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 group-hover:text-[#154734] transition-colors">
        {item.name}
      </h4>
      <p className="text-xs sm:text-sm font-semibold text-foreground mt-1">
        {formatPrice(item.price)}
      </p>
    </Link>
  );
};

export default SearchModal;
