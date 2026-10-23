import { NextResponse } from "next/server";
import { getCategoryBySlugUseCase } from "@/modules/collections/application/get-category-by-slug.use-case";

// GET /api/categories/[slug] — colección (categoría o subcategoría) del POS por slug.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const category = await getCategoryBySlugUseCase(slug);
  if (!category) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json(
    {
      name: category.name,
      slug: slug.trim().toLowerCase(),
      description: category.description,
      image: category.image,
      isActive: true,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
