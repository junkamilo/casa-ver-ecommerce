import { NextRequest, NextResponse } from "next/server";
import { getCatalog } from "@/modules/catalog/listing/application/get-catalog";
import { toCard } from "@/modules/catalog/listing/domain/catalog-entry.entity";
import { transformProduct } from "@/modules/collections/domain/product-mapper.entity";

/** Siempre fresco tras marcar/desmarcar en el POS o el admin (evita servir [] cacheado). */
export const dynamic = "force-dynamic";
export const revalidate = 0;

const TAKE = 12;

/** Popup "Te podría interesar": etiqueta SUGGEST_POPUP del POS (o bandera de la web), más reciente primero. */
export async function GET(request: NextRequest) {
  const excludeSlug = request.nextUrl.searchParams.get("excludeSlug")?.trim() || null;

  const suggested = (await getCatalog())
    .filter((entry) => entry.isSuggested && entry.slug !== excludeSlug)
    .sort(
      (a, b) =>
        (b.suggestedAt?.getTime() ?? 0) - (a.suggestedAt?.getTime() ?? 0) ||
        b.publishedAt.getTime() - a.publishedAt.getTime(),
    )
    .slice(0, TAKE);

  return NextResponse.json(
    suggested.map((entry) => {
      const card = transformProduct(toCard(entry));
      return {
        name: card.name,
        slug: card.slug,
        price: card.price,
        minPrice: null,
        image: card.images[0] ?? card.colors?.find((c) => c.imageUrl)?.imageUrl ?? null,
        isSet: card.isSet ?? false,
      };
    }),
  );
}
