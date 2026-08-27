/**
 * k6 Baseline — /tienda search ?q= (Fase 0)
 *
 * Simula tipeo progresivo: q=p → pa → pan → pant (300 ms entre requests).
 * Cada hit re-renderiza el RSC completo (peor caso actual).
 *
 * REQUISITO: `next build && next start` o preview — NUNCA `next dev`.
 *
 * Ejecutar:
 *   k6 run k6/shop-search.js --env BASE_URL=http://localhost:3000
 *   k6 run k6/shop-search.js --out json=k6/baselines/shop-search-YYYYMMDD.json
 *
 * Threshold objetivo futuro: p(95)<120ms. Fase 0 solo registra (abortOnFail false).
 */

import http from "k6/http";
import { sleep, check, group } from "k6";
import { Trend, Rate } from "k6/metrics";

const shopSearchDuration = new Trend("shop_search_duration", true);
const shopSearchFail = new Rate("shop_search_fail_rate");

export const options = {
  scenarios: {
    shop_search: {
      executor: "constant-vus",
      vus: 10,
      duration: "60s",
    },
  },
  thresholds: {
    shop_search_duration: [
      { threshold: "p(95)<120", abortOnFail: false },
      { threshold: "p(50)<800", abortOnFail: false },
    ],
    http_req_failed: [{ threshold: "rate<0.05", abortOnFail: false }],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

const TYPING_SEQUENCE = ["p", "pa", "pan", "pant"];

export default function shopSearchScenario() {
  const headers = {
    Accept: "text/html,application/xhtml+xml",
    "User-Agent": "k6-shop-search/1.0",
  };

  group("typing_sequence", () => {
    for (const q of TYPING_SEQUENCE) {
      const start = Date.now();
      const res = http.get(`${BASE_URL}/tienda?q=${encodeURIComponent(q)}`, {
        headers,
        tags: { q },
      });
      const ms = Date.now() - start;
      shopSearchDuration.add(ms);
      shopSearchFail.add(res.status !== 200);

      check(res, {
        "status 200": (r) => r.status === 200,
      });

      sleep(0.3);
    }
  });

  sleep(0.5);
}
