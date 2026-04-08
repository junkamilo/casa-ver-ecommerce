"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Star, Check, ShoppingBag, Sparkles, ChevronRight } from "lucide-react";

import { useCart } from "@/context/CartContext";
import ProductGallery from "./ProductGallery";
import ColorSelector from "./ColorSelector";
import SizeSelector from "./SizeSelector";
import QuantityPicker from "./QuantityPicker";
import ProductAccordion from "./ProductAccordion";
import ReviewsSection from "./ReviewsSection";
import RecommendedProducts from "./RecommendedProducts";
import ProductVideo from "./ProductVideo";
import PaymentCarousel, { PAYMENT_METHODS } from "./PaymentCarousel";
import Testimonials from "@/components/layout/Testimonials";

import BackButton from "@/components/ui/BackButton";
import { UIProduct, UIColor, ExistingReview } from "../types";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";
import { formatPrice } from "../constants";
import type { TestimonialItem } from "@/components/layout/Testimonials/types/types";

interface BuyerInfo {
  name: string;
  avatar: string | null;
}

interface Props {
  product: UIProduct;
  recommended: CollectionProduct[];
  existingReview: ExistingReview | null;
  isAuthenticated: boolean;
  reviews: TestimonialItem[];
  socialProof: { totalBuyers: number; recentBuyers: BuyerInfo[] };
}

const isVideoUrl = (url: string) => /\.(mp4|mov|avi|webm|mkv|ogg)$/i.test(url);

export default function ProductClient({
  product,
  recommended,
  existingReview,
  isAuthenticated,
  reviews,
  socialProof,
}: Props) {
  // ─── Estado principal ────────────────────────────────────────────────────
  const [selectedImage, setSelectedImage] = useState(0);
  const initialItem = product.isSet && product.items.length > 0 ? product.items[0] : null;
  const [selectedColor, setSelectedColor] = useState<UIColor | null>(
    initialItem ? (initialItem.colors[0] ?? null) : (product.colors[0] ?? null)
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [descOpen, setDescOpen] = useState(false);

  // 'main' = producto principal, cualquier otro string = item.id de subcategoría
  // Para conjuntos: arrancar directamente en la primera subcategoría
  const [activeView, setActiveView] = useState<string>(
    product.isSet && product.items.length > 0 ? product.items[0].id : "main"
  );

  const { addToCart, setBuyNow } = useCart();
  const router = useRouter();

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

  const buildCartProduct = () => {
    if (!selectedSize || !selectedColor) return null;
    const variant = selectedColor.variants.find((v) => v.size === selectedSize);
    const cartName = product.isSet && activeItem
      ? `${product.name} — ${activeItem.name}`
      : product.name;
    return {
      id: product.id,
      variantId: variant?.variantId ?? "",
      sku: variant?.sku ?? "",
      name: cartName,
      price: activePrice,
      gallery: galleryUrls,
      image: galleryUrls[0] ?? "",
    };
  };

  const handleAddToCart = () => {
    const cartProduct = buildCartProduct();
    if (!cartProduct || !selectedColor) return;
    addToCart(
      cartProduct,
      quantity,
      { name: selectedColor.name, hex: selectedColor.hex },
      selectedSize!
    );
    setShowAddedNotification(true);
    setTimeout(() => setShowAddedNotification(false), 2000);
  };

  const handleBuyNow = () => {
    const cartProduct = buildCartProduct();
    if (!cartProduct || !selectedColor) return;
    setBuyNow(
      cartProduct,
      quantity,
      { name: selectedColor.name, hex: selectedColor.hex },
      selectedSize!
    );
    router.push("/checkout");
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
        className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-100 flex items-center gap-3 sm:gap-4 bg-[#154734] text-white shadow-2xl rounded-xl px-4 sm:px-5 py-3 sm:py-4 transition-all duration-500 max-w-[calc(100vw-32px)] sm:max-w-none ${showAddedNotification ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8 pointer-events-none"
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-4 sm:pt-6">
        <BackButton />
      </div>

<main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-4 pb-12 sm:pt-8 sm:pb-16 lg:pt-12 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5 sm:gap-8 lg:gap-16 xl:gap-20">

          {/* Galería — sticky mientras scrolleas los detalles */}
          <div className="self-start lg:sticky lg:top-24 xl:top-28">
            <ProductGallery
              gallery={galleryUrls}
              videoUrl={activeVideoUrl}
              selectedImage={selectedImage}
              productName={product.name}
              onSelect={handleImageSelect}
              activeColorHex={selectedColor?.hex}
            />
          </div>

          {/* Detalles — scroll natural */}
          <div className="flex flex-col">

            {/* Nombre y Precio */}
            <div className="mb-4 sm:mb-5">
              {/* Badge de etiqueta */}
              {product.badge && (
                <span className={`inline-block mb-3 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-sm text-white ${
                  product.badge === "Nuevo Producto"
                    ? "bg-red-600"
                    : product.badge === "En Oferta"
                    ? "bg-[#C19A6B]"
                    : product.badge === "Nuevo y en Oferta"
                    ? "bg-[#154734]"
                    : "bg-[#8B1A1A]"
                }`}>
                  {product.badge}
                </span>
              )}
              <h1
                className="text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-light text-[#154734] mb-3 sm:mb-4 uppercase leading-tight tracking-tight text-center sm:text-left"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {product.name}
              </h1>
              {/* ── Precio / Antes / Stock — móvil ── */}
              <div className="flex sm:hidden items-stretch pt-1">
                {/* Precio */}
                <div className="flex flex-col flex-1 pr-4">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400 font-bold mb-1.5">Precio</span>
                  <p className="text-3xl font-medium text-gray-900 leading-none">
                    {formatPrice(activePrice)}
                  </p>
                </div>

                {/* Separador */}
                <div className="w-px bg-gray-200 shrink-0" />

                {/* Antes */}
                {product.comparePrice ? (
                  <>
                    <div className="flex flex-col flex-1 px-4">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400 font-bold mb-1.5">Antes</span>
                      <p className="text-3xl text-gray-300 line-through leading-none">
                        {formatPrice(product.comparePrice)}
                      </p>
                    </div>
                    <div className="w-px bg-gray-200 shrink-0" />
                  </>
                ) : (
                  <>
                    <div className="flex-1" />
                    <div className="w-px bg-gray-200 shrink-0" />
                  </>
                )}

                {/* Stock */}
                <div className="flex flex-col flex-1 pl-4">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400 font-bold mb-1.5">Stock</span>
                  {activeStock === 0 ? (
                    <p className="text-2xl font-semibold text-red-500 leading-none">Agotado</p>
                  ) : (
                    <p className="text-3xl font-medium text-gray-900 leading-none">{activeStock}</p>
                  )}
                </div>
              </div>

              {/* ── Precio / Stock — desktop (como estaba) ── */}
              <div className="hidden sm:block">
                <div className="flex items-end gap-3">
                  <p className="text-3xl font-medium text-gray-900">{formatPrice(activePrice)}</p>
                  {product.comparePrice && (
                    <p className="text-base text-gray-400 line-through mb-1">{formatPrice(product.comparePrice)}</p>
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
            </div>

            {/* Rating */}
            <button
              type="button"
              onClick={scrollToReviews}
              className="flex flex-col items-center sm:items-start sm:flex-row sm:gap-3 mb-5 sm:mb-8 cursor-pointer group w-full sm:w-fit focus:outline-none"
            >
              <div className="flex gap-1 text-[#C19A6B]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:scale-110 ${
                      star <= Math.round(product.rating) ? "fill-current" : "fill-none text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="mt-1.5 sm:mt-0 text-sm sm:text-[11px] uppercase tracking-widest text-gray-500 group-hover:text-[#154734] transition-colors text-center sm:text-left">
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
            {socialProof.totalBuyers > 0 && (
              <div className="bg-[#FAFAFA] border border-gray-100 p-3 sm:p-4 rounded-xl flex items-center gap-3 sm:gap-4 mb-5 sm:mb-8">
                <div className="flex -space-x-3 shrink-0">
                  {socialProof.recentBuyers.map((buyer, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-[#154734]/10 border-2 border-white overflow-hidden shadow-sm flex items-center justify-center">
                      {buyer.avatar ? (
                        <img src={buyer.avatar} alt="" aria-hidden="true" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-[#154734]">{buyer.name[0]}</span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-light">
                  {socialProof.recentBuyers.length >= 2 ? (
                    <>
                      <strong className="text-[#154734] font-semibold">
                        {socialProof.recentBuyers[0].name}, {socialProof.recentBuyers[1].name}
                      </strong>{" "}
                      y{" "}
                    </>
                  ) : socialProof.recentBuyers.length === 1 ? (
                    <><strong className="text-[#154734] font-semibold">{socialProof.recentBuyers[0].name}</strong> y </>
                  ) : null}
                  <strong className="text-[#154734] font-semibold">
                    {socialProof.totalBuyers > 3 ? `${socialProof.totalBuyers}+ personas` : `${socialProof.totalBuyers} persona${socialProof.totalBuyers !== 1 ? "s" : ""}`}
                  </strong>{" "}
                  ya lucen esta prenda.
                </p>
              </div>
            )}

            {/* Addi */}
            <a
              href="https://co.addi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-8 p-3 sm:p-4 rounded-xl border border-gray-100 bg-white hover:border-[#2F6BFF]/30 transition-all duration-300 group"
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
              <div className="mb-5 sm:mb-8">
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gray-400 mb-3">
                  Elige lo que quieres ver
                </p>
                <div className="flex flex-wrap gap-2">
                  {/* Solo tabs de subcategorías — el padre no se muestra */}
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

            {/* Descripción — desplegable */}
            <div className="mb-5 sm:mb-8 border border-gray-100 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setDescOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#FAFAFA] hover:bg-[#f4f4f4] transition-colors duration-200 focus:outline-none"
              >
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#154734]">Descripción</span>
                <ChevronRight
                  className={`w-4 h-4 text-[#154734] transition-transform duration-300 ${descOpen ? "rotate-90" : ""}`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${descOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <p className="px-4 py-3 text-gray-600 leading-relaxed font-light text-sm border-t border-gray-100">
                    {activeDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Selectores de color y talla */}
            <div className="space-y-5 sm:space-y-8 mb-7 sm:mb-10">
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
            <div className="flex flex-col gap-3 mb-7 sm:mb-10">
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

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!selectedSize || activeStock === 0}
                className={`w-full font-bold py-4 rounded-lg uppercase tracking-widest text-sm transition-all duration-300 ${
                  selectedSize && activeStock > 0
                    ? "bg-[#C19A6B] hover:bg-[#b0885a] text-white shadow-md hover:shadow-xl hover:shadow-[#C19A6B]/25 active:scale-[0.98]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {activeStock === 0 ? "Producto Agotado" : !selectedSize ? "Selecciona una talla" : "Comprar Ahora"}
              </button>
            </div>

            {/* Métodos de pago — móvil: carrusel animado / desktop: grid estático */}
            <div className="sm:hidden">
              <PaymentCarousel />
            </div>
            <div className="hidden sm:flex flex-wrap justify-center gap-3 mb-7 sm:mb-10">
              {PAYMENT_METHODS.map(({ id, label, Logo }) => (
                <div
                  key={id}
                  aria-label={label}
                  className="flex items-center justify-center h-11 px-4 bg-white border border-gray-100 rounded-xl shadow-sm"
                >
                  <Logo />
                </div>
              ))}
            </div>

            {/* Acordeones */}
            <ProductAccordion
              openKey={openAccordion}
              onToggle={toggleAccordion}
            />
          </div>
        </div>

        {/* 1. Componente de Sección de Video en ProductClient.tsx */}

        {/* Video editorial — reactivo al tab activo */}
        {activeVideoUrl && (
          <div className="mt-12 sm:mt-24 md:mt-32 mb-10 sm:mb-16 mx-3 sm:mx-6 lg:mx-8 xl:mx-12 relative bg-[#154734] border border-[#C19A6B]/20 rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] shadow-[0_20px_50px_-15px_rgba(21,71,52,0.4)] overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-10 lg:gap-16 p-6 sm:p-10 lg:p-16 group isolate transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(21,71,52,0.5)]">

            {/* Decoración de fondo */}
            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{ backgroundImage: "radial-gradient(#C19A6B 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }}
            />
            <div className="absolute top-0 right-0 w-72 h-72 bg-linear-to-bl from-[#C19A6B]/20 to-transparent rounded-bl-full pointer-events-none -z-10 transition-transform duration-1000 group-hover:scale-110" />

            {/* Video — arriba en móvil, derecha en desktop */}
            <div className="shrink-0 flex justify-center sm:order-last sm:justify-end z-10 w-full sm:w-auto">
              <div className="relative w-[55vw] max-w-55 sm:w-60 md:w-70 lg:w-[320px] aspect-3/4 sm:aspect-4/5 bg-white rounded-2xl sm:rounded-4xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.3)] border border-[#C19A6B]/30 transition-all duration-700 ease-in-out hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(193,154,107,0.25)] hover:border-[#C19A6B]/60">
                <ProductVideo url={activeVideoUrl} />
              </div>
            </div>

            {/* Texto — debajo del video en móvil, izquierda en desktop */}
            <div className="flex-1 min-w-0 text-center sm:text-left z-10 w-full sm:w-auto">

              {/* Etiqueta con separadores */}
              <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <span className="h-px w-8 sm:w-12 bg-linear-to-r from-transparent to-[#C19A6B]" />
                <span className="text-[9px] sm:text-xs font-black tracking-[0.3em] sm:tracking-[0.4em] uppercase text-[#C19A6B] flex items-center gap-1.5 sm:gap-2 drop-shadow-sm">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Lookbook Exclusivo
                </span>
                <span className="h-px w-8 sm:hidden bg-linear-to-l from-transparent to-[#C19A6B]" />
              </div>

              <h2
                className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl text-white mb-3 sm:mb-6 leading-[1.1] tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Movimiento <br />
                <span className="italic text-[#C19A6B]">&amp; Fluidez</span>
              </h2>

              {/* Descripción — oculta en móvil */}
              <p className="hidden sm:block text-gray-300 font-light leading-relaxed max-w-md text-sm sm:text-base border-l-2 border-[#C19A6B]/50 pl-4">
                Descubre cómo esta prenda se adapta a tu cuerpo. Diseñada para brindarte
                comodidad absoluta sin perder la elegancia en cada uno de tus pasos.
              </p>
            </div>

            {/* Texto decorativo — oculto en móvil */}
            <div className="hidden sm:block absolute top-1/2 right-10 text-[250px] lg:text-[300px] text-white/5 font-serif leading-none -translate-y-1/2 pointer-events-none select-none transition-transform duration-1000 group-hover:scale-105">
              C.V.
            </div>
          </div>
        )}

        {/* Secciones finales */}
        <div className="mt-8 sm:mt-24 space-y-10 sm:space-y-24">
          <RecommendedProducts products={recommended} />
          <Testimonials comments={reviews} />
          <div id="seccion-resenas" className="scroll-mt-32">
            <ReviewsSection
              productId={product.id}
              rating={product.rating}
              numReviews={product.numReviews}
              existingReview={existingReview}
              isAuthenticated={isAuthenticated}
              reviews={reviews}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
