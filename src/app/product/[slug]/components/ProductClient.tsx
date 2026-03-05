"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, Check, ShoppingBag, Sparkles } from "lucide-react";

import { useCart } from "@/context/CartContext";
import ProductGallery from "./ProductGallery";
import ColorSelector from "./ColorSelector";
import SizeSelector from "./SizeSelector";
import QuantityPicker from "./QuantityPicker";
import ProductAccordion from "./ProductAccordion";
import ReviewsSection from "./ReviewsSection";
import RecommendedProducts from "./RecommendedProducts";
import ProductVideo from "./ProductVideo";
import Testimonials from "@/components/layout/Testimonials";

import { UIProduct, UIColor, RecommendedProduct } from "../types";
import { formatPrice } from "../constants";
import type { TestimonialItem } from "@/components/layout/Testimonials/types/types";

interface ExistingReview {
  rating: number;
  comment: string | null;
}

interface Props {
  product: UIProduct;
  recommended: RecommendedProduct[];
  existingReview: ExistingReview | null;
  isAuthenticated: boolean;
  reviews: TestimonialItem[];
}

const isVideoUrl = (url: string) => /\.(mp4|mov|avi|webm|mkv|ogg)$/i.test(url);

export default function ProductClient({
  product,
  recommended,
  existingReview,
  isAuthenticated,
  reviews,
}: Props) {
  // ─── Estado principal ────────────────────────────────────────────────────
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<UIColor | null>(
    product.colors[0] ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // 'main' = producto principal, cualquier otro string = item.id de subcategoría
  const [activeView, setActiveView] = useState<string>("main");

  const { addToCart } = useCart();

  // ─── Datos activos según la vista seleccionada ──────────────────────────
  const activeItem = activeView === "main"
    ? null
    : (product.items.find((i) => i.id === activeView) ?? null);

  const activeColors = activeItem ? activeItem.colors : product.colors;
  const activeVideoUrl = activeItem ? activeItem.videoUrl : product.videoUrl;
  const activePrice = activeItem ? (activeItem.price ?? product.basePrice) : product.basePrice;
  const activeStock = activeItem ? activeItem.stock : product.stock;
  const activeDescription = activeItem
    ? (activeItem.description ?? product.description)
    : product.description;

  // Galería: cuando se ve una subcategoría no se muestran las imágenes generales del padre
  const activeGeneralImages = activeItem ? [] : product.generalImages;

  // ─── Galería maestra (reconstruida cuando cambia la vista activa) ────────
  const masterGallery = useMemo(() => {
    const items: { url: string; color: UIColor | null }[] = [];
    activeGeneralImages
      .filter((url) => !isVideoUrl(url))
      .forEach((url) => items.push({ url, color: null }));
    activeColors.forEach((color) => {
      color.images
        .filter((url) => !isVideoUrl(url))
        .forEach((url) => items.push({ url, color }));
    });
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGeneralImages, activeColors]);

  const galleryUrls = masterGallery.map((item) => item.url);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleViewSelect = (view: string) => {
    setActiveView(view);
    const item = view === "main"
      ? null
      : (product.items.find((i) => i.id === view) ?? null);
    setSelectedColor(item ? (item.colors[0] ?? null) : (product.colors[0] ?? null));
    setSelectedSize(null);
    setSelectedImage(0);
  };

  const handleColorSelect = (color: UIColor) => {
    setSelectedColor(color);
    setSelectedSize(null);
    const firstIdx = masterGallery.findIndex((item) => item.color?.id === color.id);
    if (firstIdx !== -1) setSelectedImage(firstIdx);
  };

  const handleImageSelect = (index: number) => {
    setSelectedImage(index);
    const associatedColor = masterGallery[index].color;
    if (associatedColor && associatedColor.id !== selectedColor?.id) {
      setSelectedColor(associatedColor);
      setSelectedSize(null);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    const cartName = product.isSet && activeItem
      ? `${product.name} — ${activeItem.name}`
      : product.name;
    addToCart(
      { name: cartName, price: activePrice, gallery: galleryUrls, image: galleryUrls[0] ?? "" },
      quantity,
      { name: selectedColor.name, hex: selectedColor.hex },
      selectedSize
    );
    setShowAddedNotification(true);
    setTimeout(() => setShowAddedNotification(false), 2000);
  };

  const scrollToReviews = () => {
    document.getElementById("seccion-resenas")?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  return (
    <div className="bg-white selection:bg-[#C19A6B]/20 min-h-screen">

      {/* Toast */}
      <div
        aria-live="polite"
        className={`fixed top-6 right-6 z-100 flex items-center gap-4 bg-[#154734] text-white shadow-2xl rounded-xl px-5 py-4 transition-all duration-500 ${showAddedNotification ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8 pointer-events-none"
          }`}
      >
        <div className="bg-white/20 rounded-full p-2 backdrop-blur-sm">
          <Check className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide">Añadido a tu bolsa</p>
          <p className="text-xs text-white/70 flex items-center gap-1.5 mt-0.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            {product.name}
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-4 text-[10px] sm:text-xs text-gray-400 uppercase tracking-[0.2em] font-medium flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link href="/" className="hover:text-[#C19A6B] transition-colors shrink-0">Inicio</Link>
          <span className="text-gray-300">/</span>
          <Link href="/tienda" className="hover:text-[#C19A6B] transition-colors shrink-0">Tienda</Link>
          <span className="text-gray-300">/</span>
          <span className="text-[#154734] font-bold shrink-0">{product.name}</span>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-8 pb-16 sm:pt-12 sm:pb-24 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-16 xl:gap-20">

          {/* Galería — sticky mientras scrolleas los detalles */}
          <div className="self-start lg:sticky lg:top-24 xl:top-28">
            <ProductGallery
              gallery={galleryUrls}
              selectedImage={selectedImage}
              productName={product.name}
              onSelect={handleImageSelect}
              activeColorHex={selectedColor?.hex}
            />
          </div>

          {/* Detalles — scroll natural */}
          <div className="flex flex-col">

            {/* Nombre y Precio */}
            <div className="mb-5">
              <h1
                className="text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-light text-[#154734] mb-4 uppercase leading-tight tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {product.name}
              </h1>
              <div className="flex items-end gap-3">
                <p className="text-2xl sm:text-3xl font-medium text-gray-900">
                  {formatPrice(activePrice)}
                </p>
                {product.comparePrice && (
                  <p className="text-base text-gray-400 line-through mb-1">
                    {formatPrice(product.comparePrice)}
                  </p>
                )}
              </div>
              {activeStock === 0 ? (
                <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mt-2">Agotado</p>
              ) : (
                <p className="text-xs text-gray-400 mt-2">
                  Stock disponible: <span className="font-semibold text-gray-600">{activeStock}</span>
                </p>
              )}
            </div>

            {/* Rating */}
            <button
              type="button"
              onClick={scrollToReviews}
              className="flex items-center gap-3 mb-8 cursor-pointer group w-fit focus:outline-none"
            >
              <div className="flex text-[#C19A6B]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${star <= Math.round(product.rating) ? "fill-current" : "fill-none text-gray-300"
                      }`}
                  />
                ))}
              </div>
              <span className="text-[11px] uppercase tracking-widest text-gray-500 group-hover:text-[#154734] transition-colors">
                {product.numReviews > 0 ? (
                  <span className="underline decoration-gray-300 group-hover:decoration-[#154734] underline-offset-4">
                    {product.rating.toFixed(1)} · {product.numReviews} reseña{product.numReviews !== 1 ? "s" : ""}
                  </span>
                ) : (
                  "Sin calificaciones aún"
                )}
              </span>
            </button>

            {/* Social proof */}
            <div className="bg-[#FAFAFA] border border-gray-100 p-4 rounded-xl flex items-center gap-4 mb-8">
              <div className="flex -space-x-3 shrink-0">
                {[15, 16, 17].map((n) => (
                  <div key={n} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?img=${n}`} alt="" aria-hidden="true" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                <strong className="text-[#154734] font-semibold">Aleja, Mariana</strong> y{" "}
                <strong className="text-[#154734] font-semibold">800+ mujeres</strong> ya lucen esta prenda.
              </p>
            </div>

            {/* Addi */}
            <a
              href="https://co.addi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 mb-8 p-4 rounded-xl border border-gray-100 bg-white hover:border-[#2F6BFF]/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#2F6BFF] flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-white font-bold text-xl leading-none" style={{ fontFamily: "Arial, sans-serif" }}>a</span>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600 leading-snug">
                  Llévalo hoy, paga después con <strong className="text-[#2F6BFF]">Addi</strong> hasta en 6 cuotas.
                </p>
                <span className="inline-block text-[11px] text-[#2F6BFF] font-bold mt-1 uppercase tracking-wider group-hover:underline">
                  Conoce tu cupo aquí
                </span>
              </div>
            </a>

            {/* ── TABS: Producto principal + Subcategorías ──────────────── */}
            {product.isSet && product.items.length > 0 && (
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gray-400 mb-3">
                  Elige lo que quieres ver
                </p>
                <div className="flex flex-wrap gap-2">
                  {/* Tab del producto principal */}
                  <button
                    type="button"
                    onClick={() => handleViewSelect("main")}
                    className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200 ${activeView === "main"
                        ? "bg-[#154734] text-white border-[#154734] shadow-md shadow-[#154734]/20"
                        : "bg-white text-gray-700 border-gray-300 hover:border-[#154734] hover:text-[#154734]"
                      }`}
                  >
                    {product.name}
                    {product.stock === 0 && (
                      <span className="ml-2 text-[10px] font-normal opacity-60">(agotado)</span>
                    )}
                  </button>

                  {/* Tabs de subcategorías */}
                  {product.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleViewSelect(item.id)}
                      className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200 ${activeView === item.id
                          ? "bg-[#154734] text-white border-[#154734] shadow-md shadow-[#154734]/20"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#154734] hover:text-[#154734]"
                        }`}
                    >
                      {item.name}
                      {item.stock === 0 && (
                        <span className="ml-2 text-[10px] font-normal opacity-60">(agotado)</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Descripción — reactiva al tab activo */}
            <div className="prose prose-sm prose-gray mb-8">
              <p className="text-gray-600 leading-loose font-light">{activeDescription}</p>
            </div>

            {/* Selectores de color y talla */}
            <div className="space-y-8 mb-10">
              {activeColors.length > 0 && (
                <ColorSelector
                  colors={activeColors}
                  selected={selectedColor}
                  onSelect={handleColorSelect}
                />
              )}
              <SizeSelector
                availableSizes={selectedColor?.availableSizes ?? []}
                selectedSize={selectedSize}
                onSelect={setSelectedSize}
              />
            </div>

            {/* Acciones de compra */}
            <div className="flex flex-col gap-3 mb-10">
              <div className="flex gap-3">
                <QuantityPicker
                  quantity={quantity}
                  stock={activeStock}
                  onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
                  onIncrease={() => {
                    if (quantity < activeStock) setQuantity((prev) => prev + 1);
                  }}
                />
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize || activeStock === 0}
                  className={`flex-1 font-bold uppercase tracking-widest text-xs sm:text-sm rounded-lg transition-all h-14 duration-300 ${selectedSize && activeStock > 0
                      ? "bg-[#154734] hover:bg-[#0f3424] text-white shadow-lg shadow-[#154734]/20 hover:shadow-[#154734]/40 active:scale-[0.98]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  {activeStock === 0
                    ? "Producto Agotado"
                    : !selectedSize
                      ? "Selecciona una talla"
                      : showAddedNotification
                        ? "✓ Agregado"
                        : "Agregar a la Bolsa"}
                </button>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-[#C19A6B] hover:bg-[#b0885a] text-white font-bold py-4 rounded-lg text-center uppercase tracking-widest text-sm transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-[#C19A6B]/25 active:scale-[0.98]"
              >
                Comprar Ahora
              </Link>
            </div>

            {/* Métodos de pago */}
            <div className="flex flex-wrap justify-center gap-3 mb-10 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              {["GPay", "Apple", "PayPal", "Master", "Visa", "PSE"].map((item) => (
                <div key={item} className="h-8 px-3 bg-white border border-gray-200 rounded flex items-center justify-center">
                  <span className="text-[10px] font-bold text-gray-500">{item}</span>
                </div>
              ))}
            </div>

            {/* Acordeones */}
            <ProductAccordion
              openKey={openAccordion}
              onToggle={toggleAccordion}
              careInfo={product.careInfo}
              material={product.material}
            />
          </div>
        </div>

        {/* 1. Componente de Sección de Video en ProductClient.tsx */}

        {/* Video editorial — reactivo al tab activo */}
        {activeVideoUrl && (
          <div className="mt-24 sm:mt-32 mb-16 mx-4 sm:mx-6 lg:mx-8 xl:mx-12 relative bg-[#154734] border border-[#C19A6B]/20 rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_20px_50px_-15px_rgba(21,71,52,0.4)] overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 lg:gap-16 p-8 sm:p-12 lg:p-16 group isolate transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(21,71,52,0.5)]">

            {/* Decoración de fondo */}
            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{ backgroundImage: "radial-gradient(#C19A6B 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }}
            />
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#C19A6B]/20 to-transparent rounded-bl-full pointer-events-none -z-10 transition-transform duration-1000 group-hover:scale-110" />

            <div className="flex-1 text-center md:text-left z-10 w-full">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                <span className="h-px w-10 sm:w-12 bg-gradient-to-r from-transparent to-[#C19A6B]" />
                <span className="text-[10px] sm:text-xs font-black tracking-[0.4em] uppercase text-[#C19A6B] flex items-center gap-2 drop-shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Lookbook Exclusivo
                </span>
                <span className="h-px w-10 sm:w-12 bg-gradient-to-l from-transparent to-[#C19A6B] md:hidden" />
              </div>

              <h2
                className="text-4xl sm:text-5xl lg:text-6xl text-white mb-6 leading-[1.1] tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Movimiento <br />
                <span className="italic text-[#C19A6B]">&amp; Fluidez</span>
              </h2>

              <p className="text-gray-300 font-light leading-relaxed max-w-md mx-auto md:mx-0 text-sm sm:text-base border-l-2 border-[#C19A6B]/50 pl-4">
                Descubre cómo esta prenda se adapta a tu cuerpo. Diseñada para brindarte
                comodidad absoluta sin perder la elegancia en cada uno de tus pasos.
              </p>
            </div>

            {/* Contenedor del video con altura controlada para evitar desbordes visuales */}
            <div className="flex-1 w-full flex justify-center md:justify-end z-10">
              <div className="relative w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[320px] aspect-[3/4] sm:aspect-[4/5] max-h-[480px] bg-white rounded-[2rem] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.3)] border border-[#C19A6B]/30 transition-all duration-700 ease-in-out hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(193,154,107,0.25)] hover:border-[#C19A6B]/60">
                <ProductVideo url={activeVideoUrl} />
              </div>
            </div>

            <div className="absolute top-1/2 right-10 text-[180px] sm:text-[250px] lg:text-[300px] text-white/5 font-serif leading-none -translate-y-1/2 pointer-events-none select-none transition-transform duration-1000 group-hover:scale-105">
              C.V.
            </div>
          </div>
        )}

        {/* Secciones finales */}
        <div className="mt-24 space-y-24">
          <RecommendedProducts products={recommended} />
          <Testimonials comments={reviews} />
          <div id="seccion-resenas" className="scroll-mt-32">
            <ReviewsSection
              productId={product.id}
              productSlug={product.slug}
              rating={product.rating}
              numReviews={product.numReviews}
              existingReview={existingReview}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
