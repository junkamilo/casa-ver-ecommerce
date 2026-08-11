/**
 * k6 Load Test — Casa Verde eCommerce
 *
 * Simula 100 usuarios concurrentes haciendo el flujo completo:
 * Homepage → Búsqueda → Producto → Carrito → Checkout
 *
 * Instalar k6: https://k6.io/docs/get-started/installation/
 * Ejecutar:    k6 run k6/checkout.js --env BASE_URL=https://casaverdeoficial.com
 * Dev local:   k6 run k6/checkout.js --env BASE_URL=http://localhost:3000
 */

import http from "k6/http";
import { sleep, check, group } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

// ── Métricas personalizadas ───────────────────────────────────────────────────

const checkoutAttempts  = new Counter("checkout_attempts");
const cartSyncErrors    = new Rate("cart_sync_error_rate");
const searchLatency     = new Trend("search_latency_ms");
const productLatency    = new Trend("product_page_latency_ms");

// ── Configuración del test ────────────────────────────────────────────────────

export const options = {
  stages: [
    { duration: "30s", target: 20  },  // Ramp-up gradual
    { duration: "30s", target: 60  },  // Subir a 60 VUs
    { duration: "60s", target: 100 },  // Carga sostenida: 100 VUs
    { duration: "60s", target: 100 },  // Mantener pico por 1 minuto
    { duration: "30s", target: 0   },  // Ramp-down
  ],
  thresholds: {
    // 95% de requests deben responder en menos de 2s
    http_req_duration:    ["p(95)<2000"],
    // Tasa de errores HTTP < 1%
    http_req_failed:      ["rate<0.01"],
    // Errores en carrito < 5%
    cart_sync_error_rate: ["rate<0.05"],
    // Búsqueda < 1.5s en el percentil 95
    search_latency_ms:    ["p(95)<1500"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// Slugs y IDs de prueba — ajustar con datos reales de la BD
const PRODUCT_SLUGS = [
  "camisa-lino-verde",
  "blusa-algodon-organico",
  "pantalon-sostenible",
];

// ── Flujo principal ───────────────────────────────────────────────────────────

export default function checkoutScenario() {
  const headers = {
    "Content-Type":  "application/json",
    "Accept":        "application/json",
    "User-Agent":    "k6-load-test/1.0",
  };

  // 1. Homepage
  group("01_homepage", () => {
    const res = http.get(`${BASE_URL}/`, { headers });
    check(res, {
      "homepage 200": (r) => r.status === 200,
      "homepage < 3s": (r) => r.timings.duration < 3000,
    });
    sleep(0.5);
  });

  // 2. Búsqueda de productos
  group("02_search", () => {
    const queries = ["camisa", "blusa", "pantalon", "vestido"];
    const q = queries[Math.floor(Math.random() * queries.length)];

    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/search?q=${q}`, { headers });
    searchLatency.add(Date.now() - start);

    check(res, {
      "search 200":       (r) => r.status === 200,
      "search json":      (r) => r.headers["Content-Type"]?.includes("application/json"),
      "search < 429":     (r) => r.status !== 429,
    });
    sleep(0.3);
  });

  // 3. Página de producto
  group("03_product_page", () => {
    const slug = PRODUCT_SLUGS[Math.floor(Math.random() * PRODUCT_SLUGS.length)];

    const start = Date.now();
    const res = http.get(`${BASE_URL}/product/${slug}`, { headers });
    productLatency.add(Date.now() - start);

    check(res, {
      "product 200 or 404": (r) => r.status === 200 || r.status === 404,
      "product < 2s":       (r) => r.timings.duration < 2000,
    });
    sleep(1);
  });

  // 4. Sincronizar carrito (simula agregar un producto)
  group("04_cart_sync", () => {
    const cartPayload = JSON.stringify({
      items: [
        {
          variantId:  `variant-${Math.floor(Math.random() * 100)}`,
          productId:  `product-${Math.floor(Math.random() * 50)}`,
          sku:        `SKU-${Math.floor(Math.random() * 1000)}`,
          name:       "Producto de prueba k6",
          price:      89900,
          imageUrl:   null,
          color:      "Verde",
          size:       "M",
          quantity:   1,
        },
      ],
    });

    const res = http.post(`${BASE_URL}/api/cart/sync`, cartPayload, { headers });
    const failed = res.status >= 500;
    cartSyncErrors.add(failed);

    check(res, {
      "cart no 5xx":  (r) => r.status < 500,
      "cart < 429":   (r) => r.status !== 429,
    });
    sleep(0.5);
  });

  // 5. Colección de productos (simula navegación por categoría)
  group("05_collection", () => {
    const collections = ["ropa", "accesorios"];
    const col = collections[Math.floor(Math.random() * collections.length)];

    const res = http.get(`${BASE_URL}/collections/${col}`, { headers });
    check(res, {
      "collection 200 or 404": (r) => r.status === 200 || r.status === 404,
    });
    sleep(0.5);
  });

  // 6. Checkout — registrar intento (sin completar pago, Bold lo gestiona)
  group("06_checkout_page", () => {
    checkoutAttempts.add(1);
    const res = http.get(`${BASE_URL}/checkout`, { headers });
    // 200 (con sesión) o 302 (redirect a login para invitados) son válidos
    check(res, {
      "checkout reachable": (r) => r.status < 500,
    });
    sleep(1);
  });

  sleep(Math.random() * 2); // pausa aleatoria entre 0-2s (simula comportamiento humano)
}
