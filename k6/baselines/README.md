# k6 baselines — /tienda (Fase 0)

## Cómo medir

```bash
# Tras next build && next start (puerto 3000 o el que uses)
k6 run k6/shop-listing.js --env BASE_URL=http://localhost:3000 --out json=k6/baselines/shop-listing-YYYYMMDD.json
k6 run k6/shop-search.js --env BASE_URL=http://localhost:3000 --out json=k6/baselines/shop-search-YYYYMMDD.json

# Si k6 CLI no está instalado (proxy Node, single-process):
BASE_URL=http://localhost:3001 npm run bench:shop-baseline
```

Nunca medir contra `next dev`.

## Baseline Fase 0 — 2026-08-27

Entorno: `next build` + `next start -p 3001`, catálogo con **500** productos `seed-perf-*`.
Herramienta: `scripts/bench-shop-baseline.mjs` (k6 CLI no estaba en PATH).

| Escenario | p50 | p95 | avg | fails | Objetivo p95 |
|-----------|-----|-----|-----|-------|--------------|
| shop-listing | 741 ms | **1527 ms** | 861 ms | 0 | < 500 ms |
| shop-search | 1733 ms | **2663 ms** | 1644 ms | 0 | < 120 ms |

Archivos: `shop-listing-20260827.json`, `shop-search-20260827.json`, `fase0-summary-20260827.md`.

Conclusión Fase 0: listing ~3× por encima del objetivo; search ~22×. Confirma trabajo O(catálogo) antes de Fase 1.
