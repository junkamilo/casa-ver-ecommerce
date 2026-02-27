import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import ProductClient from "./components/ProductClient";
import { UIProduct, RecommendedProduct } from "./types";

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

  const product = await prisma.product.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      images: { orderBy: { order: "asc" } },
      colors: {
        include: {
          images: { orderBy: { order: "asc" } },
          variants: {
            where: { isActive: true },
            select: { size: true, stock: true },
            orderBy: { size: "asc" },
          },
        },
      },
      category: {
        include: {
          products: {
            where: { status: "ACTIVE", slug: { not: slug } },
            take: 4,
            include: {
              images: {
                where: { colorId: null },
                take: 1,
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!product) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userReview = userId
    ? ((await (prisma.review as any).findUnique({
        where: { userId_productId: { userId, productId: product.id } },
        select: { rating: true, comment: true },
      })) as { rating: number; comment: string | null } | null)
    : null;

  const allGeneralImages = product.images
    .filter((img) => !img.colorId)
    .map((img) => img.url);

  const isVideoUrl = (url: string) =>
    /\.(mp4|mov|avi|webm|mkv|ogg)$/i.test(url);

  const dbVideoUrl = (product as any).videoUrl as string | null;
  const videoUrlFromImages = !dbVideoUrl
    ? (allGeneralImages.find(isVideoUrl) ?? null)
    : null;
  const resolvedVideoUrl = dbVideoUrl ?? videoUrlFromImages;

  const totalStock = product.colors.reduce(
    (acc, color) => acc + color.variants.reduce((s, v) => s + v.stock, 0),
    0
  );

  const uiProduct: UIProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: Number(product.basePrice),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    material: product.material,
    careInfo: product.careInfo,
    videoUrl: resolvedVideoUrl,
    generalImages: allGeneralImages.filter((url) => !isVideoUrl(url)),
    colors: product.colors.map((color) => ({
      id: color.id,
      name: color.name,
      hex: color.hexCode,
      images: color.images.map((img) => img.url).filter((url) => !isVideoUrl(url)),
      availableSizes: color.variants.filter((v) => v.stock > 0).map((v) => v.size as string),
    })),
    rating: (product as any).rating ?? 0,
    numReviews: (product as any).numReviews ?? 0,
    stock: totalStock,
  };

  const recommended: RecommendedProduct[] = product.category.products.map(
    (p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.basePrice),
      imageUrl: p.images[0]?.url ?? null,
    })
  );

  return (
    // INNOVACIÓN DE LAYOUT: Fondo blanco puro, flexbox para estructurar el footer y color de selección dorado
    <div className="min-h-screen flex flex-col bg-white selection:bg-[#C19A6B]/20">
      <AnnouncementBar />
      <Header />
      
      {/* El flex-1 asegura que el contenido principal empuje el footer hacia abajo */}
      <div className="flex-1 w-full">
        <ProductClient
          product={uiProduct}
          recommended={recommended}
          existingReview={userReview}
          isAuthenticated={!!userEmail}
        />
      </div>
      
      <Footer />
    </div>
  );
}
