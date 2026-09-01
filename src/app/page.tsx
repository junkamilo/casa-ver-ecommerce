


import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import { AnnouncementBar, Header, HeroSection } from "@/components";
import { prisma } from "@/lib/prisma";
import type { Slide } from "@/components/HeroSection/types";
import { HeroLcpPreload } from "@/components/HeroSection/components/HeroLcpPreload";
import {
  mapActiveDbHeroSlidesToStorefront,
  type DbHeroSlideRow,
} from "@/modules/hero/presentation/map-to-storefront-slide";

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

async function fetchTestimonials(): Promise<TestimonialItem[]> {
  try {
    const dbReviews = await prisma.review.findMany({
      where: { comment: { not: "" }, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: SEED_TESTIMONIALS.length,
      include: { user: { select: { name: true } } },
    });

    const realItems: TestimonialItem[] = dbReviews.map((r) => ({
      rating: r.rating,
      comment: r.comment!,
      name: r.user?.name ?? "Cliente",
    }));

    // Rellena con seeds hasta completar el total
    const seeds = SEED_TESTIMONIALS.slice(realItems.length);
    return [...realItems, ...seeds];
  } catch {
    return SEED_TESTIMONIALS;
  }
}

async function fetchHeroSlides(): Promise<Slide[]> {
  const dbSlides = (await prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
    select: {
      id: true,
      position: true,
      mediaUrl: true,
      mediaUrlMobile: true,
      mediaUrlTablet: true,
      posterUrl: true,
      mediaType: true,
      headline: true,
      subheadline: true,
      mediaFocus: true,
      playFullVideo: true,
    },
  })) as DbHeroSlideRow[];

  if (dbSlides.length === 0) return [];

  return mapActiveDbHeroSlidesToStorefront(dbSlides);
}

async function fetchHeroSettings(): Promise<number> {
  const settings = await prisma.heroSettings.findUnique({ where: { id: 1 } });
  return settings?.slideDurationMs ?? 6000;
}

const getCachedHeroSlides = unstable_cache(fetchHeroSlides, ["hero-slides"], {
  revalidate: 3600,
  tags: ["hero"],
});

const getCachedHeroSettings = unstable_cache(fetchHeroSettings, ["hero-settings"], {
  revalidate: 3600,
  tags: ["hero"],
});

const getCachedTestimonials = unstable_cache(fetchTestimonials, ["testimonials"], {
  revalidate: 3600,
  tags: ["testimonials"],
});

export default async function Home() {
  let heroSlides: Slide[];
  let slideDurationMs: number;

  try {
    [heroSlides, slideDurationMs] = await Promise.all([
      getCachedHeroSlides(),
      getCachedHeroSettings(),
    ]);
  } catch (error) {
    console.error("[HOME_HERO] Cache miss, reintentando sin caché", error);
    [heroSlides, slideDurationMs] = await Promise.all([
      fetchHeroSlides(),
      fetchHeroSettings(),
    ]);
  }

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
