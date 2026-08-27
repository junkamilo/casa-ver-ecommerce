/**
 * k6 Baseline — /tienda listing (Fase 0)
 *
 * Mide TTFB/duración del documento RSC de Tienda (páginas 1, 2 y 5).
 *
 * REQUISITO: medir contra `next build && next start` (o preview Vercel),
 * NUNCA contra `next dev` / Turbopack.
 *
 * Instalar k6: https://k6.io/docs/get-started/installation/
 * Ejecutar:
 *   k6 run k6/shop-listing.js --env BASE_URL=http://localhost:3000
 *   k6 run k6/shop-listing.js --out json=k6/baselines/shop-listing-$(date +%Y%m%d).json
 *
 * Thresholds documentados (objetivo futuro p(95)<500ms). En Fase 0 NO
 * abortan el run — solo se registran para comparar fases siguientes.
 */

import http from "k6/http";
import { sleep, check, group } from "k6";
import { Trend, Rate } from "k6/metrics";

const shopListingDuration = new Trend("shop_listing_duration", true);
const shopListingFail = new Rate("shop_listing_fail_rate");

export const options = {
  scenarios: {
    shop_listing: {
      executor: "constant-vus",
      vus: 20,
      duration: "60s",
    },
  },
  thresholds: {
    // Objetivo Fase 1+: p(95)<500. Fase 0 solo documenta; abortOnFail false.
    shop_listing_duration: [
      { threshold: "p(95)<500", abortOnFail: false },
      { threshold: "p(50)<1500", abortOnFail: false },
    ],
    http_req_failed: [{ threshold: "rate<0.05", abortOnFail: false }],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

const PATHS = ["/tienda", "/tienda?page=2", "/tienda?page=5"];

export default function shopListingScenario() {
  const headers = {
    Accept: "text/html,application/xhtml+xml",
    "User-Agent": "k6-shop-listing/1.0",
  };

  for (const path of PATHS) {
    group(`listing_${path}`, () => {
      const start = Date.now();
      const res = http.get(`${BASE_URL}${path}`, { headers, tags: { path } });
      const ms = Date.now() - start;
      shopListingDuration.add(ms);
      shopListingFail.add(res.status !== 200);

      check(res, {
        "status 200": (r) => r.status === 200,
        "body not empty": (r) => (r.body || "").length > 500,
      });
    });
    sleep(0.2);
  }

  sleep(0.5);
}
