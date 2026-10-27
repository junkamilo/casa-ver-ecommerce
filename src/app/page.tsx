


import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import { AnnouncementBar, Header, HeroSection } from "@/components";
import { fetchHeroForRender } from "@/modules/posIntegration/infrastructure/pos-banners.client";
import { mapPosHeroSlides } from "@/modules/posIntegration/domain/pos-hero";
import {
  fetchTestimonialsForRender,
  POS_REVIEWS_CACHE_TAG,
} from "@/modules/posIntegration/infrastructure/pos-reviews.client";
import type { Slide } from "@/components/HeroSection/types";
import { HeroLcpPreload } from "@/components/HeroSection/components/HeroLcpPreload";

export const dynamic = "force-dynamic";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Casa Verde — moda con esencia natural. Ropa con conciencia, estilo y calidad colombiana. Envíos a todo el país.",
  openGraph: {
    title: "Casa Verde",
    description:
      "Moda con esencia natural. Descubre ropa con conciencia, estilo y calidad colombiana.",
    type: "website",
  },
};
import Footer from "@/components/Footer";

import BestSellers from "@/components/layout/BestSellers";
import Categories from "@/components/layout/Categories";
import NewCollection from "@/components/layout/NewCollection";
import Testimonials from "@/components/layout/Testimonials";
import { SEED_TESTIMONIALS } from "@/components/layout/Testimonials/constants/constants";
import type { TestimonialItem } from "@/components/layout/Testimonials/types/types";
import PaymentMethodsBanner from "@/components/PaymentMethodsBanner";

const DEFAULT_HERO_SLIDE_DURATION_MS = 6000;


async function fetchTestimonials(): Promise<TestimonialItem[]> {
  try {
    // Reseñas aprobadas en el POS (4 y 5 estrellas, con comentario).
    const posReviews = await fetchTestimonialsForRender(SEED_TESTIMONIALS.length);

    const realItems: TestimonialItem[] = posReviews.map((r) => ({
      rating: r.rating,
      comment: r.comment,
      name: r.customerName || "Clienta",
    }));

    // Rellena con seeds hasta completar el total
    const seeds = SEED_TESTIMONIALS.slice(realItems.length);
    return [...realItems, ...seeds];
  } catch {
    return SEED_TESTIMONIALS;
  }
}

/**
 * Carrusel del inicio: banners activos y duración que publica el POS (Diseño → Banners). Si el POS no responde
 * (y la Data Cache no tiene copia) se muestra el banner vacío con la duración por defecto.
 */
async function fetchHero(): Promise<{ slides: Slide[]; slideDurationMs: number }> {
  try {
    const hero = await fetchHeroForRender();
    if (!hero) return { slides: [], slideDurationMs: DEFAULT_HERO_SLIDE_DURATION_MS };
    return { slides: mapPosHeroSlides(hero.slides), slideDurationMs: hero.slideDurationMs };
  } catch (error) {
    console.error("[HOME_HERO] POS sin respuesta para los banners:", error instanceof Error ? error.message : error);
    return { slides: [], slideDurationMs: DEFAULT_HERO_SLIDE_DURATION_MS };
  }
}

const getCachedTestimonials = unstable_cache(fetchTestimonials, ["testimonials"], {
  revalidate: 3600,
  tags: ["testimonials", POS_REVIEWS_CACHE_TAG],
});

export default async function Home() {
  const { slides: heroSlides, slideDurationMs } = await fetchHero();

  const testimonials = await getCachedTestimonials();

  return (
    <div className="min-h-screen bg-background">
      <HeroLcpPreload slide={heroSlides[0] ?? null} />
      <AnnouncementBar />
      <Header />
      <HeroSection slides={heroSlides} slideDurationMs={slideDurationMs} />
      <Suspense fallback={null}>
        <BestSellers />
      </Suspense>
      <Suspense fallback={null}>
        <NewCollection />
      </Suspense>
      <Categories />
      <PaymentMethodsBanner />
      <Testimonials comments={testimonials} />
      <Footer />
    </div>
  );
}
