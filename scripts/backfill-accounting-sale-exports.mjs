/**
 * Backfill: crea accounting_sale_exports para pedidos PAID/SHIPPED/DELIVERED
 * que aún no tienen snapshot. webhookStatus = SKIPPED.
 *
 * Uso:
 *   node scripts/backfill-accounting-sale-exports.mjs
 *   node scripts/backfill-accounting-sale-exports.mjs --apply
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const DRY_RUN = !process.argv.includes("--apply");
const BATCH = 50;
const STATUSES = ["PAID", "SHIPPED", "DELIVERED"];

const prisma = new PrismaClient();

function toNumber(value) {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value);
}

async function buildPayload(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { orderBy: { id: "asc" } },
      appliedCoupon: { select: { code: true } },
    },
  });
  if (!order) return null;

  const productIds = [...new Set(order.items.map((i) => i.productId))];
  const categoryLinks =
    productIds.length > 0
      ? await prisma.productCategory.findMany({
          where: { productId: { in: productIds } },
          select: {
            productId: true,
            category: { select: { name: true } },
          },
        })
      : [];

  const categoriesByProduct = new Map();
  for (const link of categoryLinks) {
    const list = categoriesByProduct.get(link.productId) ?? [];
    list.push(link.category.name);
    categoriesByProduct.set(link.productId, list);
  }

  return {
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paidAt: order.paidAt ? order.paidAt.toISOString() : null,
      createdAt: order.createdAt.toISOString(),
      paymentMethod: order.paymentMethod,
      customer: {
        name: order.shippingName,
        city: order.shippingCity,
        department: order.shippingDepartment,
        phone: order.shippingPhone,
        cedula: order.shippingCedula ?? null,
      },
      amounts: {
        subtotal: toNumber(order.subtotal),
        shippingCost: toNumber(order.shippingCost),
        discount: toNumber(order.discount),
        total: toNumber(order.total),
      },
      couponCode: order.appliedCoupon?.code ?? null,
    },
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      sku: item.sku,
      name: item.name,
      categories: categoriesByProduct.get(item.productId) ?? [],
      colorName: item.colorName,
      size: item.size,
      price: toNumber(item.price),
      quantity: item.quantity,
      total: toNumber(item.total),
      costPrice: null,
      imageUrl: item.imageUrl ?? null,
    })),
  };
}

async function main() {
  console.log("=== backfill-accounting-sale-exports ===");
  console.log(`Modo: ${DRY_RUN ? "DRY-RUN" : "APPLY"}`);

  let total = 0;
  for (;;) {
    const missing = await prisma.order.findMany({
      where: {
        status: { in: STATUSES },
        accountingSaleExport: null,
      },
      select: { id: true, orderNumber: true, paidAt: true, createdAt: true },
      orderBy: { paidAt: "asc" },
      take: BATCH,
    });

    if (missing.length === 0) break;

    console.log(`Lote: ${missing.length} pedidos sin snapshot...`);

    for (const row of missing) {
      const payload = await buildPayload(row.id);
      if (!payload) {
        console.warn(`  skip ${row.orderNumber}: no payload`);
        continue;
      }
      const paidAt = row.paidAt ?? row.createdAt;
      if (DRY_RUN) {
        console.log(`  [dry] ${row.orderNumber} items=${payload.items.length}`);
      } else {
        await prisma.accountingSaleExport.upsert({
          where: { orderId: row.id },
          create: {
            orderId: row.id,
            orderNumber: row.orderNumber,
            paidAt,
            payload,
            webhookStatus: "SKIPPED",
            webhookAttempts: 0,
          },
          update: {
            orderNumber: row.orderNumber,
            paidAt,
            payload,
            webhookStatus: "SKIPPED",
          },
        });
        console.log(`  ok ${row.orderNumber}`);
      }
      total += 1;
    }

    if (DRY_RUN) break; // dry-run: un lote basta para estimar
  }

  console.log(
    DRY_RUN
      ? `\n[DRY-RUN] Se procesarían al menos ${total} pedidos. Usa --apply.`
      : `\nOK — snapshots creados/actualizados: ${total}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
