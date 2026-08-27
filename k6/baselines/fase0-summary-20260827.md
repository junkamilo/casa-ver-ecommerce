# Baseline Fase 0 — 20260827

Base URL: `http://localhost:3001`
Herramienta: Node proxy (`scripts/bench-shop-baseline.mjs`) — k6 CLI no disponible en este entorno.

| Escenario | p50 | p95 | avg | fails | Objetivo p95 |
|-----------|-----|-----|-----|-------|--------------|
| shop-listing | 741 ms | 1527 ms | 861 ms | 0 | < 500 ms |
| shop-search | 1733 ms | 2663 ms | 1644 ms | 0 | < 120 ms |

Archivos: `C:\casa-ver-ecommerce\k6\baselines\shop-listing-20260827.json`, `C:\casa-ver-ecommerce\k6\baselines\shop-search-20260827.json`
