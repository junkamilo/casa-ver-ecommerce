import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return false;
  return true;
}

export interface StockAlert {
  type: "product" | "color";
  productId: string;
  productName: string;
  colorId?: string;
  colorName?: string;
}

// GET — devuelve alertas de stock en tiempo real (sin persistencia en DB)
export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      colors: {
        select: {
          id: true,
          name: true,
          variants: { select: { stock: true } },
        },
      },
    },
  });

  const alerts: StockAlert[] = [];

  for (const product of products) {
    const colorsWithVariants = product.colors.filter((c) => c.variants.length > 0);
    if (colorsWithVariants.length === 0) continue;

    const productTotalStock = colorsWithVariants.reduce(
      (acc, c) => acc + c.variants.reduce((s, v) => s + v.stock, 0),
      0
    );

    if (productTotalStock === 0) {
      // Toda la prenda agotada — una sola alerta por producto
      alerts.push({ type: "product", productId: product.id, productName: product.name });
    } else {
      // Solo colores agotados dentro de una prenda que aún tiene stock
      for (const color of colorsWithVariants) {
        const colorStock = color.variants.reduce((s, v) => s + v.stock, 0);
        if (colorStock === 0) {
          alerts.push({
            type: "color",
            productId: product.id,
            productName: product.name,
            colorId: color.id,
            colorName: color.name,
          });
        }
      }
    }
  }

  return NextResponse.json({ alerts, total: alerts.length });
}
