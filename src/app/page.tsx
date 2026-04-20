


import type { Metadata } from "next";
import { AnnouncementBar, Header, HeroSection } from "@/components";
import { prisma } from "@/lib/prisma";
import { SLIDES } from "@/components/HeroSection/constants";
import type { Slide } from "@/components/HeroSection/types";

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
import { TESTIMONIALS } from "@/components/layout/Testimonials/constants/constants";
import PaymentMethodsBanner from "@/components/PaymentMethodsBanner";



type DbSlide = {
  id: string;
  position: number;
  mediaUrl: string;
  mediaType: string;
  headline: string | null;
  subheadline: string | null;
};

async function fetchHeroSlides(): Promise<Slide[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    const dbSlides: DbSlide[] = await db.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    });

    // Si no hay slides en DB (primera vez), usa los estáticos como fallback
    if (dbSlides.length === 0) return SLIDES;

    return dbSlides.map((s, i) => ({
      id: `hero-${s.position}`,
      image: s.mediaUrl || (SLIDES[i]?.image ?? SLIDES[0].image),
      mediaType: (s.mediaType === "video" ? "video" : "image") as "image" | "video",
      headline: s.headline ?? SLIDES[i]?.headline,
      subheadline: s.subheadline ?? SLIDES[i]?.subheadline,
    }));
  } catch {
    return SLIDES;
  }
}

export default async function Home() {
  const heroSlides = await fetchHeroSlides();

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <HeroSection slides={heroSlides} />
      <BestSellers />
      <NewCollection />
      <Categories />
      <PaymentMethodsBanner />
      <Testimonials comments={TESTIMONIALS} />
      <Footer />
    </div>
  );
}
