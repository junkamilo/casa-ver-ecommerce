# Arquitectura Definitiva — Tienda `casa-ver-ecommerce`

> **Alcance:** este documento es para el repo de la **tienda web**. El gemelo para el backend vive en `pos-backend-casa-verde/md/ARQUITECTURA-DEFINITIVA-POS.md`.
>
> **Decisión en una línea:** no se cambia de framework (Next.js 16 es lo correcto) y **no se activa `cacheComponents`/`'use cache'`**. El único cambio real es mover la **ruta de lectura del catálogo** de Neon al POS, cacheada con `revalidateTag`, y apagar los `sync-*` que replican el catálogo en Neon. Todo lo demás (webhook, firma, idempotencia, flujo de órdenes/stock) ya está bien construido.

---

## 0. Estado real verificado (no suposiciones)

Leído directamente del repo el 2026-10-20:

| Cosa | Realidad en el código |
|---|---|
| Framework | **Next.js `16.1.6`**, React `19.2.3` (`package.json`) |
| Modelo de caché | `revalidateTag` + `revalidatePath` + `experimental.staleTimes.dynamic:0`. **`cacheComponents` NO está activado** (`next.config.ts`). No hay ninguna directiva `'use cache'`. |
| ORM / DB | Prisma `^5.22` + `@prisma/adapter-neon` `^7.4.2` sobre Neon (drift de versión conocido) |
| Integración POS | Módulo completo `src/modules/posIntegration/` ya existe |
| Webhook | `src/app/api/pos-webhook/route.ts` → `receive-pos-webhook.use-case.ts`: verifica firma HMAC, deduplica por `eventId` (`PosWebhookEvent`), responde rápido y procesa en `after()` |
| Lectura de catálogo (PDP/listados) | **Sale de Neon** vía `prisma-product-detail.repository`, `prisma-shop.repository`, `prisma-search.repository` |
| Cliente del POS | `pos-catalog.client.ts` con `cache: "no-store"` en todo (hoy solo se usa para sincronizar y para órdenes en vivo) |
| Órdenes/stock contra POS | **Ya construido**: `verifyPosAvailability` (pre-cobro), `postOrder` (idempotente, descuenta inventario), `checkPosStock`, `postOrderCancellation`, `getPosOrderStatus`, `postOrderStatus` |
| Respaldo | `vercel.json`: cron `/api/cron/pos-sync` 06:00 UTC y `/api/cron/pos-orders` 06:30 UTC |

**Conclusión del diagnóstico:** la duplicación que molesta **no está en el webhook ni en las órdenes** (eso ya quedó fino). Está en que la tienda **renderiza leyendo su copia Neon del catálogo**, copia que los `sync-*` mantienen. Matar la duplicación = mover la lectura al POS. Nada más.

---

## 1. Correcciones al documento anterior (`arquitectura-definitiva-casa-verde.md`)

Ese documento se escribió sin ver el código. Tras inspeccionarlo, estas tres cosas cambian:

1. **❌ NO activar `cacheComponents` / `'use cache'` como paso 1.** Era la recomendación estrella del doc anterior y, con el stack real, es la decisión equivocada: la tienda ya corre en producción con `revalidateTag`/`revalidatePath`, que en Next 16 siguen siendo APIs plenamente soportadas. `cacheComponents` obliga a envolver todo en `Suspense`, vuelve todo dinámico por defecto y es una migración grande y arriesgada que **no aporta nada** al objetivo (quitar la BD duplicada). Queda como optimización **opcional y futura**, no como requisito.
2. **✅ La garantía anti-sobreventa ya existe.** El doc anterior la marcaba como "gap". El POS es idempotente por `orderNumber` y descuenta inventario por línea; la web pre-verifica con `verifyPosAvailability` antes de abrir la pasarela. No hay que construir nada ahí.
3. **✅ El webhook ya manda el `slug`.** El doc anterior pedía "que el POS envíe el slug". Ya lo hace: para productos, el campo `id` del webhook **es** el slug (`md/integracion-web-casa-verde.md` §3; `process-pos-event.use-case.ts` llama `syncProductBySlug(id)`).

Lo que **sí** sobrevive del doc anterior: no cambiar de framework, POS como única fuente de verdad, coexistencia dual con fallback, SEO sin caídas, y observabilidad del `source`.

---

## 2. El cambio real: mover la LECTURA del catálogo de Neon al POS

Hoy (duplicación):

```
Visitante → PDP/listado → prisma-product-detail.repository → Neon (copia del catálogo)
                                                                 ▲
Webhook POS → receive → process-pos-event → syncProductBySlug → upsert en Neon
```

Objetivo (headless):

```
Visitante → PDP/listado → catalog-read (POS, cacheado con tags) → POS API pública
                                        └── fallback → Neon (solo productos legacy no migrados)
Webhook POS → receive → process-pos-event → revalidateTag(product-<slug>)  ← ya NO escribe catálogo en Neon
```

### 2.1 Caché de las lecturas: `revalidateTag`, NO `'use cache'`

El cliente actual (`pos-catalog.client.ts`) usa `cache: "no-store"` porque hoy solo sirve para sincronizar y para órdenes en vivo (que **deben** ser no-store, no se tocan). Para las **lecturas de catálogo** que se van a mover al POS, se crean funciones de lectura cacheadas con tags. El POS ya responde `Cache-Control: public, max-age=60` + `ETag`, así que la caché de datos de Next encaja perfecto.

```typescript
// src/modules/posIntegration/infrastructure/pos-catalog.read.ts  (NUEVO; separado del cliente no-store)
import "server-only";
import { getPosApiConfig } from "./pos-config";

const PRODUCT_TAG = (slug: string) => `pos-product-${slug}`;
const PRODUCTS_TAG = "pos-products";

export async function fetchProductForRender(slug: string): Promise<unknown | null> {
  const { baseUrl, apiKey } = getPosApiConfig();
  const res = await fetch(`${baseUrl}/products/${encodeURIComponent(slug)}`, {
    headers: { "X-Api-Key": apiKey, Accept: "application/json" },
    // Caché de datos de Next (NO cacheComponents): se purga por tag desde el webhook.
    next: { tags: [PRODUCTS_TAG, PRODUCT_TAG(slug)], revalidate: 3600 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`POS ${res.status} en /products/${slug}`);
  return (await res.json()).data ?? null;
}
```

> **Regla:** las funciones de **órdenes y disponibilidad en vivo** (`checkPosStock`, `verifyPosAvailability`, `postOrder`, …) se quedan en `pos-catalog.client.ts` con `cache: "no-store"`. Solo las de **catálogo para render** se mueven a este lector cacheado. No mezclar los dos.

### 2.2 Resolver híbrido (POS primero → Neon legacy)

El `get-product-detail.use-case.ts` hoy hace `repository.getProductDetail(slug)` contra Neon. Pasa a resolver POS-first con fallback, devolviendo `source` para observabilidad:

```typescript
// Pseudo — dentro de get-product-detail.use-case.ts
const pos = await fetchProductForRender(slug);               // POS, cacheado por tag
if (pos) return { source: "POS", product: mapPosToDetail(pos) };

const legacy = await repository.getProductDetail(slug);      // Neon, solo legacy
if (legacy?.status === "ACTIVE") return { source: "NEON_LEGACY", product: legacy };

return null; // notFound() real en ambos
```

Mismo patrón para listados/colecciones (`prisma-shop.repository` / `collections`) y para el menú (ya cacheado con `POS_CATEGORIES_CACHE_TAG` en `revalidate-catalog.ts`).

### 2.3 El webhook deja de escribir el catálogo en Neon

`process-pos-event.use-case.ts` hoy, para `product`, llama `syncProductBySlug(id)` que hace **upsert en Neon**. En el estado final se reemplaza por pura invalidación de tags (el `sync-product.use-case.ts` y `PrismaPosSyncRepository` se retiran para catálogo):

```typescript
// Estado final de process-pos-event (producto)
if (entityType === "product") {
  revalidateTag("pos-products");
  revalidateTag(`pos-product-${id}`);        // id = slug
  revalidatePath(`/product/${id}`);
  return { status: "revalidated", id };
}
```

> Esto se hace **por tipo de entidad y de forma gradual** (ver §4). Mientras un tipo siga leyéndose de Neon, su `sync-*` sigue vivo.

---

## 3. Lo que NO se toca (ya está correcto)

- **Firma + dedup del webhook** (`verify-signature.ts`, `PosWebhookEvent`, respuesta rápida + `after()`). Intacto.
- **Flujo de compra** (`create-order.use-case.ts` → `verifyPosAvailability` → `createOrderTransaction` con reserva 15 min → pago → `postOrder` idempotente). Intacto.
- **Cron de respaldo** `/api/cron/pos-sync` y `/api/cron/pos-orders`: se mantienen como red de seguridad hasta terminar la migración (Fase 5), luego el de catálogo se retira.
- **Stock en vivo**: sigue `no-store` (ni se cachea ni se mueve).

---

## 4. Roadmap por tipo de entidad (sin caídas)

Se migra la **lectura** de un tipo a la vez; cada tipo mantiene su `sync-*` hasta que su lectura ya salga del POS.

| Fase | Entregable | Archivos tocados |
|---|---|---|
| **1 — Lector cacheado** | Crear `pos-catalog.read.ts` con tags; no cambia comportamiento todavía | nuevo archivo |
| **2 — Producto (PDP)** | `get-product-detail` resuelve POS-first + fallback Neon, devuelve `source` | `modules/catalog/product/**` |
| **3 — Listados/colecciones/menú** | `shop`, `collections`, header leen del POS cacheado; el menú ya usa tag | `modules/catalog/shop/**`, `modules/collections/**` |
| **4 — Búsqueda** | `prisma-search.repository` pasa a usar el POS (⚠ requiere que el POS exponga búsqueda — ver doc del POS §3) | `modules/search/**` |
| **5 — Apagar duplicación** | `process-pos-event` solo revalida tags; se retiran `sync-product`, `sync-pos-categories`, `sync-promotion` (catálogo), `PrismaPosSyncRepository`; se borra el cron de catálogo | `modules/posIntegration/**`, `vercel.json` |
| **6 — Decomiso de modelos Neon** | Eliminar del `schema.prisma` los modelos de catálogo | `prisma/schema.prisma` + migración |

### Modelos Prisma a eliminar en Fase 6 (verificados en `schema.prisma`)
`Product` (`posSlug`), `ProductColor`, `ProductImage`, `ProductVariant`, `ProductItem`, `ProductItemColor`, `ProductItemImage`, `ProductItemVariant`, `Category` (`posWebId`), `ProductCategory`, `GarmentType`, `CategoryGarmentType`, `ProductGarmentType`, `Color`, y `Coupon`/`CouponUsage`/`CouponBatch` **con `source = POS`** (los cupones nativos de web, si los hay, se quedan).

### Modelos Prisma que SE QUEDAN (son de la web, no del POS)
`User`, `Account`, `Address`, tokens de auth, `Order`, `OrderItem`, `AccountingSaleExport`, `Cart`, `CartItem`, `StockReservation`, `Review`, `PromoPopup`, `HeroSlide`/`HeroSettings`, `Country`/`Department`/`Municipality`/`ShippingConfig`/`ShippingRate` (geografía/envíos — aunque se concilien con el POS), `PosWebhookEvent`, `WebhookLog`, `AdminNotification`.

> ⚠ **Ojo con las FKs:** `Order`/`OrderItem`, `Review` y `StockReservation` referencian `Product`/`ProductVariant`. Antes de borrar esos modelos hay que decidir si los pedidos históricos guardan un snapshot (nombre, slug, precio) en vez de FK. Esto es lo más delicado del decomiso; no borrar `Product` hasta resolverlo.

---

## 5. Criterios de aceptación

1. **Cero caídas:** ninguna URL de producto/categoría indexada responde 404/500 durante la coexistencia (el fallback a Neon lo garantiza).
2. **Lectura cacheada:** ≥95 % de los renders de catálogo se sirven desde la Data Cache de Next; el POS no recibe un golpe por visita.
3. **Invalidación < 5 s:** cambiar precio/stock en el POS se refleja en la tienda vía `revalidateTag` del webhook.
4. **Observabilidad:** se puede reportar el % de catálogo servido con `source: "POS"` vs `"NEON_LEGACY"` (log por request).
5. **Sin regresiones de compra:** el flujo `verifyPosAvailability → createOrderTransaction → postOrder` sigue idéntico y verde en los tests `modules/checkout/__tests__`.

---

### Resumen
El framework es el correcto y el caché actual también. Lo único que estorba es que la tienda lee su copia Neon del catálogo. El plan definitivo es mover esa lectura al POS (cacheada con `revalidateTag`, sin `cacheComponents`), apagar los `sync-*` de catálogo, y recién al final borrar los modelos Prisma del catálogo con cuidado por las FKs de pedidos. El resto del sistema —webhook, firma, idempotencia, órdenes y stock— ya está bien y no se toca.
