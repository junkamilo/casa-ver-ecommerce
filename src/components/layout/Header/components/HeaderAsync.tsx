import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import HeaderClient from "./HeaderClient";
import type { NavCategory } from "../types";

async function getNavCategories(): Promise<NavCategory[]> {
  noStore(); // Las categorías deben reflejar la BD en tiempo real — nunca cachear
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { order: "asc" },
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
