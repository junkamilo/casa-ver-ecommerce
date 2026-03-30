import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { computeProductBadge } from "@/lib/productBadge";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import ProductClient from "./components/ProductClient";
import { UIProduct, UIProductItem } from "./types";
import type { CollectionProduct } from "@/components/shared/ProductCollection/types";
import type { TestimonialItem } from "@/components/layout/Testimonials/types/types";

interface Props {
  params: Promise<{ slug: string }>;
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
  const db = prisma as any;

  const product = await db.product.findUnique({
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
              isProductNew: true,
              isProductNewAt: true,
              isOnSale: true,
              images: {
                orderBy: { order: "asc" },
                take: 8,
                select: { url: true },
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

  const isVideoUrl = (url: string) => /\.(mp4|mov|avi|webm|mkv|ogg)$/i.test(url);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allGeneralImages: string[] = product.images
    .filter((img: any) => !img.colorId)
    .map((img: any) => img.url);

  const dbVideoUrl = product.videoUrl as string | null;
  const resolvedVideoUrl = dbVideoUrl ?? (allGeneralImages.find(isVideoUrl) ?? null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapUIColor = (color: any) => {
    const activeVariants = (color.variants as any[]).filter((v) => v.stock > 0);
    return {
      id: color.id,
      name: color.name,
      hex: color.hexCode,
      images: (color.images as any[]).map((img) => img.url).filter((u: string) => !isVideoUrl(u)),
      availableSizes: activeVariants.map((v) => v.size as string),
      variants: activeVariants.map((v) => ({ size: v.size as string, variantId: v.id as string, sku: v.sku as string })),
    };
  };

  const uiItems: UIProductItem[] = (product.items as any[] ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? null,
    price: item.price ? Number(item.price) : null,
    videoUrl: item.videoUrl ?? null,
    stock: (item.colors as any[]).reduce(
      (acc: number, c: any) => acc + (c.variants as any[]).reduce((s: number, v: any) => s + v.stock, 0), 0
    ),
    colors: (item.colors as any[]).map(mapUIColor),
  }));

  const totalStock = (product.colors as any[]).reduce(
    (acc: number, color: any) => acc + (color.variants as any[]).reduce((s: number, v: any) => s + v.stock, 0), 0
  );

  const liveReviews = product.reviews as any[];
  const liveNumReviews = liveReviews.length;
  const liveRating =
    liveNumReviews > 0
      ? liveReviews.reduce((sum: number, r: any) => sum + (r.rating as number), 0) / liveNumReviews
      : 0;

  const uiProduct: UIProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: Number(product.basePrice),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    material: product.material,
    videoUrl: resolvedVideoUrl,
    generalImages: allGeneralImages.filter((url) => !isVideoUrl(url)),
    colors: (product.colors as any[]).map(mapUIColor),
    rating: liveRating,
    numReviews: liveNumReviews,
    stock: totalStock,
    isSet: product.isSet ?? false,
    items: uiItems,
    badge: computeProductBadge({
      isProductNew: product.isProductNew as boolean | undefined,
      isProductNewAt: product.isProductNewAt as Date | null | undefined,
      isOnSale: product.isOnSale as boolean | undefined,
      stock: totalStock,
    }),
  };

  // Social proof: compradores reales de este producto
  const buyerOrders = await prisma.order.findMany({
    where: { status: "PAID", items: { some: { productId: product.id } } },
    select: { shippingName: true, user: { select: { image: true } } },
    orderBy: { paidAt: "desc" },
    take: 50,
  });

  const totalBuyers = buyerOrders.length;
  const recentBuyers = buyerOrders.slice(0, 3).map((o) => ({
    name: (o.shippingName ?? "").trim().split(" ")[0] ?? "Clienta",
    avatar: o.user.image ?? null,
  }));

  const recommended: CollectionProduct[] = (product.category.products as any[]).map((p) => ({
    images: (p.images as { url: string }[]).map((i) => i.url),
    name: p.name,
    slug: p.slug,
    price: Number(p.basePrice),
    oldPrice: p.comparePrice ? Number(p.comparePrice) : undefined,
    badge: computeProductBadge({
      isProductNew: p.isProductNew,
      isProductNewAt: p.isProductNewAt,
      isOnSale: p.isOnSale,
    }),
    colors:
      (p.colors as any[]).length > 0
        ? (p.colors as any[]).map((c) => ({
            name: c.name,
            hexCode: c.hexCode,
            imageUrl: c.images[0]?.url ?? null,
          }))
        : undefined,
  }));

  const productReviews: TestimonialItem[] = (product.reviews as any[]).map((r) => ({
    rating: r.rating as number,
    comment: (r.comment as string | null) ?? "",
    name: (r.user?.name as string | null) ?? "Clienta",
    date: new Date(r.createdAt as string).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
    }),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-[#C19A6B]/20">
      <AnnouncementBar />
      <Header />
      <div className="flex-1 w-full">
        <ProductClient
          product={uiProduct}
          recommended={recommended}
          existingReview={userReview}
          isAuthenticated={!!userEmail}
          reviews={productReviews}
          socialProof={{ totalBuyers, recentBuyers }}
        />
      </div>
      <Footer />
    </div>
  );
}
