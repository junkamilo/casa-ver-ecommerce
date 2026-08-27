/**
 * Baseline proxy cuando k6 CLI no está instalado.
 * Misma superficie que k6/shop-listing.js y k6/shop-search.js (menos VUs reales).
 *
 * Uso (tras `next build && next start`):
 *   node scripts/bench-shop-baseline.mjs
 *   BASE_URL=http://localhost:3000 node scripts/bench-shop-baseline.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "k6", "baselines");

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1),
  );
  return sorted[idx];
}

function summarize(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  return {
    count: sorted.length,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    max: sorted[sorted.length - 1] ?? 0,
    avg: sorted.length
      ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length)
      : 0,
  };
}

async function timedGet(path) {
  const start = Date.now();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Accept: "text/html",
      "User-Agent": "bench-shop-baseline/1.0",
    },
  });
  const ms = Date.now() - start;
  const text = await res.text();
  return { status: res.status, ms, bytes: text.length };
}

async function runListing(iterations = 30) {
  const paths = ["/tienda", "/tienda?page=2", "/tienda?page=5"];
  const samples = [];
  let fails = 0;
  for (let i = 0; i < iterations; i++) {
    const path = paths[i % paths.length];
    const r = await timedGet(path);
    samples.push(r.ms);
    if (r.status !== 200) fails += 1;
  }
  return { ...summarize(samples), fails, scenario: "shop-listing" };
}

async function runSearch(iterations = 20) {
  const seq = ["p", "pa", "pan", "pant"];
  const samples = [];
  let fails = 0;
  for (let i = 0; i < iterations; i++) {
    for (const q of seq) {
      const r = await timedGet(`/tienda?q=${encodeURIComponent(q)}`);
      samples.push(r.ms);
      if (r.status !== 200) fails += 1;
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  return { ...summarize(samples), fails, scenario: "shop-search" };
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  console.log(`Baseline contra ${BASE_URL} (proxy Node; preferir k6 CLI si está instalado)`);

  const listing = await runListing();
  console.log("shop-listing", listing);

  const search = await runSearch();
  console.log("shop-search", search);

  const payload = {
    measuredAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    tool: "scripts/bench-shop-baseline.mjs",
    note: "Proxy single-process. Re-correr con k6 CLI para carga multi-VU.",
    targets: {
      shop_listing_p95_ms: 500,
      shop_search_p95_ms: 120,
    },
    results: { listing, search },
  };

  const listingPath = join(outDir, `shop-listing-${date}.json`);
  const searchPath = join(outDir, `shop-search-${date}.json`);
  writeFileSync(listingPath, JSON.stringify({ ...payload, results: listing }, null, 2));
  writeFileSync(searchPath, JSON.stringify({ ...payload, results: search }, null, 2));
  writeFileSync(
    join(outDir, `fase0-summary-${date}.md`),
    `# Baseline Fase 0 — ${date}

Base URL: \`${BASE_URL}\`
Herramienta: Node proxy (\`scripts/bench-shop-baseline.mjs\`) — k6 CLI no disponible en este entorno.

| Escenario | p50 | p95 | avg | fails | Objetivo p95 |
|-----------|-----|-----|-----|-------|--------------|
| shop-listing | ${listing.p50} ms | ${listing.p95} ms | ${listing.avg} ms | ${listing.fails} | < 500 ms |
| shop-search | ${search.p50} ms | ${search.p95} ms | ${search.avg} ms | ${search.fails} | < 120 ms |

Archivos: \`${listingPath}\`, \`${searchPath}\`
`,
  );

  console.log(`Guardado en k6/baselines/*-${date}.*`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
