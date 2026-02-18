"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LayoutGrid, List, ChevronUp, SlidersHorizontal, X } from "lucide-react";

import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";

// --- IMÁGENES DE EJEMPLO (Usamos las que ya tienes) ---
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import new1 from "@/assets/new-1.jpg";
import new3 from "@/assets/new-3.jpg";
import new6 from "@/assets/new-6.jpg";
import Header from "@/components/layout/Header";

// Simulamos productos de la colección
const collectionProducts = [
  { image: product1, name: "ENTERIZO COCOA", price: 81880, oldPrice: 90000, badge: "Oferta", slug: "enterizo-cocoa" },
  { image: product2, name: "ENTERIZO CORAL", price: 81880, oldPrice: 90000, badge: "Oferta", slug: "enterizo-coral" },
  { image: new1, name: "MEDIAS", price: 22000, colorLabel: "GRIS", colors: ["#e0e0e0", "#ffffff"], slug: "medias" },
  { image: new3, name: "ENTERIZO CORTO MANGA LARGA H", price: 140000, colorLabel: "AZUL BEBÉ", colors: ["#a8d4f0", "#8b6f5e", "#d4c4a8"], slug: "enterizo-corto-manga" },
  { image: product4, name: "SET SHORT SESGO", price: 120000, slug: "set-short-sesgo" },
  { image: product3, name: "ENTERIZO CORTO CAMISETA", price: 125000, slug: "enterizo-corto-camiseta" },
  { image: new6, name: "BODY BASIC", price: 90000, slug: "body-basic" },
  { image: product2, name: "VESTIDO CAMISETA", price: 140000, slug: "vestido-camiseta" },
];

export default function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  // Estados para los filtros (Acordeones)
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Formatear el slug para mostrarlo como título (ej: "enterizos-cortos" -> "ENTERIZOS CORTOS")
  const title = slug.replace(/-/g, " ").toUpperCase();

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Título y Filtros Móviles (Opcional) */}
        <div className="flex flex-col mb-8">
          <h1 className="text-3xl font-bold text-foreground uppercase tracking-wide mb-6">
             {/* Aquí podrías poner el título si quisieras, en tu foto está limpio */}
          </h1>
          
          <div className="flex items-start gap-6 lg:gap-12">

            {/* --- MOBILE FILTER DRAWER --- */}
            {mobileFiltersOpen && (
              <div className="fixed inset-0 z-100 lg:hidden flex">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setMobileFiltersOpen(false)}
                />
                <div className="relative w-4/5 max-w-xs bg-background h-full shadow-2xl p-5 overflow-y-auto animate-in slide-in-from-left duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-foreground">Filtros</span>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Filtro: Disponibilidad (mobile) */}
                  <div className="border-b border-border py-4">
                    <button
                      onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}
                      className="flex items-center justify-between w-full text-sm font-medium"
                    >
                      <span>Disponibilidad</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isAvailabilityOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isAvailabilityOpen && (
                      <div className="mt-4 space-y-2">
                        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                          <input type="checkbox" className="rounded border-border" />
                          En existencia
                        </label>
                        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                          <input type="checkbox" className="rounded border-border" />
                          Agotado
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Filtro: Precio (mobile) */}
                  <div className="border-b border-border py-4">
                    <button
                      onClick={() => setIsPriceOpen(!isPriceOpen)}
                      className="flex items-center justify-between w-full text-sm font-medium"
                    >
                      <span>Precio</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isPriceOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isPriceOpen && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                            <input type="number" placeholder="0" className="w-full pl-6 pr-2 py-2 text-sm border border-border rounded" />
                          </div>
                          <span className="text-sm text-muted-foreground">a</span>
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                            <input type="number" placeholder="180000" className="w-full pl-6 pr-2 py-2 text-sm border border-border rounded" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">El precio más alto es $180.000</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- SIDEBAR FILTROS (Izquierda - Desktop) --- */}
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Filtros</h2>
              
              {/* Filtro: Disponibilidad */}
              <div className="border-b border-border py-4">
                <button 
                  onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}
                  className="flex items-center justify-between w-full text-sm font-medium hover:text-muted-foreground transition-colors"
                >
                  <span>Disponibilidad</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isAvailabilityOpen ? "rotate-180" : ""}`} />
                </button>
                
                {isAvailabilityOpen && (
                  <div className="mt-4 space-y-2">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                      <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                      En existencia
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                      <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                      Agotado
                    </label>
                  </div>
                )}
              </div>

              {/* Filtro: Precio */}
              <div className="border-b border-border py-4">
                <button 
                  onClick={() => setIsPriceOpen(!isPriceOpen)}
                  className="flex items-center justify-between w-full text-sm font-medium hover:text-muted-foreground transition-colors"
                >
                  <span>Precio</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isPriceOpen ? "rotate-180" : ""}`} />
                </button>
                
                {isPriceOpen && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                        <input type="number" placeholder="0" className="w-full pl-6 pr-2 py-2 text-sm border border-border rounded" />
                      </div>
                      <span className="text-sm text-muted-foreground">a</span>
                      <div className="relative flex-1">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                        <input type="number" placeholder="180000" className="w-full pl-6 pr-2 py-2 text-sm border border-border rounded" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">El precio más alto es $180.000</p>
                  </div>
                )}
              </div>
            </aside>

            {/* --- GRILLA DE PRODUCTOS (Derecha) --- */}
            <div className="flex-1">
              {/* Barra superior de herramientas */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                 {/* Botón filtros mobile */}
                 <button
                   className="lg:hidden flex items-center gap-1.5 text-sm text-foreground font-medium"
                   onClick={() => setMobileFiltersOpen(true)}
                 >
                   <SlidersHorizontal className="w-4 h-4" />
                   Filtros
                 </button>
                 <div className="hidden lg:block"></div>

                 <div className="flex items-center gap-6 text-sm">
                   <span className="text-muted-foreground">{collectionProducts.length} artículos</span>
                   
                   <div className="flex items-center gap-2 cursor-pointer hover:text-muted-foreground">
                     <span>Ordenar</span>
                     <ChevronDown className="w-4 h-4" />
                   </div>
                   
                   <div className="flex items-center gap-2 border-l pl-4 border-border">
                      <LayoutGrid className="w-5 h-5 cursor-pointer text-foreground" />
                      <List className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-foreground" />
                   </div>
                 </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                {collectionProducts.map((item, i) => (
                  <Link 
                    href={`/product/${item.slug}`} 
                    key={i} 
                    className="group cursor-pointer block"
                  >
                    <div className="relative aspect-[3/4] mb-3 overflow-hidden bg-muted">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      {item.badge && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xs font-bold text-foreground uppercase mb-1 tracking-wide group-hover:underline underline-offset-4">
                      {item.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-sm mb-2">
                       <span className="font-medium">
                         ${item.price.toLocaleString()}
                       </span>
                       {item.oldPrice && (
                         <span className="text-muted-foreground line-through text-xs">
                           ${item.oldPrice.toLocaleString()}
                         </span>
                       )}
                    </div>

                    {item.colorLabel && (
                       <p className="text-xs text-muted-foreground mb-2">Color: {item.colorLabel}</p>
                    )}

                    {item.colors && (
                      <div className="flex gap-1.5">
                        {item.colors.map((color, idx) => (
                          <div 
                            key={idx} 
                            className="w-4 h-4 rounded-full border border-border" 
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}