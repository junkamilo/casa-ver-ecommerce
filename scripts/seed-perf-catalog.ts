/**
 * Seed de catálogo para benchmarks de /tienda (Fase 0).
 *
 * Genera 500 productos ACTIVE con prefijo slug `seed-perf-` (idempotente).
 *
 * Uso:
 *   CONFIRM_SEED_PERF=1 npx tsx scripts/seed-perf-catalog.ts
 *   CONFIRM_SEED_PERF=1 npx tsx scripts/seed-perf-catalog.ts --force
 *   CONFIRM_SEED_PERF=1 npx tsx scripts/seed-perf-catalog.ts --cleanup
 *
 * Guards: aborta en NODE_ENV=production, URLs de app de producción, o
 * DATABASE_URL que coincida con PROD_DB_HOST_MARKERS.
 */

import { PrismaClient, type Size } from "@prisma/client";

const SLUG_PREFIX = "seed-perf-";
const TOTAL_PRODUCTS = 500;
const SET_RATIO = 0.2;
const BATCH_SIZE = 25;

/** Hosts/subcadenas que nunca deben recibir este seed. Ampliar si hay Neon de prod dedicado. */
const PROD_DB_HOST_MARKERS: string[] = [
  // Placeholder: añadir ep-xxx de producción si se separa del staging.
];

const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
];

const COLOR_PALETTE = [
  { name: "Negro", hexCode: "#111111" },
  { name: "Blanco", hexCode: "#F5F5F5" },
  { name: "Verde Militar", hexCode: "#4B5320" },
  { name: "Beige", hexCode: "#D4C4A8" },
  { name: "Terracota", hexCode: "#C17A5A" },
  { name: "Azul Noche", hexCode: "#1B2A4A" },
  { name: "Rosa Palo", hexCode: "#E8B4B8" },
  { name: "Gris", hexCode: "#8A8A8A" },
];

const SIZES: Size[] = ["S", "M", "L"];

const LONG_DESCRIPTION = `
Prenda de performance seed para medir el listado de tienda bajo carga realista.
Tejido suave con caída natural, ideal para uso diario y ocasiones casuales.
Incluye costuras reforzadas, etiqueta interior de algodón y acabado premium.
Cuidado: lavar a máquina en frío, no usar blanqueador, secar a la sombra.
Composición: 95% algodón orgánico, 5% elastano. Hecho en Colombia con
estándares de calidad Casa Verde. Esta descripción es intencionalmente larga
para simular el peso de texto que el buscador full-scan descarga al filtrar
candidatos en memoria (Fase 0 — baseline antes de optimizar search).
`.trim().repeat(3);

const prisma = new PrismaClient();

function assertSafeEnvironment(argv: string[]) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Abortado: NODE_ENV=production. No se puede seedear en producción.");
  }

  const dbUrl = process.env.DATABASE_URL ?? "";
  for (const marker of PROD_DB_HOST_MARKERS) {
    if (marker && dbUrl.includes(marker)) {
      throw new Error(
        `Abortado: DATABASE_URL coincide con host de producción (${marker}).`,
      );
    }
  }

  const confirmed =
    process.env.CONFIRM_SEED_PERF === "1" || argv.includes("--force");
  if (!confirmed) {
    throw new Error(
      "Abortado: define CONFIRM_SEED_PERF=1 o pasa --force para confirmar el seed.",
    );
  }

  const appUrl = (
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    ""
  ).toLowerCase();
  if (appUrl.includes("casaverdeoficial.com")) {
    console.warn(
      "⚠️  NEXTAUTH_URL/APP_URL parece producción. El seed escribe en DATABASE_URL actual — confirma que no sea la BD live.",
    );
  }
}

async function cleanupSeedProducts() {
  const deleted = await prisma.product.deleteMany({
    where: { slug: { startsWith: SLUG_PREFIX } },
  });
  console.log(`Cleanup productos: ${deleted.count} eliminados (slug ${SLUG_PREFIX}*).`);

  await prisma.category.deleteMany({
    where: { slug: { startsWith: SLUG_PREFIX } },
  });
  await prisma.garmentType.deleteMany({
    where: { slug: { startsWith: SLUG_PREFIX } },
  });
  console.log("Cleanup categorías y tipos de prenda seed-perf-* listo.");
}

async function ensureTaxonomy() {
  const garmentTypes = await Promise.all(
    [
      { name: "Pantalón Perf", slug: `${SLUG_PREFIX}pantalon`, order: 1 },
      { name: "Blusa Perf", slug: `${SLUG_PREFIX}blusa`, order: 2 },
      { name: "Vestido Perf", slug: `${SLUG_PREFIX}vestido`, order: 3 },
    ].map((gt) =>
      prisma.garmentType.upsert({
        where: { slug: gt.slug },
        update: { name: gt.name, isActive: true, order: gt.order },
        create: { ...gt, isActive: true },
      }),
    ),
  );

  const categories = await Promise.all(
    [
      { name: "Colección Perf A", slug: `${SLUG_PREFIX}cat-a`, order: 1 },
      { name: "Colección Perf B", slug: `${SLUG_PREFIX}cat-b`, order: 2 },
    ].map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, isActive: true, order: cat.order },
        create: { ...cat, isActive: true },
      }),
    ),
  );

  for (const cat of categories) {
    for (const gt of garmentTypes) {
      await prisma.categoryGarmentType.upsert({
        where: {
          categoryId_garmentTypeId: {
            categoryId: cat.id,
            garmentTypeId: gt.id,
          },
        },
        update: {},
        create: { categoryId: cat.id, garmentTypeId: gt.id },
      });
    }
  }

  return { categories, garmentTypes };
}

function pickColors(index: number) {
  const count = 4 + (index % 5); // 4–8
  return COLOR_PALETTE.slice(0, count);
}

function imageFor(i: number, j: number) {
  return IMAGE_URLS[(i + j) % IMAGE_URLS.length];
}

async function createSimpleProductSafe(
  index: number,
  categoryId: string,
  garmentTypeId: string,
) {
  const slug = `${SLUG_PREFIX}simple-${String(index).padStart(4, "0")}`;
  const colors = pickColors(index);
  const cover = imageFor(index, 0);
  const basePrice = 45000 + (index % 40) * 2500;

  const product = await prisma.product.create({
    data: {
      name: `Perf Simple ${index}`,
      slug,
      description: LONG_DESCRIPTION,
      basePrice,
      comparePrice: basePrice + 15000,
      status: "ACTIVE",
      isSet: false,
      coverImageUrl: cover,
      categories: { create: [{ categoryId }] },
      garmentTypes: { create: [{ garmentTypeId }] },
      images: {
        create: [
          { url: cover, order: 0, isCover: true },
          { url: imageFor(index, 1), order: 1, isCover: false },
        ],
      },
    },
  });

  for (let ci = 0; ci < colors.length; ci++) {
    const c = colors[ci];
    const color = await prisma.productColor.create({
      data: {
        productId: product.id,
        name: c.name,
        hexCode: c.hexCode,
      },
    });
    await prisma.productImage.create({
      data: {
        productId: product.id,
        colorId: color.id,
        url: imageFor(index, ci),
        order: 0,
        isCover: true,
      },
    });
    await prisma.productVariant.createMany({
      data: SIZES.map((size) => ({
        productId: product.id,
        colorId: color.id,
        size,
        sku: `${slug}-${c.name.toLowerCase().replace(/\s+/g, "-")}-${size}`,
        stock: 5 + (index % 10),
      })),
    });
  }
}

async function createSetProductSafe(
  index: number,
  categoryId: string,
  garmentTypeId: string,
) {
  const slug = `${SLUG_PREFIX}set-${String(index).padStart(4, "0")}`;
  const cover = imageFor(index, 0);

  const product = await prisma.product.create({
    data: {
      name: `Perf Set ${index}`,
      slug,
      description: LONG_DESCRIPTION,
      basePrice: 0,
      status: "ACTIVE",
      isSet: true,
      coverImageUrl: cover,
      categories: { create: [{ categoryId }] },
      garmentTypes: { create: [{ garmentTypeId }] },
      images: {
        create: [{ url: cover, order: 0, isCover: true }],
      },
    },
  });

  const itemCount = 2 + (index % 2); // 2–3
  for (let ii = 0; ii < itemCount; ii++) {
    const item = await prisma.productItem.create({
      data: {
        productId: product.id,
        name: `Pieza ${ii + 1}`,
        description: "Subpieza seed-perf",
        price: 55000 + ii * 10000,
        comparePrice: 70000 + ii * 10000,
        isCardFeatured: ii === 0,
        order: ii,
        coverImageUrl: imageFor(index, ii),
      },
    });
    const itemColor = await prisma.productItemColor.create({
      data: {
        itemId: item.id,
        name: COLOR_PALETTE[ii % COLOR_PALETTE.length].name,
        hexCode: COLOR_PALETTE[ii % COLOR_PALETTE.length].hexCode,
      },
    });
    await prisma.productItemImage.create({
      data: {
        colorId: itemColor.id,
        url: imageFor(index, ii),
        order: 0,
        isCover: true,
      },
    });
    await prisma.productItemVariant.createMany({
      data: SIZES.map((size) => ({
        colorId: itemColor.id,
        size,
        sku: `${slug}-item${ii}-${size}`,
        stock: 8,
      })),
    });
  }
}

async function seedProducts(
  categoryIds: string[],
  garmentTypeIds: string[],
) {
  const setCount = Math.round(TOTAL_PRODUCTS * SET_RATIO);
  const simpleCount = TOTAL_PRODUCTS - setCount;

  console.log(
    `Creando ${simpleCount} simples + ${setCount} sets (${TOTAL_PRODUCTS} total)...`,
  );

  for (let start = 0; start < simpleCount; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE, simpleCount);
    const batch = [];
    for (let i = start; i < end; i++) {
      batch.push(
        createSimpleProductSafe(
          i,
          categoryIds[i % categoryIds.length],
          garmentTypeIds[i % garmentTypeIds.length],
        ),
      );
    }
    await Promise.all(batch);
    console.log(`  simples ${end}/${simpleCount}`);
  }

  for (let start = 0; start < setCount; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE, setCount);
    const batch = [];
    for (let i = start; i < end; i++) {
      const idx = simpleCount + i;
      batch.push(
        createSetProductSafe(
          idx,
          categoryIds[idx % categoryIds.length],
          garmentTypeIds[idx % garmentTypeIds.length],
        ),
      );
    }
    await Promise.all(batch);
    console.log(`  sets ${end}/${setCount}`);
  }
}

async function main() {
  const argv = process.argv.slice(2);
  assertSafeEnvironment(argv);

  if (argv.includes("--cleanup")) {
    await cleanupSeedProducts();
    return;
  }

  console.log("Cleanup previo (idempotente)...");
  await cleanupSeedProducts();

  const { categories, garmentTypes } = await ensureTaxonomy();
  await seedProducts(
    categories.map((c) => c.id),
    garmentTypes.map((g) => g.id),
  );

  const count = await prisma.product.count({
    where: { slug: { startsWith: SLUG_PREFIX }, status: "ACTIVE" },
  });
  console.log(`✅ Seed listo: ${count} productos ACTIVE con slug ${SLUG_PREFIX}*`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
