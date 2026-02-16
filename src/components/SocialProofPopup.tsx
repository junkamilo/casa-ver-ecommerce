"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; // <--- 1. IMPORTAR LINK
import { X, CheckCircle2 } from "lucide-react";

// --- IMÁGENES ---
import prod1 from "@/assets/product-1.jpg";
import prod2 from "@/assets/product-2.jpg";
import prod3 from "@/assets/product-3.jpg";
import prod4 from "@/assets/product-4.jpg";

const fakeSalesData = [
  {
    name: "María C.",
    location: "Bogotá",
    productName: "Set Short Body Camiseta",
    timeAgo: "hace 2 minutos",
    image: prod1,
    slug: "set-short-body-camiseta", // <--- 2. AGREGAMOS EL SLUG REAL
  },
  {
    name: "Andrea R.",
    location: "Medellín",
    productName: "Enterizo Largo",
    timeAgo: "hace 15 minutos",
    image: prod2,
    slug: "enterizo-largo-manga", // Asegúrate que coincida con tus productos
  },
  {
    name: "Camila V.",
    location: "Cali",
    productName: "Set Pant Icon",
    timeAgo: "hace 5 minutos",
    image: prod3,
    slug: "set-pant-icon",
  },
  {
    name: "Laura P.",
    location: "Barranquilla",
    productName: "Set Aurora Beige",
    timeAgo: "hace 1 hora",
    image: prod4,
    slug: "set-aurora",
  },
];

const SocialProofPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPermanentlyClosed, setIsPermanentlyClosed] = useState(false);

  // Tiempos
  const DISPLAY_DURATION = 5000;
  const INTERVAL_DURATION = 12000;

  useEffect(() => {
    if (isPermanentlyClosed) return;

    const runCycle = () => {
        setIsVisible(true);
        const hideTimer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % fakeSalesData.length);
            }, 500); 
        }, DISPLAY_DURATION);
        return hideTimer;
    };

    let initialTimeout = setTimeout(() => {
       runCycle();
       const intervalId = setInterval(runCycle, INTERVAL_DURATION);
       return () => clearInterval(intervalId);
    }, 4000); 

    return () => clearTimeout(initialTimeout);
  }, [isPermanentlyClosed]);

  if (isPermanentlyClosed) return null;

  const currentItem = fakeSalesData[currentIndex];

  return (
    // CONTENEDOR PRINCIPAL (Fijo)
    <div
      className={`
        fixed z-[9999] 
        left-4 
        bottom-6 sm:bottom-8 
        w-auto max-w-[calc(100vw-32px)] sm:max-w-[380px]
        bg-white 
        border-l-[6px] border-[#154734] 
        shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] 
        rounded-r-lg rounded-tl-sm rounded-bl-sm
        transition-all duration-700 cubic-bezier(0.25, 0.8, 0.25, 1)
        ${isVisible 
            ? "translate-y-0 opacity-100" 
            : "translate-y-20 opacity-0 pointer-events-none"
        }
      `}
    >
      {/* Botón Cerrar (Fuera del Link para que no active la navegación) */}
      <button
        onClick={(e) => {
            e.stopPropagation(); // Evita que el clic llegue al Link
            setIsPermanentlyClosed(true);
        }}
        className="absolute top-1 right-1 p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors z-20"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>

      {/* --- 3. ENVOLVEMOS TODO EL CONTENIDO EN EL LINK --- */}
      <Link 
        href={`/product/${currentItem.slug}`}
        className="flex items-center gap-4 p-3 pr-8 sm:pr-4 group cursor-pointer"
      >
        {/* Imagen del producto */}
        <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden border border-gray-100 shadow-sm group-hover:opacity-90 transition-opacity">
            <Image
            src={currentItem.image}
            alt={currentItem.productName}
            fill
            className="object-cover"
            />
        </div>

        {/* Textos */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
            
            {/* Línea 1: Quién y Dónde */}
            <div className="flex items-center gap-1.5 mb-1 text-xs text-gray-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#154734]" />
                <span className="truncate">
                    <span className="font-bold text-[#154734]">{currentItem.name}</span> de {currentItem.location}
                </span>
            </div>
            
            {/* Línea 2: Qué compró (Título con hover color marca) */}
            <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-1 mb-1 group-hover:text-[#154734] transition-colors">
            Compró {currentItem.productName}
            </p>
            
            {/* Línea 3: Cuándo */}
            <p className="text-[10px] font-medium text-gray-400 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C19A6B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C19A6B]"></span>
            </span>
            {currentItem.timeAgo}
            </p>
        </div>
      </Link>
    </div>
  );
};

export default SocialProofPopup;