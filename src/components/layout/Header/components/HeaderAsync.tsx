import { prisma } from "@/lib/prisma";
import HeaderClient from "./HeaderClient";
import type { NavCategory } from "../types";

async function getNavCategories(): Promise<NavCategory[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { name: "asc" },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
        },
        products: {
          where: { status: "ACTIVE" },
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
          take: 8,
        },
      },
    });
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      subcategories: cat.subcategories,
      products: cat.products,
    }));
  } catch {
    return [];
  }
}

export default async function HeaderAsync() {
  const categories = await getNavCategories();
  return <HeaderClient categories={categories} />;
}
