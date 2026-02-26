import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const category = await prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bannerImage: true as any,
        isActive: true,
      },
    });

    if (!category) return new NextResponse("Not found", { status: 404 });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_SLUG_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
