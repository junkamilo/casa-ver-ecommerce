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
import BenefitsSection from "./BenefitsSection";
import ReviewsSection from "./ReviewsSection";
import RecommendedProducts from "./RecommendedProducts";
import ProductVideo from "./ProductVideo";

import { UIProduct, UIColor, RecommendedProduct } from "../types";
import { formatPrice } from "../constants";

interface ExistingReview {
  rating: number;
  comment: string | null;
}

interface Props {
  product: UIProduct;
  recommended: RecommendedProduct[];
  existingReview: ExistingReview | null;
  isAuthenticated: boolean;
}

export default function ProductClient({
  product,
  recommended,
  existingReview,
  isAuthenticated,
}: Props) {
  // 1. ESTADOS PRINCIPALES
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<UIColor | null>(
    product.colors[0] ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const { addToCart } = useCart();

  // 🔥 2. LÓGICA DE SINCRONIZACIÓN BIDIRECCIONAL 🔥

  const isVideoUrl = (url: string) => /\.(mp4|mov|avi|webm|mkv|ogg)$/i.test(url);

  // A. Creamos la Galería Maestra (Junta todas las fotos y recuerda su color)
  const masterGallery = useMemo(() => {
    const items: { url: string; color: UIColor | null }[] = [];

    // Solo imágenes generales (sin videos)
    product.generalImages
      .filter((url) => !isVideoUrl(url))
      .forEach((url) => items.push({ url, color: null }));

    // Solo imágenes de color (sin videos)
    product.colors.forEach((color) => {
      color.images
        .filter((url) => !isVideoUrl(url))
        .forEach((url) => items.push({ url, color }));
    });

    return items;
  }, [product]);

  // Extraemos solo las URLs para pasárselas a tu componente ProductGallery
  const galleryUrls = masterGallery.map(item => item.url);

  // B. Cuando el usuario hace clic en una bolita de COLOR
  const handleColorSelect = (color: UIColor) => {
    setSelectedColor(color);
    setSelectedSize(null); // Reiniciamos la talla por precaución de stock

    // Buscamos la primera foto de este color en la galería maestra
    const firstImageIndex = masterGallery.findIndex(item => item.color?.id === color.id);
    if (firstImageIndex !== -1) {
      setSelectedImage(firstImageIndex); // Movemos el carrusel a esa foto
    }
  };

  // C. Cuando el usuario hace clic en una miniatura de la GALERÍA
  const handleImageSelect = (index: number) => {
    setSelectedImage(index);
    
    // Vemos de qué color es la foto que seleccionó
    const associatedColor = masterGallery[index].color;
    
    // Si la foto tiene un color y es distinto al actual, cambiamos el selector de color automáticamente
    if (associatedColor && associatedColor.id !== selectedColor?.id) {
      setSelectedColor(associatedColor);
      setSelectedSize(null); 
    }
  };

  // 3. FUNCIONES DE INTERACCIÓN
  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    
    addToCart(
      {
        name: product.name,
        price: product.basePrice,
        gallery: galleryUrls,
        image: galleryUrls[0] ?? "",
      },
      quantity,
      { name: selectedColor.name, hex: selectedColor.hex },
      selectedSize
    );
    
    setShowAddedNotification(true);
    setTimeout(() => setShowAddedNotification(false), 2000);
  };

  const scrollToReviews = () => {
    const reviewsSection = document.getElementById("seccion-resenas");
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  return (
    <div className="bg-white selection:bg-[#C19A6B]/20 min-h-screen">

      {/* Toast — Añadido a la bolsa */}
      <div
        aria-live="polite"
        className={`fixed top-6 right-6 z-100 flex items-center gap-4 bg-[#154734] text-white shadow-2xl rounded-xl px-5 py-4 transition-all duration-500 ${
          showAddedNotification
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-8 pointer-events-none"
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

      {/* Breadcrumb editorial */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-4 text-[10px] sm:text-xs text-gray-400 uppercase tracking-[0.2em] font-medium flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link href="/" className="hover:text-[#C19A6B] transition-colors shrink-0">
            Inicio
          </Link>
          <span className="text-gray-300">/</span>
          <Link href="/tienda" className="hover:text-[#C19A6B] transition-colors shrink-0">
            Tienda
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-[#154734] font-bold shrink-0">{product.name}</span>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-8 pb-16 sm:pt-12 sm:pb-24 lg:pb-32">

        {/* Layout 60/40 */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 xl:gap-20 items-start">

          {/* Galería — 60% */}
          <div className="w-full lg:w-[60%]">
            <ProductGallery
              gallery={galleryUrls}
              selectedImage={selectedImage}
              productName={product.name}
              onSelect={handleImageSelect} // Pasamos la función que detecta el color
            />
          </div>

          {/* Detalles — 40% sticky */}
          <div className="w-full lg:w-[40%] flex flex-col lg:sticky lg:top-24 xl:top-28">

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
                  {formatPrice(product.basePrice)}
                </p>
                {product.comparePrice && (
                  <p className="text-base text-gray-400 line-through mb-1">
                    {formatPrice(product.comparePrice)}
                  </p>
                )}
              </div>
              {product.stock === 0 ? (
                <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mt-2">
                  Agotado
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-2">
                  Stock disponible:{" "}
                  <span className="font-semibold text-gray-600">{product.stock}</span>
                </p>
              )}
            </div>

            {/* Rating clickeable */}
            <button
              type="button"
              onClick={scrollToReviews}
              className="flex items-center gap-3 mb-8 cursor-pointer group w-fit focus:outline-none"
            >
              <div className="flex text-[#C19A6B]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                      star <= Math.round(product.rating)
                        ? "fill-current"
                        : "fill-none text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] uppercase tracking-widest text-gray-500 group-hover:text-[#154734] transition-colors">
                {product.numReviews > 0 ? (
                  <span className="underline decoration-gray-300 group-hover:decoration-[#154734] underline-offset-4">
                    {product.rating.toFixed(1)} · {product.numReviews} reseña
                    {product.numReviews !== 1 ? "s" : ""}
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
                  <div
                    key={n}
                    className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white overflow-hidden shadow-sm"
                  >
                    <img
                      src={`https://i.pravatar.cc/100?img=${n}`}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-light">
                <strong className="text-[#154734] font-semibold">Aleja, Mariana</strong> y{" "}
                <strong className="text-[#154734] font-semibold">800+ mujeres</strong> ya
                lucen esta prenda.
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
                <span
                  className="text-white font-bold text-xl leading-none"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  a
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600 leading-snug">
                  Llévalo hoy, paga después con{" "}
                  <strong className="text-[#2F6BFF]">Addi</strong> hasta en 6 cuotas.
                </p>
                <span className="inline-block text-[11px] text-[#2F6BFF] font-bold mt-1 uppercase tracking-wider group-hover:underline">
                  Conoce tu cupo aquí
                </span>
              </div>
            </a>

            {/* Descripción */}
            <div className="prose prose-sm prose-gray mb-10">
              <p className="text-gray-600 leading-loose font-light">{product.description}</p>
            </div>

            {/* Selectores */}
            <div className="space-y-8 mb-10">
              {product.colors.length > 0 && (
                <ColorSelector
                  colors={product.colors}
                  selected={selectedColor}
                  onSelect={handleColorSelect} // Pasamos la función que detecta la galería
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
                  stock={product.stock}
                  onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
                  onIncrease={() => {
                    if (quantity < product.stock) setQuantity((prev) => prev + 1);
                  }}
                />
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize || product.stock === 0}
                  className={`flex-1 font-bold uppercase tracking-widest text-xs sm:text-sm rounded-lg transition-all h-14 duration-300 ${
                    selectedSize && product.stock > 0
                      ? "bg-[#154734] hover:bg-[#0f3424] text-white shadow-lg shadow-[#154734]/20 hover:shadow-[#154734]/40 active:scale-[0.98]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {product.stock === 0
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
                <div
                  key={item}
                  className="h-8 px-3 bg-white border border-gray-200 rounded flex items-center justify-center"
                >
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

        {/* Sección de video editorial */}
        {product.videoUrl && (
          <div className="mt-24 sm:mt-32 mb-16">
            <div className="flex items-center justify-center mb-10 gap-4">
              <span className="h-px w-16 bg-linear-to-r from-transparent to-[#C19A6B]" />
              <span className="text-xs font-black tracking-[0.4em] uppercase text-[#C19A6B] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Lookbook
              </span>
              <span className="h-px w-16 bg-linear-to-l from-transparent to-[#C19A6B]" />
            </div>

            <div className="relative bg-[#FAFAFA] border border-[#C19A6B]/10 rounded-4xl p-8 sm:p-16 flex flex-col md:flex-row items-center gap-12 lg:gap-24 overflow-hidden">
              <div className="flex-1 text-center md:text-left z-10">
                <h2
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-[#154734] mb-6 leading-[1.1] tracking-tight"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Movimiento <br />
                  <span className="italic text-[#C19A6B]">&amp; Fluidez</span>
                </h2>
                <p className="text-gray-500 font-light leading-relaxed max-w-md mx-auto md:mx-0 text-base sm:text-lg">
                  Descubre cómo esta prenda se adapta a tu cuerpo. Diseñada para brindarte
                  comodidad absoluta sin perder la elegancia en cada uno de tus pasos.
                </p>
              </div>

              <div className="flex-1 w-full flex justify-center md:justify-end z-10">
                <div className="w-full max-w-[320px] xl:max-w-90 aspect-9/16 bg-gray-100 rounded-2xl overflow-hidden shadow-2xl border-4 border-white transition-transform duration-700 hover:scale-[1.02]">
                  <ProductVideo url={product.videoUrl} />
                </div>
              </div>

              <div className="absolute top-1/2 right-0 text-[200px] text-[#154734]/2 font-serif leading-none -translate-y-1/2 pointer-events-none select-none">
                C.V.
              </div>
            </div>
          </div>
        )}

        {/* Secciones finales */}
        <div className="mt-24 space-y-24">
          <BenefitsSection />
          <RecommendedProducts products={recommended} />
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