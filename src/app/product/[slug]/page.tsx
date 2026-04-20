import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/seo";
import { auth } from "@/auth";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import ProductClient from "./components/ProductClient";
import { isVideoUrl } from "./utils";
import {
  mapUIItems,
  computeTotalStock,
  mapUIProduct,
  mapRecommended,
  mapProductReviews,
  mapSocialProof,
} from "./mappers";

interface Props {
  params: Promise<{ slug: string }>;
}

// ── SEO dinámico ─────────────────────────────────────────────────────────────
// Query ligera, independiente de la query principal de la página.
// Next.js ejecuta ambas en paralelo antes de renderizar.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, status: "ACTIVE" },
    select: {
      name: true,
      description: true,
      metaTitle: true,
      metaDescription: true,
      images: {
        where: { colorId: null },
        orderBy: { order: "asc" },
        take: 1,
        select: { url: true },
      },
    },
  });

  if (!product) return { title: "Producto no encontrado" };

  const title = product.metaTitle ?? product.name;
  const description = (product.metaDescription ?? product.description).slice(0, 160);
  const imageUrl = product.images[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      type: "website",
      ...(imageUrl && { images: [{ url: imageUrl, width: 800, height: 1067, alt: title }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  const userEmail = session?.user?.email ?? null;
  const dbUser = userEmail
    ? await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true } })
    : null;
  const userId = dbUser?.id ?? null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product = await (prisma as any).product.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      images: { orderBy: { order: "asc" } },
      colors: {
        include: {
          images: { orderBy: { order: "asc" } },
          variants: {
            where: { isActive: true },
            select: { id: true, sku: true, size: true, stock: true },
            orderBy: { size: "asc" },
          },
        },
      },
      items: {
        orderBy: { order: "asc" },
        include: {
          colors: {
            include: {
              images: { orderBy: { order: "asc" } },
              variants: {
                where: { isActive: true },
                select: { id: true, sku: true, size: true, stock: true },
              },
            },
          },
        },
      },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
        },
      },
      category: {
        include: {
          products: {
            where: { status: "ACTIVE", slug: { not: slug } },
            take: 4,
            select: {
              name: true,
              slug: true,
              basePrice: true,
              comparePrice: true,
              isSet: true,
              isProductNew: true,
              isProductNewAt: true,
              isOnSale: true,
              images: {
                orderBy: { order: "asc" },
                take: 8,
                select: { url: true },
              },
              items: {
                orderBy: { order: "asc" },
                select: {
                  price: true,
                  comparePrice: true,
                  colors: {
                    select: {
                      name: true,
                      hexCode: true,
                      images: { orderBy: { order: "asc" }, take: 8, select: { url: true } },
                    },
                  },
                },
              },
              colors: {
                select: {
                  name: true,
                  hexCode: true,
                  images: {
                    orderBy: { order: "asc" },
                    take: 1,
                    select: { url: true },
                  },
                  variants: { select: { stock: true } },
                },
                orderBy: { id: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!product) notFound();

  // Extraemos la reseña del usuario desde el array ya cargado (evita query extra)
  const rawUserReview = userId
    ? (product.reviews as any[]).find((r: any) => r.userId === userId) ?? null
    : null;
  const userReview: { rating: number; comment: string | null } | null = rawUserReview
    ? { rating: rawUserReview.rating as number, comment: (rawUserReview.comment as string | null) ?? null }
    : null;

  // Imágenes generales y resolución de video
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allGeneralImages: string[] = product.images
    .filter((img: any) => !img.colorId)
    .map((img: any) => img.url);

  const dbVideoUrl = product.videoUrl as string | null;
  const resolvedVideoUrl = dbVideoUrl ?? (allGeneralImages.find(isVideoUrl) ?? null);

  // Métricas de reseñas
  const liveReviews = product.reviews as any[];
  const liveNumReviews = liveReviews.length;
  const liveRating =
    liveNumReviews > 0
      ? liveReviews.reduce((sum: number, r: any) => sum + (r.rating as number), 0) / liveNumReviews
      : 0;

  // Mapping con funciones centralizadas
  const uiItems = mapUIItems(product.items ?? []);
  const totalStock = computeTotalStock(product, uiItems);
  const uiProduct = mapUIProduct(
    product,
    uiItems,
    totalStock,
    liveRating,
    liveNumReviews,
    resolvedVideoUrl,
    allGeneralImages
  );

  // Social proof: compradores reales de este producto
  const buyerOrders = await prisma.order.findMany({
    where: { status: "PAID", items: { some: { productId: product.id } } },
    select: { shippingName: true, user: { select: { image: true } } },
    orderBy: { paidAt: "desc" },
    take: 50,
  });

  const socialProof = mapSocialProof(buyerOrders);
  const recommended = mapRecommended(product.category.products as any[]);
  const productReviews = mapProductReviews(product.reviews as any[]);

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-[#C19A6B]/20">
      <AnnouncementBar />
      <Header />
      <div className="flex-1 w-full">
        <ProductClient
          product={uiProduct}
          recommended={recommended}
          existingReview={userReview}
          isAuthenticated={!!userId}
          reviews={productReviews}
          socialProof={socialProof}
        />
      </div>
      <Footer />
    </div>
  );
}
