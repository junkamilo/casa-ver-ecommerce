/**
 * Carga inicial del catálogo del POS en la web.
 *
 * Sin --apply muestra un informe: qué productos del POS se vincularían con registros
 * existentes de la web (mismo slug) y cuáles se crearían. Con --apply ejecuta la sincronización
 * completa llamando a /api/cron/pos-sync del servidor indicado (la lógica vive en la app).
 *
 * Uso:
 *   node scripts/pos-initial-sync.mjs                                  # informe (dry-run)
 *   node scripts/pos-initial-sync.mjs --apply                          # contra http://localhost:3000
 *   node scripts/pos-initial-sync.mjs --apply --url=https://casaverdeoficial.com
 *
 * Variables: POS_API_BASE_URL, POS_API_KEY, CRON_SECRET, DATABASE_URL (.env / .env.local).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
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

const APPLY = process.argv.includes("--apply");
const TARGET_URL = (
  process.argv.find((arg) => arg.startsWith("--url="))?.slice("--url=".length) ?? "http://localhost:3000"
).replace(/\/+$/, "");

async function posGet(path, query = {}) {
  const base = process.env.POS_API_BASE_URL?.replace(/\/+$/, "");
  const key = process.env.POS_API_KEY;
  if (!base || !key) throw new Error("Faltan POS_API_BASE_URL o POS_API_KEY");
  const url = new URL(`${base}${path}`);
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, String(v));
  const res = await fetch(url, { headers: { "X-Api-Key": key, Accept: "application/json" } });
  if (!res.ok) throw new Error(`POS ${res.status} en ${path}`);
  return (await res.json()).data;
}

async function report() {
  const prisma = new PrismaClient();
  try {
    const categories = await posGet("/categories");
    const products = [];
    for (let page = 0; ; page++) {
      const data = await posGet("/products", { page, size: 100 });
      products.push(...data.items);
      if (data.items.length === 0 || products.length >= data.total) break;
    }

    const allCategories = categories.flatMap((c) => [c, ...(c.subcategories ?? [])]);
    const localCategories = await prisma.category.findMany({
      where: { slug: { in: allCategories.map((c) => c.slug) } },
      select: { slug: true },
    });
    const localProducts = await prisma.product.findMany({
      where: { slug: { in: products.map((p) => p.slug) } },
      select: { slug: true, posSlug: true },
    });
    const catBySlug = new Map(localCategories.map((c) => [c.slug, c]));
    const prodBySlug = new Map(localProducts.map((p) => [p.slug, p]));

    const summarize = (items, bySlug, linkedKey, idKey) => {
      const out = { yaVinculados: 0, seVinculan: [], seCrean: 0, conflictos: [] };
      for (const item of items) {
        const local = bySlug.get(item.slug);
        if (!local) out.seCrean++;
        else if (local[linkedKey] === item[idKey]) out.yaVinculados++;
        else if (local[linkedKey] == null) out.seVinculan.push(item.slug);
        else out.conflictos.push(item.slug);
      }
      return out;
    };

    console.log(`POS: ${allCategories.length} categorías/subcategorías, ${products.length} productos`);
    // Las categorías no se guardan en la web; solo se usa su slug para asociar productos.
    console.log("Categorías (no se modifican):", {
      conCategoriaWeb: allCategories.filter((c) => catBySlug.has(c.slug)).map((c) => c.slug),
      sinCategoriaWeb: allCategories.filter((c) => !catBySlug.has(c.slug)).map((c) => c.slug),
    });
    console.log("Productos:", summarize(products, prodBySlug, "posSlug", "slug"));
    console.log("\nEjecute con --apply para sincronizar.");
  } finally {
    await prisma.$disconnect();
  }
}

async function apply() {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error("Falta CRON_SECRET");
  console.log(`Sincronizando contra ${TARGET_URL}/api/cron/pos-sync ...`);
  const res = await fetch(`${TARGET_URL}/api/cron/pos-sync`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await res.json().catch(() => ({}));
  console.log(`HTTP ${res.status}`);
  console.log(JSON.stringify(body, null, 2));
  if (!res.ok) process.exitCode = 1;
}

(APPLY ? apply() : report()).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
