"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Check, ShoppingBag } from "lucide-react";

import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import { useCart } from "@/context/CartContext";

import { allVariants } from "./data";
import { ProductColor } from "./types";
import ProductGallery from "./components/ProductGallery";
import VariantSelector from "./components/VariantSelector";
import ColorSelector from "./components/ColorSelector";
import SizeSelector from "./components/SizeSelector";
import QuantityPicker from "./components/QuantityPicker";
import ProductAccordion from "./components/ProductAccordion";
import BenefitsSection from "./components/BenefitsSection";
import ReviewsSection from "./components/ReviewsSection";
import RecommendedProducts from "./components/RecommendedProducts";

import thumb1 from "@/assets/product-2.jpg";
import thumb2 from "@/assets/product-3.jpg";
import thumb3 from "@/assets/product-4.jpg";
import mainImage from "@/assets/product-1.jpg";
import Header from "@/components/layout/Header";

export default function ProductPage() {
  const [activeVariant, setActiveVariant] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(allVariants[0].colors[1]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const { addToCart } = useCart();
  const current = allVariants[activeVariant];

  const switchVariant = (index: number) => {
    if (index === activeVariant) return;
    setActiveVariant(index);
    setSelectedImage(0);
    setSelectedColor(allVariants[index].colors[0]);
    setSelectedSize(null);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart({ ...current, gallery: current.gallery }, quantity, selectedColor, selectedSize);
    setShowAddedNotification(true);
    setTimeout(() => setShowAddedNotification(false), 2000);
  };

  return (
    <div className="bg-background min-h-screen">
      <AnnouncementBar />
      <Header />

      {/* Toast */}
      <div
        className={`fixed top-4 right-4 z-200 flex items-center gap-3 bg-white border border-border shadow-lg rounded-lg px-4 py-3 transition-all duration-500 ${
          showAddedNotification
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-green-100 text-green-600 rounded-full p-1.5">
          <Check className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Producto agregado</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" /> Se añadió al carrito
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3 sm:py-4 text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
        <Link href="/" className="hover:text-foreground">INICIO</Link> /
        <Link href="/tienda" className="hover:text-foreground mx-1">TIENDA</Link> /
        <span className="text-foreground font-semibold ml-1">{current.name}</span>
      </div>

      <main className="container mx-auto px-4 pb-10 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16">

          <ProductGallery
            gallery={current.gallery}
            selectedImage={selectedImage}
            productName={current.name}
            onSelect={setSelectedImage}
          />

          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 uppercase tracking-wide">
              {current.name}
            </h1>

            <p className="text-lg sm:text-xl font-medium text-foreground mb-3 sm:mb-4">
              ${current.price.toLocaleString("es-CO")}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="flex text-[#c19a6b]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {current.reviews} reseña
              </span>
            </div>

            {/* Social proof */}
            <div className="bg-muted/30 p-2.5 sm:p-3 rounded-lg flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 border border-border/50">
              <div className="flex -space-x-2 shrink-0">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-300 border-2 border-background overflow-hidden relative"
                  />
                ))}
              </div>
              <p className="text-[10px] sm:text-xs text-foreground">
                <strong>Aleja, Mariana</strong> y{" "}
                <strong>800+ personas más</strong> están comprando nuestras prendas!
              </p>
            </div>

            {/* Addi widget */}
            <div className="flex items-center gap-3 mb-6 p-2.5 rounded-lg border border-gray-200 bg-[#F9FAFB]">
              <div className="w-8 h-8 rounded-full bg-[#2F6BFF] flex items-center justify-center shrink-0 shadow-sm">
                <span
                  className="text-white font-bold text-lg leading-none mt-0.5"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  a
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-snug">
                Paga con <span className="font-bold text-[#2F6BFF]">Addi</span> en{" "}
                <span className="font-bold text-gray-900">hasta 6 cuotas</span>.
                <a
                  href="https://co.addi.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 underline text-[#2F6BFF] hover:text-[#0041bd] transition-colors font-medium cursor-pointer"
                >
                  Pide un cupo
                </a>
              </p>
            </div>

            <VariantSelector
              variants={allVariants}
              activeIndex={activeVariant}
              currentType={current.type}
              onSelect={switchVariant}
            />

            <ColorSelector
              colors={current.colors}
              selected={selectedColor}
              onSelect={setSelectedColor}
            />

            <SizeSelector
              availableSizes={current.sizes}
              selectedSize={selectedSize}
              onSelect={setSelectedSize}
            />

            {/* Purchase actions */}
            <div className="flex flex-col gap-2.5 sm:gap-3 mb-6 sm:mb-8">
              <div className="flex gap-3 sm:gap-4">
                <QuantityPicker
                  quantity={quantity}
                  onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
                  onIncrease={() => setQuantity(quantity + 1)}
                />
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className={`flex-1 font-semibold uppercase tracking-wider text-xs sm:text-sm rounded transition-colors h-11 sm:h-12 active:scale-95 duration-100 ${
                    selectedSize
                      ? "bg-[#c19a6b] hover:bg-[#a88659] text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {!selectedSize
                    ? "Selecciona una talla"
                    : showAddedNotification
                    ? "✓ Agregado al carrito"
                    : "Agregar al carrito"}
                </button>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-[#c19a6b] hover:bg-[#a88659] text-white font-bold py-4 rounded text-center uppercase tracking-wider text-sm transition-colors shadow-sm"
              >
                Comprar ahora
              </Link>
            </div>

            {/* Payment icons */}
            <div className="flex justify-center gap-2 mb-6 sm:mb-8">
              {["GPay", "Apple", "PayPal", "Master", "Visa", "PSE"].map((item) => (
                <div
                  key={item}
                  className="h-6 w-10 sm:h-7 sm:w-12 bg-white border border-gray-200 rounded flex items-center justify-center shadow-sm"
                >
                  <span className="text-[6px] sm:text-[8px] font-bold text-gray-600">{item}</span>
                </div>
              ))}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
              {current.description}
            </p>

            <ProductAccordion
              openKey={openAccordion}
              onToggle={(key) => setOpenAccordion(openAccordion === key ? null : key)}
            />
          </div>
        </div>

        <BenefitsSection />
        <RecommendedProducts images={[thumb1, thumb2, thumb3, mainImage]} />
        <ReviewsSection rating={current.rating} reviewCount={current.reviews} />
      </main>

      <Footer />
    </div>
  );
}
