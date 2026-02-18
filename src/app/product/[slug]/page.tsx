"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star, Minus, Plus, Crown, Feather, Clock,
  ChevronDown, CreditCard, Truck, Shirt, Check, ShoppingBag
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";

import mainImage from "@/assets/product-1.jpg";
import thumb1 from "@/assets/product-2.jpg";
import thumb2 from "@/assets/product-3.jpg";
import thumb3 from "@/assets/product-4.jpg";
import { useCart } from "@/context/CartContext";
import { StaticImageData } from "next/image";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

interface ProductVariant {
  name: string;
  type: string;
  price: number;
  description: string;
  rating: number;
  reviews: number;
  colors: { name: string; hex: string }[];
  sizes: string[];
  gallery: StaticImageData[];
}

const allVariants: ProductVariant[] = [
  {
    name: "SET SHORT BODY CAMISETA",
    type: "Short",
    price: 140000,
    description: "Es de nuestra línea premium. Tacto frío, el tejido es de la mejor calidad del mercado, tiene push up más resistente, ya que tiene elástico interno, son cero transparentes y no te dan calor.",
    rating: 5,
    reviews: 1,
    colors: [
      { name: "AZUL BEBÉ", hex: "#a8d4f0" },
      { name: "CAFÉ", hex: "#8b6f5e" },
      { name: "BEIGE", hex: "#d4c4a8" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    gallery: [mainImage, thumb1, thumb2, thumb3, mainImage],
  },
  {
    name: "SET PANTALÓN BODY CAMISETA",
    type: "Pantalón",
    price: 160000,
    description: "Mismo tejido tacto frío premium. Versión pantalón largo, ideal para un look más formal pero igual de cómodo. Push up más resistente con elástico interno.",
    rating: 5,
    reviews: 1,
    colors: [
      { name: "AZUL BEBÉ", hex: "#a8d4f0" },
      { name: "CAFÉ", hex: "#8b6f5e" },
      { name: "BEIGE", hex: "#d4c4a8" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    gallery: [thumb2, thumb3, mainImage, thumb1],
  },
  {
    name: "SET BERMUDA BODY CAMISETA",
    type: "Bermuda",
    price: 150000,
    description: "Mismo tejido tacto frío premium. Versión bermuda, el largo perfecto entre short y pantalón. Push up más resistente con elástico interno.",
    rating: 5,
    reviews: 1,
    colors: [
      { name: "AZUL BEBÉ", hex: "#a8d4f0" },
      { name: "CAFÉ", hex: "#8b6f5e" },
      { name: "NEGRO", hex: "#222222" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    gallery: [thumb3, thumb1, thumb2, mainImage],
  },
  {
    name: "SET CAPRI BODY CAMISETA",
    type: "Capri",
    price: 155000,
    description: "Mismo tejido tacto frío premium. Versión capri, ideal para un look casual y fresco. Push up más resistente con elástico interno.",
    rating: 5,
    reviews: 1,
    colors: [
      { name: "CAFÉ", hex: "#8b6f5e" },
      { name: "BEIGE", hex: "#d4c4a8" },
    ],
    sizes: ["S", "M", "L", "XL"],
    gallery: [thumb1, mainImage, thumb2, thumb3],
  },
];

export default function ProductPage() {
  const [activeVariant, setActiveVariant] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(allVariants[0].colors[1]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addToCart } = useCart();
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const current = allVariants[activeVariant];

  const switchVariant = (index: number) => {
    if (index === activeVariant) return;
    setActiveVariant(index);
    setSelectedImage(0);
    setSelectedColor(allVariants[index].colors[0]);
    setSelectedSize(null);
    setQuantity(1);
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
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

      {/* TOAST */}
      <div
        className={`fixed top-4 right-4 z-[200] flex items-center gap-3 bg-white border border-border shadow-lg rounded-lg px-4 py-3 transition-all duration-500 ${showAddedNotification
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

      <div className="container mx-auto px-4 py-3 sm:py-4 text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
        <Link href="/" className="hover:text-foreground">INICIO</Link> /
        <Link href="/tienda" className="hover:text-foreground mx-1">TIENDA</Link> /
        <span className="text-foreground font-semibold ml-1">{current.name}</span>
      </div>

      <main className="container mx-auto px-4 pb-10 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16">

          {/* GALERÍA - altura fija */}
          <div className="flex flex-col-reverse lg:flex-row gap-3 sm:gap-4 lg:sticky lg:top-4 lg:self-start">
            <div className="flex lg:flex-col gap-2 sm:gap-3 overflow-x-auto lg:overflow-visible py-2 lg:py-0 scrollbar-hide">
              {current.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-14 h-18 sm:w-20 sm:h-24 shrink-0 border-2 transition-all ${selectedImage === i ? "border-foreground" : "border-transparent hover:border-border"
                    }`}
                >
                  <Image src={img} alt={`Vista ${i}`} fill className="object-cover" />
                </button>
              ))}
            </div>
            <div className="relative w-full max-h-[500px] sm:max-h-[580px] lg:max-h-[620px] aspect-[3/4] bg-muted overflow-hidden">
              <Image
                src={current.gallery[selectedImage]}
                alt={current.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* INFORMACIÓN */}
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 uppercase tracking-wide">
              {current.name}
            </h1>

            <p className="text-lg sm:text-xl font-medium text-foreground mb-3 sm:mb-4">
              ${current.price.toLocaleString("es-CO")}
            </p>

            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="flex text-[#c19a6b]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">{current.reviews} reseña</span>
            </div>

            <div className="bg-muted/30 p-2.5 sm:p-3 rounded-lg flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 border border-border/50">
              <div className="flex -space-x-2 shrink-0">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-300 border-2 border-background overflow-hidden relative" />
                ))}
              </div>
              <p className="text-[10px] sm:text-xs text-foreground">
                <strong>Aleja, Mariana</strong> y <strong>800+ personas más</strong> están comprando nuestras prendas!
              </p>
            </div>

            {/* WIDGET ADDI */}
            <div className="flex items-center gap-3 mb-6 p-2.5 rounded-lg border border-gray-200 bg-[#F9FAFB]">
               <div className="w-8 h-8 rounded-full bg-[#2F6BFF] flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-white font-bold text-lg leading-none mt-0.5" style={{ fontFamily: 'Arial, sans-serif'}}>a</span>
               </div>
               <p className="text-xs sm:text-sm text-gray-600 leading-snug">
                 Paga con <span className="font-bold text-[#2F6BFF]">Addi</span> en <span className="font-bold text-gray-900">hasta 6 cuotas</span>.
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

            {/* ===== SELECTOR DE VARIANTE (Short / Pantalón / Bermuda / Capri) ===== */}
            <div className="mb-4 sm:mb-6">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                TIPO: <span className="text-foreground">{current.type}</span>
              </span>
              <div className="flex gap-2 flex-wrap">
                {allVariants.map((v, i) => (
                  <button
                    key={v.type}
                    onClick={() => switchVariant(i)}
                    className={`relative flex items-center gap-2 px-3 py-2 border rounded-lg transition-all ${
                      activeVariant === i
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground text-foreground"
                    }`}
                  >
                    <div className="relative w-8 h-8 rounded overflow-hidden bg-muted shrink-0">
                      <Image src={v.gallery[0]} alt={v.type} fill className="object-cover" />
                    </div>
                    <span className="text-xs font-semibold uppercase">{v.type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Color */}
            <div className="mb-4 sm:mb-6">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                COLOR: <span className="text-foreground">{selectedColor.name}</span>
              </span>
              <div className="flex gap-2.5 sm:gap-3 mt-2 sm:mt-3">
                {current.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border relative flex items-center justify-center transition-transform hover:scale-110 ${selectedColor.name === color.name ? "ring-2 ring-offset-2 ring-foreground" : ""
                      }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Selector de Talla */}
            <div className="mb-4 sm:mb-6">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                TALLA: <span className="text-foreground">{selectedSize || "Selecciona una talla"}</span>
              </span>
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
                {ALL_SIZES.map((size) => {
                  const available = current.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => available && setSelectedSize(size)}
                      disabled={!available}
                      className={`min-w-12 h-10 px-3 border text-sm font-medium transition-all
                        ${selectedSize === size
                          ? "border-foreground bg-foreground text-background"
                          : available
                            ? "border-border hover:border-foreground text-foreground"
                            : "border-border/40 text-muted-foreground/40 line-through cursor-not-allowed"
                        }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botones de Compra */}
            <div className="flex flex-col gap-2.5 sm:gap-3 mb-6 sm:mb-8">
              <div className="flex gap-3 sm:gap-4">
                <div className="flex items-center border border-border rounded h-11 sm:h-12 w-28 sm:w-32">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 sm:w-10 h-full flex items-center justify-center hover:bg-muted text-foreground"
                  >
                    <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <span className="flex-1 text-center font-medium text-sm sm:text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 sm:w-10 h-full flex items-center justify-center hover:bg-muted text-foreground"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className={`flex-1 font-semibold uppercase tracking-wider text-xs sm:text-sm rounded transition-colors h-11 sm:h-12 active:scale-95 duration-100
                    ${selectedSize
                      ? "bg-[#c19a6b] hover:bg-[#a88659] text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  {!selectedSize
                    ? "Selecciona una talla"
                    : showAddedNotification
                      ? "✓ Agregado al carrito"
                      : "Agregar al carrito"
                  }
                </button>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-[#c19a6b] hover:bg-[#a88659] text-white font-bold py-4 rounded text-center uppercase tracking-wider text-sm transition-colors shadow-sm"
              >
                Comprar ahora
              </Link>
            </div>

            {/* Iconos de Pago */}
            <div className="flex justify-center gap-2 mb-6 sm:mb-8">
              {["GPay", "Apple", "PayPal", "Master", "Visa", "PSE"].map((item, i) => (
                <div key={i} className="h-6 w-10 sm:h-7 sm:w-12 bg-white border border-gray-200 rounded flex items-center justify-center shadow-sm">
                  <span className="text-[6px] sm:text-[8px] font-bold text-gray-600">{item}</span>
                </div>
              ))}
            </div>

            <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
              <p>{current.description}</p>
            </div>

            {/* Acordeones */}
            <div className="border-t border-border">
              <div className="border-b border-border">
                <button
                  onClick={() => toggleAccordion('envio')}
                  className="w-full py-4 flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-foreground" />
                    <span className="text-sm font-semibold text-foreground uppercase tracking-wider">ENVÍO</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${openAccordion === 'envio' ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openAccordion === 'envio' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-4 text-sm text-muted-foreground pl-8">
                    El envío nacional llega de 2 a 4 días hábiles y <strong>tiene un valor de $18,000</strong>.
                  </div>
                </div>
              </div>

              <div className="border-b border-border">
                <button
                  onClick={() => toggleAccordion('pago')}
                  className="w-full py-4 flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-foreground" />
                    <span className="text-sm font-semibold text-foreground uppercase tracking-wider">MÉTODOS DE PAGO</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${openAccordion === 'pago' ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openAccordion === 'pago' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-4 text-sm text-muted-foreground pl-8">
                    <strong>Recibimos todas las tarjetas de</strong> Crédito y Débito, PSE, Nequi, Davivienda y Bancolombia.
                  </div>
                </div>
              </div>

              <div className="border-b border-border">
                <button
                  onClick={() => toggleAccordion('cuidados')}
                  className="w-full py-4 flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3">
                    <Shirt className="w-5 h-5 text-foreground" />
                    <span className="text-sm font-semibold text-foreground uppercase tracking-wider">CUIDADOS DE LA PRENDA</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${openAccordion === 'cuidados' ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openAccordion === 'cuidados' ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-4 text-sm text-muted-foreground pl-8">
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Lavar a mano o en ciclo delicado.</li>
                      <li>Utilizar agua fría para mantener el color.</li>
                      <li>Evitar blanqueadores y suavizantes.</li>
                      <li>Secar a la sombra, sin usar secadora.</li>
                      <li>No planchar directamente sobre la prenda.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- SECCIÓN DE BENEFICIOS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center py-10 sm:py-16 border-t border-border mt-10 sm:mt-16">
          <div className="flex flex-col items-center">
            <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-[#c19a6b] mb-2 sm:mb-3" />
            <h3 className="font-bold text-xs sm:text-sm uppercase mb-1">Diseños Exclusivos</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Everything we do starts with why</p>
          </div>
          <div className="flex flex-col items-center">
            <Feather className="w-7 h-7 sm:w-8 sm:h-8 text-[#c19a6b] mb-2 sm:mb-3" />
            <h3 className="font-bold text-xs sm:text-sm uppercase mb-1">Comodidad Absoluta</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground">We believe in building better</p>
          </div>
          <div className="flex flex-col items-center">
            <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-[#c19a6b] mb-2 sm:mb-3" />
            <h3 className="font-bold text-xs sm:text-sm uppercase mb-1">Para toda ocasión</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Real people making great products</p>
          </div>
        </div>

        {/* --- SECCIÓN DE RECOMENDADOS --- */}
        <div className="py-8 sm:py-10">
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider mb-6 sm:mb-8">Recomendados para ti</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {[thumb1, thumb2, thumb3, mainImage].map((img, i) => (
              <Link href="#" key={i} className="cursor-pointer group block">
                <div className="relative aspect-3/4 mb-2 sm:mb-3 overflow-hidden">
                  <Image src={img} alt="Recomendado" fill className="object-cover group-hover:scale-105 transition-transform" />
                </div>
                <h3 className="text-[10px] sm:text-xs font-bold uppercase">Producto Recomendado {i + 1}</h3>
                <p className="text-xs sm:text-sm">$120.000</p>
              </Link>
            ))}
          </div>
        </div>

        {/* --- SECCIÓN DE RESEÑAS --- */}
        <div className="py-10 sm:py-16 border-t border-border">
          <h2 className="text-center text-lg sm:text-xl font-bold mb-8 sm:mb-10">Reseñas de Clientes</h2>

          <div className="flex flex-col md:flex-row gap-8 sm:gap-10 max-w-4xl mx-auto">
            <div className="flex-1 flex flex-col items-center justify-center md:border-r border-border md:pr-8">
              <div className="flex text-[#c19a6b] mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />)}
              </div>
              <p className="text-sm font-medium mb-1">5.00 de 5</p>
              <p className="text-xs text-muted-foreground mb-4 sm:mb-6">Basado en 1 reseña</p>

              <div className="w-full max-w-xs space-y-1">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <div className="flex text-[#c19a6b] w-16 sm:w-20 shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < star ? "fill-current" : "text-gray-300 fill-gray-300"}`} />
                      ))}
                    </div>
                    <div className="flex-1 h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black"
                        style={{ width: star === 5 ? '100%' : '0%' }}
                      />
                    </div>
                    <span className="w-4 text-right">{star === 5 ? 1 : 0}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center md:pl-8">
              <button className="bg-black text-white px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase hover:opacity-80 transition-opacity">
                Escribir una reseña
              </button>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
