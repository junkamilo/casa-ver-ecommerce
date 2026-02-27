import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
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

  const product = await prisma.product.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      images: { orderBy: { order: "asc" } },
      colors: {
        include: {
          images: { orderBy: { order: "asc" } },
          variants: {
            where: { isActive: true, stock: { gt: 0 } },
            select: { size: true },
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

  const allGeneralImages = product.images
    .filter((img) => !img.colorId)
    .map((img) => img.url);

  const isPlayableVideo = (url: string) =>
    url.includes("/video/upload/") && /\.(mp4|mov|avi|webm|mkv|ogg)$/i.test(url);

  const videoUrlFromImages = allGeneralImages.find(isPlayableVideo) ?? null;

  const uiProduct: UIProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    basePrice: Number(product.basePrice),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    material: product.material,
    careInfo: product.careInfo,
    videoUrl: (product as any).videoUrl ?? videoUrlFromImages,
    generalImages: allGeneralImages.filter((url) => !isPlayableVideo(url)),
    colors: product.colors.map((color) => ({
      id: color.id,
      name: color.name,
      hex: color.hexCode,
      images: color.images.map((img) => img.url),
      availableSizes: color.variants.map((v) => v.size as string),
    })),
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
    <div className="bg-background min-h-screen">
      <AnnouncementBar />
      <Header />
      <ProductClient product={uiProduct} recommended={recommended} />
      <Footer />
    </div>
  );
}
