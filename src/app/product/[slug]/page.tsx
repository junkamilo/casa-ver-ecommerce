import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { SITE_NAME } from "@/lib/seo";
import { auth } from "@/auth";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import ProductClient from "./components/ProductClient";
import { getProductSeoUseCase } from "@/modules/catalog/product/application/get-product-seo.use-case";
import { getProductDetailUseCase } from "@/modules/catalog/product/application/get-product-detail.use-case";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tipo?: string }>;
}

// ── SEO dinámico ─────────────────────────────────────────────────────────────
// La query SEO es ligera e independiente de la query principal. Next.js las
// ejecuta en paralelo antes de renderizar.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductSeoUseCase(slug);

  if (!product) return { title: "Producto no encontrado" };

  const title = product.metaTitle ?? product.name;
  const description = (product.metaDescription ?? product.description).slice(
    0,
    160,
  );
  const imageUrl = product.firstImageUrl;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      type: "website",
      ...(imageUrl && {
        images: [{ url: imageUrl, width: 800, height: 1067, alt: title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tipo } = await searchParams;
  const session = await auth();
  const userEmail = session?.user?.email ?? null;

  const data = await getProductDetailUseCase({ slug, tipo, userEmail });
  if (!data) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-[#C19A6B]/20">
      <AnnouncementBar />
      <Header />
      <div className="flex-1 w-full">
        <ProductClient
          product={data.product}
          recommended={data.recommended}
          existingReview={data.existingReview}
          isAuthenticated={!!userEmail}
          reviews={data.reviews}
          socialProof={data.socialProof}
          initialItemId={data.initialItemId}
        />
      </div>
      <Footer />
    </div>
  );
}
