"use client";

import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { ChevronUp, LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import new1 from "@/assets/new-1.jpg";
import new3 from "@/assets/new-3.jpg";
import new6 from "@/assets/new-6.jpg";

interface Product {
    image: StaticImageData;
    name: string;
    price: string;
    oldPrice?: string;
    badge?: string;
    colors?: string[];
    colorLabel?: string;
}

const allProducts: Product[] = [
    {
        image: product1,
        name: "BODY BASIC",
        price: "$90.000",
        colorLabel: "CAFÉ",
        colors: ["#a8967a", "#2d2d2d", "#a8d4f0"],
    },
    {
        image: product2,
        name: "BODY BASIC NEGRO",
        price: "$110.000",
    },
    {
        image: product3,
        name: "BODY BOTONES",
        price: "$80.000",
        oldPrice: "$125.000",
        badge: "Oferta",
    },
    {
        image: product4,
        name: "BODY MAGNOLIO",
        price: "$120.000",
    },
    {
        image: product5,
        name: "SET PANT G SIN PUSH",
        price: "$150.000",
        colors: ["#8b6f5e", "#3d6b8a"],
        colorLabel: "CAFÉ",
    },
    {
        image: new1,
        name: "SET PANT BUSO LÍNEAS",
        price: "$170.000",
    },
    {
        image: new3,
        name: "SET SHORT AZUL EFECTO LAVADO",
        price: "$80.000",
    },
    {
        image: new6,
        name: "ENTERIZO LARGO MANGA LARGA",
        price: "$170.000",
    },
];

const Tienda = () => {
    const [disponibilidadOpen, setDisponibilidadOpen] = useState(true);
    const [precioOpen, setPrecioOpen] = useState(true);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const FilterContent = () => (
        <>
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">Filtros</h2>

            {/* Disponibilidad */}
            <div className="border-b border-border pb-4 mb-4">
                <button
                    onClick={() => setDisponibilidadOpen(!disponibilidadOpen)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <span className="text-sm sm:text-base font-semibold text-foreground">Disponibilidad</span>
                    <ChevronUp
                        className={`w-4 h-4 text-muted-foreground transition-transform ${!disponibilidadOpen ? "rotate-180" : ""}`}
                    />
                </button>
                {disponibilidadOpen && (
                    <div className="mt-3 space-y-2">
                        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-border" />
                            En existencia
                        </label>
                        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-border" />
                            Agotado
                        </label>
                    </div>
                )}
            </div>

            {/* Precio */}
            <div className="border-b border-border pb-4 mb-4">
                <button
                    onClick={() => setPrecioOpen(!precioOpen)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <span className="text-sm sm:text-base font-semibold text-foreground">Precio</span>
                    <ChevronUp
                        className={`w-4 h-4 text-muted-foreground transition-transform ${!precioOpen ? "rotate-180" : ""}`}
                    />
                </button>
                {precioOpen && (
                    <div className="mt-3">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center border border-border px-3 py-1.5">
                                <span className="text-sm text-muted-foreground mr-1">$</span>
                                <input
                                    type="text"
                                    defaultValue="0"
                                    className="w-12 text-sm bg-transparent outline-none text-foreground"
                                />
                            </div>
                            <span className="text-sm text-muted-foreground">a</span>
                            <div className="flex items-center border border-border px-3 py-1.5">
                                <span className="text-sm text-muted-foreground mr-1">$</span>
                                <input
                                    type="text"
                                    defaultValue="190,000"
                                    className="w-16 text-sm bg-transparent outline-none text-foreground"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-brand mt-2">El precio más alto es $190.000</p>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-background">
            <AnnouncementBar />
            <Header />

            <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                <div className="flex gap-6 lg:gap-10">
                    {/* Sidebar Filters - Desktop */}
                    <aside className="w-65 shrink-0 hidden md:block">
                        <FilterContent />
                    </aside>

                    {/* Mobile Filter Drawer */}
                    {mobileFiltersOpen && (
                        <div className="fixed inset-0 z-100 md:hidden flex">
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
                                <FilterContent />
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Top bar */}
                        <div className="flex items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                            {/* Mobile filter toggle */}
                            <button
                                className="md:hidden flex items-center gap-1.5 text-sm text-foreground font-medium"
                                onClick={() => setMobileFiltersOpen(true)}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filtros
                            </button>

                            <span className="text-xs sm:text-sm text-muted-foreground">
                                {allProducts.length} artículos
                            </span>
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="flex items-center gap-1 cursor-pointer">
                                    <span className="text-xs sm:text-sm text-foreground">Ordenar</span>
                                    <ChevronUp className="w-3 h-3 text-foreground rotate-180" />
                                </div>
                                <div className="hidden sm:flex items-center gap-2 ml-2">
                                    <button className="text-foreground">
                                        <LayoutGrid className="w-5 h-5" />
                                    </button>
                                    <button className="text-muted-foreground">
                                        <List className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                            {allProducts.map((product, i) => (
                                <div key={i} className="cursor-pointer group">
                                    <div className="relative overflow-hidden mb-2 sm:mb-3">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full aspect-3/4 object-cover group-hover:scale-105 transition-transform duration-500"
                                            placeholder="blur"
                                        />
                                        {product.badge && (
                                            <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-destructive text-destructive-foreground text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                                                {product.badge}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-[10px] sm:text-xs font-semibold tracking-wider text-foreground mb-1 uppercase">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                        <span className="text-xs sm:text-sm text-foreground">{product.price}</span>
                                        {product.oldPrice && (
                                            <span className="text-xs sm:text-sm text-muted-foreground line-through">
                                                {product.oldPrice}
                                            </span>
                                        )}
                                    </div>
                                    {product.colorLabel && (
                                        <p className="text-[10px] sm:text-xs text-muted-foreground tracking-wider mb-1.5 sm:mb-2">
                                            COLOR: {product.colorLabel}
                                        </p>
                                    )}
                                    {product.colors && (
                                        <div className="flex gap-1 sm:gap-1.5">
                                            {product.colors.map((color, ci) => (
                                                <span
                                                    key={ci}
                                                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-border"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Tienda;
