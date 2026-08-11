"use client";

import Image from "next/image";
import LogoAddi from "@/assets/LogoAddi2.png";
import { getProductBadgeClassName } from "@/lib/productBadge";

import ProductGallery from "./ProductGallery";
import ColorSelector from "./ColorSelector";
import SizeSelector from "./SizeSelector";
import QuantityPicker from "./QuantityPicker";
import ProductAccordion from "./ProductAccordion";
import ProductDescriptionContent from "./ProductDescriptionContent";
import ReviewsSection from "./ReviewsSection";
import RecommendedProducts from "./RecommendedProducts";
import ProductVideo from "./ProductVideo";
import PaymentCarousel, { PAYMENT_METHODS } from "./PaymentCarousel";
import BackButton from "@/components/ui/BackButton";
import { Toast } from "./Toast";

import type { ProductClientProps } from "../types";
import { formatPrice } from "../constants";
import { useProductClient } from "../hooks/useProductClient";

export default function ProductClient({
  product,
  recommended,
  existingReview,
  isAuthenticated,
  reviews,
  socialProof,
  initialItemId,
}: ProductClientProps) {
  const {
    selectedImage,
    selectedColor,
    quantity,
    setQuantity,
    selectedSize,
    setSelectedSize,
    showAddedNotification,
    openAccordion,
    activeView,
    activeItem,
    activeColors,
    activeVideoUrl,
    activePrice,
    activeComparePrice,
    activeStock,
    activeDescription,
    galleryUrls,
    handleViewSelect,
    handleColorSelect,
    handleImageSelect,
    handleAddToCart,
    handleBuyNow,
    toggleAccordion,
  } = useProductClient(product, initialItemId);

  return (
    <div className="bg-white selection:bg-[#C19A6B]/20 min-h-screen">

      <Toast show={showAddedNotification} productName={product.name} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-4 sm:pt-6">
        <BackButton />
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-4 pb-12 sm:pt-8 sm:pb-16 lg:pt-12 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5 sm:gap-8 lg:gap-16 xl:gap-20">

          {/* Galería — sticky mientras scrolleas los detalles */}
          <div className="self-start lg:sticky lg:top-24 xl:top-28">
            <ProductGallery
              gallery={galleryUrls}
              selectedImage={selectedImage}
              productName={product.name}
              onSelect={handleImageSelect}
              activeColorHex={selectedColor?.hex}
              isColorOutOfStock={selectedColor?.isOutOfStock ?? false}
            />
          </div>

          {/* Detalles — scroll natural */}
          <div className="flex flex-col">

            {/* Nombre y Precio */}
            <div className="mb-4 sm:mb-5">
              {product.badge && (
                <span className={`inline-block mb-3 shadow-sm ${getProductBadgeClassName(product.badge)}`}>
                  {product.badge}
                </span>
              )}
              <h1
                className="text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-light text-[#154734] mb-3 sm:mb-4 uppercase leading-tight tracking-tight text-center sm:text-left"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {product.name}
              </h1>

              {/* Banner prenda completamente agotada */}
              {product.stock === 0 && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-3">
                  <span className="shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
                      Prenda Agotada
                    </p>
                    <p className="text-[10px] text-red-400 font-light mt-0.5">
                      Todos los colores y tallas están agotados. Puedes explorar los colores disponibles.
                    </p>
                  </div>
                </div>
              )}

              {/* Precio / Antes — móvil */}
              <div className="flex sm:hidden items-stretch pt-1">
                <div className="flex flex-col flex-1 pr-4">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400 font-bold mb-1.5">Precio</span>
                  <p className="text-3xl font-medium text-gray-900 leading-none">
                    {formatPrice(activePrice)}
                  </p>
                </div>

                {activeComparePrice && (
                  <>
                    <div className="w-px bg-gray-200 shrink-0" />
                    <div className="flex flex-col flex-1 px-4">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400 font-bold mb-1.5">Antes</span>
                      <p className="text-3xl text-gray-300 line-through leading-none">
                        {formatPrice(activeComparePrice)}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Precio — desktop */}
              <div className="hidden sm:block">
                <div className="flex items-end gap-3">
                  <p className="text-3xl font-medium text-gray-900">{formatPrice(activePrice)}</p>
                  {activeComparePrice && (
                    <p className="text-base text-gray-400 line-through mb-1">{formatPrice(activeComparePrice)}</p>
                  )}
                </div>
                {activeStock === 0 && (
                  <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mt-2">Agotado</p>
                )}
              </div>
            </div>

            {/* Social proof */}
            {socialProof.totalBuyers > 0 && (
              <div className="bg-[#FAFAFA] border border-gray-100 p-3 sm:p-4 rounded-xl flex items-center gap-3 sm:gap-4 mb-5 sm:mb-8">
                <div className="flex -space-x-3 shrink-0">
                  {socialProof.recentBuyers.map((buyer, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-[#154734]/10 border-2 border-white overflow-hidden shadow-sm flex items-center justify-center">
                      {buyer.avatar ? (
                        <Image src={buyer.avatar} alt="" aria-hidden="true" width={32} height={32} className="w-full h-full object-cover" />
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
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                <Image src={LogoAddi} alt="Addi" className="w-full h-full object-cover" />
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

            {/* TABS: Subcategorías */}
            {product.isSet && product.items.length > 0 && (
              <div className="mb-5 sm:mb-8">
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gray-400 mb-3">
                  Elige lo que quieres ver
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleViewSelect(item.id)}
                      className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200 ${
                        activeView === item.id
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
                  className={`flex-1 font-bold uppercase tracking-widest text-xs sm:text-sm rounded-lg transition-all h-14 duration-300 ${
                    selectedSize && activeStock > 0
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

            {/* Métodos de pago — móvil: carrusel / desktop: grid */}
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
              description={activeDescription}
            />
          </div>
        </div>

        {/* Video editorial — reactivo al tab activo */}
        {activeVideoUrl && (
          <div className="mt-12 sm:mt-24 md:mt-32 mb-10 sm:mb-16 mx-3 sm:mx-6 lg:mx-8 xl:mx-12 relative bg-[#154734] border border-[#C19A6B]/20 rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] shadow-[0_20px_50px_-15px_rgba(21,71,52,0.4)] overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-10 lg:gap-16 p-6 sm:p-10 lg:p-16 group isolate transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(21,71,52,0.5)]">

            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{ backgroundImage: "radial-gradient(#C19A6B 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }}
            />
            <div className="absolute top-0 right-0 w-72 h-72 bg-linear-to-bl from-[#C19A6B]/20 to-transparent rounded-bl-full pointer-events-none -z-10 transition-transform duration-1000 group-hover:scale-110" />

            <div className="shrink-0 flex justify-center sm:order-last sm:justify-end z-10 w-full sm:w-auto">
              <div className="relative w-[55vw] max-w-55 sm:w-60 md:w-70 lg:w-[320px] aspect-3/4 sm:aspect-4/5 bg-white rounded-2xl sm:rounded-4xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.3)] border border-[#C19A6B]/30 transition-all duration-700 ease-in-out hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(193,154,107,0.25)] hover:border-[#C19A6B]/60">
                <ProductVideo url={activeVideoUrl} />
              </div>
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left z-10 w-full sm:w-auto">
              <h2
                className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-white mb-3 sm:mb-6 leading-[1.1] tracking-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {activeItem ? activeItem.name : product.name}
              </h2>

              {activeDescription && (
                <div className="hidden sm:block max-w-md text-sm sm:text-base border-l-2 border-[#C19A6B]/50 pl-4">
                  <ProductDescriptionContent
                    description={activeDescription}
                    className="text-gray-300 font-light"
                  />
                </div>
              )}
            </div>

            <div className="hidden sm:block absolute top-1/2 right-10 text-[250px] lg:text-[300px] text-white/5 font-serif leading-none -translate-y-1/2 pointer-events-none select-none transition-transform duration-1000 group-hover:scale-105">
              C.V.
            </div>
          </div>
        )}

        {/* Secciones finales */}
        <div className="mt-8 sm:mt-24 space-y-10 sm:space-y-24">
          <RecommendedProducts products={recommended} />
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
