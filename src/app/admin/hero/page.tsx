import AdminPageHeader from "@/components/ui/AdminPageHeader";
import HeroSlidesClient from "./components/HeroSlidesClient";
import type { HeroSlideData } from "./types";
import { ImageIcon } from "lucide-react";
import { fetchAdminHeroSlides } from "@/modules/adminCatalog/hero/presentation/fetch-admin-hero-slides";

export const dynamic = "force-dynamic";

export default async function HeroAdminPage() {
  const slides: HeroSlideData[] = await fetchAdminHeroSlides();

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
      <AdminPageHeader
        title="Imágenes del Header"
        action={{ label: "Ver tienda", href: "/", icon: ImageIcon }}
      />

      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
        <ImageIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          Estas imágenes y videos se muestran en el carrusel principal de la página de inicio.
          Los cambios se reflejan en la tienda de inmediato. Puedes agregar todos los slides
          que desees — imágenes (1920×800 px recomendado) o videos (MP4, MOV, WebM).
        </p>
      </div>

      <HeroSlidesClient slides={slides} />
    </div>
  );
}
