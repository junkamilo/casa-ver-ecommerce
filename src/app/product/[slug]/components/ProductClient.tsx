"use client";

import { useState } from "react";
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

interface Props {
  product: UIProduct;
  recommended: RecommendedProduct[];
}

export default function ProductClient({ product, recommended }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<UIColor | null>(
    product.colors[0] ?? null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const { addToCart } = useCart();

  const gallery =
    selectedColor && selectedColor.images.length > 0
      ? selectedColor.images
      : product.generalImages;

  const handleColorSelect = (color: UIColor) => {
    setSelectedColor(color);
    setSelectedImage(0);
    setSelectedSize(null);
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    addToCart(
      {
        name: product.name,
        price: product.basePrice,
        gallery,
        image: gallery[0] ?? "",
      },
      quantity,
      { name: selectedColor.name, hex: selectedColor.hex },
      selectedSize
    );
    setShowAddedNotification(true);
    setTimeout(() => setShowAddedNotification(false), 2000);
  };

  return (
    <div className="bg-white selection:bg-[#C19A6B]/20">
      {/* Toast Notificación Premium */}
      <div
        className={`fixed top-6 right-6 z-[100] flex items-center gap-4 bg-[#154734] text-white shadow-2xl rounded-xl px-5 py-4 transition-all duration-500 transform ${
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
            <ShoppingBag className="w-3.5 h-3.5" /> {product.name}
          </p>
        </div>
      </div>

      {/* Breadcrumb Editorial */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-[10px] sm:text-xs text-gray-400 uppercase tracking-[0.2em] font-medium">
          <Link href="/" className="hover:text-[#C19A6B] transition-colors">INICIO</Link> 
          <span className="mx-2 text-gray-300">/</span>
          <Link href="/tienda" className="hover:text-[#C19A6B] transition-colors">TIENDA</Link> 
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-[#154734] font-bold">{product.name}</span>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pt-12 sm:pb-24">
        {/* Layout Principal: 60% Galería / 40% Info en Desktop */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          
          {/* LADO IZQUIERDO: Galería */}
          <div className="w-full lg:w-[60%]">
            <ProductGallery
              gallery={gallery}
              selectedImage={selectedImage}
              productName={product.name}
              onSelect={setSelectedImage}
            />
          </div>

          {/* LADO DERECHO: Detalles (Sticky) */}
          <div className="w-full lg:w-[40%] flex flex-col lg:sticky lg:top-24">
            
            {/* Título y Precio */}
            <div className="mb-6">
              <h1 
                className="text-3xl sm:text-4xl lg:text-5xl font-light text-[#154734] mb-3 uppercase leading-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {product.name}
              </h1>
              
              <div className="flex items-end gap-3">
                <p className="text-2xl sm:text-3xl font-medium text-gray-900">
                  ${product.basePrice.toLocaleString("es-CO")}
                </p>
                {product.comparePrice && (
                  <p className="text-base text-gray-400 line-through mb-1">
                    ${product.comparePrice.toLocaleString("es-CO")}
                  </p>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex text-[#C19A6B]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs uppercase tracking-widest text-gray-500">Excepcional</span>
            </div>

            {/* Social Proof (Diseño refinado) */}
            <div className="bg-[#FAFAFA] border border-[#C19A6B]/20 p-4 rounded-xl flex items-center gap-3 mb-6">
              <div className="flex -space-x-2 shrink-0">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white overflow-hidden"
                  >
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong className="text-[#154734] font-semibold">Aleja, Mariana</strong> y{" "}
                <strong className="text-[#154734] font-semibold">800+ mujeres</strong> ya lucen esta prenda.
              </p>
            </div>

            {/* Addi Widget (Elegante) */}
            <div className="flex items-center gap-3 mb-8 p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#2F6BFF] flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xl leading-none" style={{ fontFamily: "Arial, sans-serif" }}>a</span>
              </div>
              <p className="text-sm text-gray-600 leading-snug">
                Llévalo hoy, paga después con <strong className="text-[#2F6BFF]">Addi</strong> hasta en 6 cuotas.
                <a href="https://co.addi.com/" target="_blank" rel="noopener noreferrer" className="block text-[#2F6BFF] hover:underline font-semibold mt-0.5">
                  Conoce tu cupo aquí
                </a>
              </p>
            </div>

            {/* Selectores */}
            <div className="space-y-6 mb-8">
              {product.colors.length > 0 && (
                <ColorSelector
                  colors={product.colors}
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

            {/* Acciones de Compra */}
            <div className="flex flex-col gap-3 mb-8">
              <div className="flex gap-3">
                <QuantityPicker
                  quantity={quantity}
                  onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
                  onIncrease={() => setQuantity(quantity + 1)}
                />
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className={`flex-1 font-bold uppercase tracking-widest text-xs sm:text-sm rounded-lg transition-all h-14 duration-300 ${
                    selectedSize
                      ? "bg-[#154734] hover:bg-[#103a2a] text-white shadow-lg hover:shadow-[#154734]/30"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {!selectedSize
                    ? "Selecciona Talla"
                    : showAddedNotification
                    ? "✓ Agregado"
                    : "Agregar a la Bolsa"}
                </button>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-[#C19A6B] hover:bg-[#a88659] text-white font-bold py-4 rounded-lg text-center uppercase tracking-widest text-sm transition-all shadow-md"
              >
                Comprar Ahora
              </Link>
            </div>

            {/* Métodos de Pago */}
            <div className="flex justify-center gap-3 mb-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {["GPay", "Apple", "PayPal", "Master", "Visa", "PSE"].map((item) => (
                <div key={item} className="h-8 w-12 bg-white border border-gray-200 rounded flex items-center justify-center">
                  <span className="text-[9px] font-bold text-gray-500">{item}</span>
                </div>
              ))}
            </div>

            {/* Descripción y Acordeones */}
            <div className="prose prose-sm prose-gray mb-8">
              <p className="text-gray-600 leading-loose font-light">
                {product.description}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-2">
              <ProductAccordion
                openKey={openAccordion}
                onToggle={(key) => setOpenAccordion(openAccordion === key ? null : key)}
                careInfo={product.careInfo}
                material={product.material}
              />
            </div>

          </div>
        </div>

        {/* 🔥 SECCIÓN DE VIDEO EDITORIAL (La gran innovación) 🔥 */}
        {product.videoUrl && (
          <div className="mt-24 sm:mt-32 mb-16">
            <div className="flex items-center justify-center mb-8 gap-4">
              <span className="h-px w-12 bg-[#C19A6B]" />
              <span className="text-xs font-black tracking-[0.4em] uppercase text-[#C19A6B] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Lookbook
              </span>
              <span className="h-px w-12 bg-[#C19A6B]" />
            </div>

            <div className="relative bg-[#FAFAFA] border border-[#C19A6B]/20 rounded-3xl p-8 sm:p-16 flex flex-col md:flex-row items-center gap-10 lg:gap-20 overflow-hidden">
              {/* Texto del Video */}
              <div className="flex-1 text-center md:text-left z-10">
                <h2 
                  className="text-4xl sm:text-5xl lg:text-6xl text-[#154734] mb-6 leading-tight"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Movimiento <br/> <span className="italic text-[#C19A6B]">& Fluidez</span>
                </h2>
                <p className="text-gray-500 font-light leading-relaxed max-w-md mx-auto md:mx-0">
                  Descubre cómo esta prenda se adapta a tu cuerpo. Diseñada para brindarte comodidad absoluta sin perder la elegancia en cada uno de tus pasos.
                </p>
              </div>

              {/* Contenedor estricto para forzar el video vertical */}
              <div className="flex-1 w-full flex justify-center md:justify-end z-10">
                <div className="w-full max-w-[340px] aspect-[9/16] bg-gray-100 rounded-2xl overflow-hidden shadow-2xl relative border-4 border-white">
                  <ProductVideo url={product.videoUrl} />
                </div>
              </div>

              {/* Decoración de fondo */}
              <div className="absolute top-0 right-0 text-[200px] text-[#154734]/[0.02] font-serif leading-none -translate-y-1/4 pointer-events-none">
                C.V.
              </div>
            </div>
          </div>
        )}

        {/* Secciones Finales */}
        <div className="mt-24 space-y-24">
          <BenefitsSection />
          <RecommendedProducts products={recommended} />
          <ReviewsSection rating={5} reviewCount={1} />
        </div>

      </main>
    </div>
  );
}
