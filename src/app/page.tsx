


import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { AnnouncementBar, Header, HeroSection } from "@/components";
import { prisma } from "@/lib/prisma";
import { SLIDES } from "@/components/HeroSection/constants";
import type { Slide } from "@/components/HeroSection/types";

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



type DbSlide = {
  id: string;
  position: number;
  mediaUrl: string;
  mediaType: string;
  headline: string | null;
  subheadline: string | null;
};

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

const getCachedHeroSlides = unstable_cache(fetchHeroSlides, ["hero-slides"], {
  revalidate: 3600,
  tags: ["hero"],
});

const getCachedTestimonials = unstable_cache(fetchTestimonials, ["testimonials"], {
  revalidate: 3600,
  tags: ["testimonials"],
});

export default async function Home() {
  const [heroSlides, testimonials] = await Promise.all([getCachedHeroSlides(), getCachedTestimonials()]);

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <HeroSection slides={heroSlides} />
      <BestSellers />
      <NewCollection />
      <Categories />
      <PaymentMethodsBanner />
      <Testimonials comments={testimonials} />
      <Footer />
    </div>
  );
}
