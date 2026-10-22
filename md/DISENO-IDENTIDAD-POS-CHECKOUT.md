# Diseño — Identidad POS en carrito, checkout y pedidos

> **Por qué existe:** `ARQUITECTURA-DEFINITIVA-WEB.md` propone leer el catálogo del POS (Fases 2–4) y luego apagar
> la sincronización y borrar los modelos de catálogo de Neon (Fases 5–6). Eso no es posible hoy: **el carrito, el
> checkout, las reservas, los pedidos, las reseñas y los cupones identifican cada prenda por IDs de Neon**
> (`ProductVariant.id`, `Product.id`). Si la PDP pintara variantes del POS, el checkout lanzaría
> `VariantNotFoundError`. Este documento diseña el cambio de identidad que desbloquea las Fases 2–6.
>
> Estado: Fase 1 del documento de arquitectura hecha (`pos-catalog.read.ts` + `revalidatePosProduct` en el
> webhook). **Pasos B, C, D, E, G y H hechos, y la capa web propia (§8)**. Pendientes: F, I, J.
>
> **Dato de producción (2026-10-20):** 79 productos activos creados en la web (sin `posSlug`), de los cuales 8 son
> conjuntos. El camino legacy de Neon **no se puede retirar** hasta migrarlos al POS: el paso J queda bloqueado.

---

## 1. Dependencias verificadas en el código (2026-10-20)

| Dónde | Qué usa de Neon | Archivo |
|---|---|---|
| Agregar al carrito | `variantId` = `ProductVariant.id`, `productId` = `Product.id` | `use-product-client.ts:142`, `CartContext.tsx:157,195` |
| Carrito persistido | `CartItem.variantId/productId` (sin FK, `@@unique([cartId, variantId])`) | `api/cart/sync/route.ts` |
| Precio real + reserva | `productVariant.findUnique` → `priceOverride ?? product.basePrice`; `UPDATE product_variants SET reserved` | `prisma-checkout.repository.ts:97-130` |
| Conjuntos (sets) | `productItemVariant` + `UPDATE product_item_variants SET stock` | `prisma-checkout.repository.ts:133-178` |
| Pago confirmado | `productVariant.update { stock -, reserved - }` | `prisma-order.repository.ts:72-85` |
| Pago fallido/expirado | `productVariant.update { reserved - }` / `productItemVariant { stock + }` | `prisma-order.repository.ts:254-277` |
| Pre-chequeo POS | variante Neon → `product.posSlug` + `parsePosVariantSku(sku)` | `verify-pos-availability.use-case.ts` |
| Reporte al POS | `product.posSlug` por `OrderItem.productId` | `report-order-to-pos.use-case.ts:20-27` |
| Cupones con alcance | `scopeProductIds` (= `Product.id`), `scopeCategoryIds` (= `Category.id`) | `coupon-eligibility.ts` |
| Reseñas | `Review.productId` **FK** a `Product`; rating cacheado en `Product.rating` | `prisma-product-detail.repository.ts` |
| Reservas | `StockReservation.variantId` **FK** a `ProductVariant` | `schema.prisma` |
| Stock bajo (stats) | `productVariant.findMany` | `adminCatalog/stats/stats.use-cases.ts:453` |
| Contabilidad | `variantId` del pedido | `modules/accounting/**` |
| Admin de productos | crea/edita `Product`, variantes, sets en Neon | `adminCatalog/**`, `app/actions/products.ts` |

**Dos hechos que hacen el cambio barato:**
1. El SKU de toda variante del POS ya es su identidad completa: `pos-<slug>-<colorId>-<sizeId>`
   (`buildPosVariantSku`), y `parsePosVariantSku` ya la descompone. Ya se guarda en `CartItem.sku` y `OrderItem.sku`.
2. Para productos del POS, `Product.slug` = `posSlug` (`prisma-pos-sync.repository.ts:149`), así que las URLs
   `/product/<slug>` indexadas no cambian.

---

## 2. Decisión: la identidad de una prenda del POS es su SKU del POS

Para ítems del POS, en todo el flujo de compra:

| Campo | Hoy | Nuevo |
|---|---|---|
| `variantId` | `ProductVariant.id` (cuid) | `pos-<slug>-<colorId>-<sizeId>` (= SKU) |
| `productId` | `Product.id` (cuid) | **slug del producto** (la URL `/product/<slug>`), para productos del POS **y** de la web. El checkout lo normaliza (`productSlugsByKeys`) aunque el carrito traiga el id viejo; las búsquedas en Neon aceptan id o slug (`src/lib/product-keys.ts`). |

No se cambian nombres de columnas ni tipos (todo sigue siendo `String`). El discriminador es el formato:
`parsePosVariantSku(variantId) !== null` → ítem del POS; si no, ítem **legacy** de Neon (producto web o set),
que sigue por el camino actual sin cambios. Así los dos mundos conviven sin flag de despliegue.

```ts
// src/modules/checkout/domain/line-identity.ts (nuevo)
export type LineRef =
  | { kind: "pos"; slug: string; colorId: number; sizeId: number; sku: string }
  | { kind: "legacy"; variantId: string };

export function resolveLine(variantId: string): LineRef {
  const combo = parsePosVariantSku(variantId);
  return combo
    ? { kind: "pos", slug: posSlugFromSku(variantId), ...combo, sku: variantId }
    : { kind: "legacy", variantId };
}
```

---

## 3. Cambios por pieza

### 3.1 PDP y tarjetas (Fases 2–3 del doc de arquitectura)
- `get-product-detail.use-case.ts`: POS-first con `fetchProductForRender(slug)` → `mapPosProduct` → nuevo
  `mapPosToUIProduct` que emite `UIColorVariant.variantId = sku` y `UIProduct.id = slug`. Fallback a Neon
  (legacy) y `source: "POS" | "NEON_LEGACY"` en log.
- `UIColor.id` pasa a ser `pos-<slug>-<colorId>` (solo se usa como key de React).
- Listados/colecciones/home/búsqueda: un **snapshot completo del catálogo** cacheado con tag `pos-products`
  (`listProducts()` del POS, todas las páginas) y filtro/orden/paginación **en memoria**. Con el tamaño actual
  del catálogo (cientos de productos) es más simple y rápido que pedir al POS un endpoint por cada vista, y
  resuelve la Fase 4 (búsqueda) sin endpoint nuevo. Etiquetas → banderas con `mapPosLabels`; `?tipo=` con
  `classifications[].garmentTypeSlug`; categorías por `categoryWebId`.

### 3.2 Checkout (`prisma-checkout.repository.ts`)
Por cada línea, `resolveLine(item.variantId)`:
- **pos** → precio real = `salePrice` de `getProduct(slug)` (cliente no-store, consultado **antes** del
  `$transaction` como ya se hace con el envío, para no retener la conexión). Disponibilidad: ya la garantiza
  `verifyPosAvailability` antes de este punto. **No** se hace `UPDATE product_variants`.
- **legacy** → camino actual intacto.

### 3.3 Reserva de stock (decisión importante)
Hoy la reserva de 15 min en Neon es **contra un stock nominal** (99 / 2 según `POS_STOCK_AVAILABLE/LOW`), no
contra unidades reales: ya no protege de verdad. La protección real es `POST /orders/check` antes de cobrar +
`postOrder` idempotente que rechaza si no alcanza (y avisa al admin para reembolsar).

- **Recomendado:** para líneas POS no reservar en la web. Se mantiene el riesgo actual (ventana entre el check y el
  pago) sin empeorarlo.
- **Opcional (requiere POS):** `POST /orders/hold` con TTL 15 min y `POST /orders/hold/{id}/release`, para cerrar esa
  ventana. Se puede añadir después sin tocar la identidad.

### 3.4 Pago confirmado / fallido (`prisma-order.repository.ts`)
Ambos bucles: si `resolveLine(item.variantId).kind === "pos"` → `continue` (el inventario lo descuenta el POS con
`postOrder`). Legacy igual que hoy.

### 3.5 Pre-chequeo y reporte al POS
- `verifyPosAvailability`: líneas POS se arman directo desde el `variantId` (sin consultar Neon). Legacy: igual.
  Se elimina el `upsertPosProduct` de refresco cuando la Fase 5 apague el sync.
- `report-order-to-pos`: `posSlugsOf` deja de consultar `Product`; si `parsePosVariantSku(item.sku)` existe, el
  slug sale del propio ítem. `buildPosOrderPayload` ya usa `item.sku` para color/talla.

### 3.6 Cupones con alcance
- Promociones del POS ya llegan con `productSlugs` y `categoryWebIds` (`posPromotionScopeSchema`). Se guardan
  **tal cual** en `scopeProductIds`/`scopeCategoryIds` en lugar de traducirlos a IDs de Neon.
- `eligibleVariantIds`: para líneas POS, producto = slug y categorías = `classifications` del snapshot del POS
  (padre/hijo con `parentWebId`). Legacy: igual.
- Cupones nativos de la web con alcance por productos/categorías: migración de datos (§4) traduce sus IDs a
  slug/webId cuando el producto/categoría tiene espejo del POS.

### 3.7 Reseñas
- `Review.productId` → nueva columna `productSlug String` (indexada) y se **quita la FK** a `Product`. Unicidad
  `@@unique([orderId, productSlug])`.
- `Product.rating/numReviews` dejan de existir: se calculan con `review.aggregate` por slug (o tabla
  `ProductRating { slug, rating, numReviews }` si el agregado pesa).
- La verificación de compra (`findPaidOrderForProduct`) pasa a buscar `OrderItem.productId = slug`.
- **Ojo, se rompe en el paso D si no se atiende antes:** `findPaidOrderForProduct` y `getBuyerOrders` (prueba
  social de la PDP) filtran `OrderItem.productId = Product.id`. Pedidos nuevos con `productId = slug` dejarían de
  contar hasta que G esté hecho; G debe ir junto con D o buscar por `productId IN (id, slug)`.

### 3.8 Otros consumidores
- **Stats de stock bajo:** se alimenta de `variants[].lowStock` del snapshot del POS.
- **Contabilidad:** usa `variantId`/`sku` como texto; revisar que no haga join a `ProductVariant`.
- **Admin de productos (`adminCatalog`, `actions/products.ts`):** en el estado final el catálogo se administra en
  el POS. El admin web queda **solo lectura** para productos POS (ya lo es en parte) y se retira cuando no queden
  legacy.

---

## 4. Migración de datos (una vez, idempotente)

```sql
-- Carritos: cuid → SKU del POS
UPDATE cart_items ci SET "variantId" = pv.sku, "productId" = p."posSlug"
FROM product_variants pv JOIN products p ON p.id = pv."productId"
WHERE ci."variantId" = pv.id AND p."posSlug" IS NOT NULL AND pv.sku LIKE 'pos-%';

-- Pedidos (histórico): mismo mapeo; ya tienen snapshot de nombre/precio/color/talla.
UPDATE order_items oi SET "variantId" = pv.sku, "productId" = p."posSlug"
FROM product_variants pv JOIN products p ON p.id = pv."productId"
WHERE oi."variantId" = pv.id AND p."posSlug" IS NOT NULL AND pv.sku LIKE 'pos-%';

-- Reseñas: llenar productSlug antes de soltar la FK.
UPDATE reviews r SET "productSlug" = p.slug FROM products p WHERE r."productId" = p.id;

-- Cupones: traducir alcance a slugs / webIds (script TS, son arrays).
```

Las reservas abiertas (`stock_reservations`) no se migran: un pedido creado con id de Neon se paga o se libera por
el camino de Neon; uno creado con SKU del POS no reservó nada. Ambos conviven.

**Carritos (hecho en el paso C, sin SQL ni endpoint):** cada ítem del carrito ya guarda su `sku`, así que
`CartContext.withPosLineId` pone `variantId = sku` al hidratar `localStorage` (carrito y "comprar ahora"), al
agregar y en "comprar ahora". `cart_items` en la BD no necesita migración: el navegador lo reemplaza completo en
cada `/api/cart/sync` y solo lo lee el correo de carrito abandonado (nombre, precio, foto). Por eso las sentencias
de `cart_items` de arriba ya no hacen falta.

---

## 5. Orden de implementación

| Paso | Entregable | Riesgo |
|---|---|---|
| A | ✅ Precondición medida: 79 legacy activos (8 conjuntos). Decisión pendiente: migrarlos al POS o mantener el camino legacy indefinidamente. | — |
| B | ✅ `parsePosLineId` (`pos-mapper.ts`). Checkout (`pos-line-prices.ts`), pago y liberación (`prisma-order.repository.ts`), `verifyPosAvailability`, reporte/anulación al POS, cupones (`neonProductIdsOf`) y contabilidad aceptan **ambos** formatos. Nada emite el formato nuevo todavía. Tests: `verify-pos-availability.test.ts`, `pos-line-prices.test.ts`. | Bajo |
| C | ✅ `CartContext.withPosLineId`: los carritos (nuevos y guardados) usan el SKU del POS como `variantId`. **Desde aquí los pedidos nuevos llegan con el formato nuevo**: el código del paso B queda en uso real. | Medio |
| D | ✅ PDP y SEO POS-first (`resolve-product-source.ts`, `pos-product-detail.entity.ts`): POS cacheado por tag + **capa web** leída de la copia en Neon (SEO, portada/video propios, oferta manual: el admin las edita aquí). Productos de la web → Neon. POS caído → copia en Neon. Log `source=POS|NEON_LEGACY`. Recomendados aún de Neon (paso E). | Medio |
| E | ✅ Catálogo de lectura (`modules/catalog/listing`): listado completo del POS (Data Cache, tag `pos-products`) + `product_web_settings` + productos de la web (Neon), más nuevo primero por `publishedAt`. Tienda, colecciones (categoría/`?tipo=`), más vendidos, nueva colección, home, buscador, sugeridos y recomendados del PDP. POS caído → copia de Neon. El webhook invalida datos y páginas sin depender de la sincronización. | Medio |
| F | Cupones por slug/webId + migración de alcances. | Medio |
| G | ✅ Reseñas por `productSlug` + `productName` sin FK (migración `20261020000000_product_slug_identity`). PDP, admin, cron de solicitudes y enlace por correo. | Medio |
| H | ✅ Misma migración: `order_items` y `cart_items` pasan `productId` → slug. | Bajo |
| I | Fase 5: webhook solo revalida; se retiran `sync-product`, `PrismaPosSyncRepository` (catálogo), cron de catálogo. | Alto, reversible re-activando el sync |
| J | Fase 6: borrar modelos de catálogo de `schema.prisma` (solo si A dio cero legacy, o tras migrarlos). | Alto, irreversible |

B es compatible hacia atrás y se puede desplegar sola. Cada paso posterior es desplegable por separado.

## 6. Lo que se le pide al POS
1. **Orden estable en listados:** `createdAt` (o `sortOrder`) en `posProductSchema`; hoy solo hay `updatedAt` y
   la tienda ordena por `createdAt desc`.
2. **Cache headers / ETag** en `/products` (paginado), no solo en el detalle.
3. *(Opcional)* `POST /orders/hold` para reservar durante el pago (§3.3).

## 7. Criterios de aceptación adicionales
- Un carrito con ítems en formato viejo (cuid) y nuevo (SKU) se puede pagar y llega completo al POS.
- `modules/checkout/__tests__` y `posIntegration/__tests__` verdes, con casos nuevos para líneas POS.
- Tras el paso I, `SELECT count(*) FROM products` no cambia al editar un producto en el POS, y la tienda refleja el
  cambio en < 5 s.

## 8. Capa web propia (`product_web_settings`) — hecho
Migración `20261020120000_product_web_settings`: tabla por slug con lo que **de verdad** decide la web sobre un
producto del POS, copiada de la fila `products`:

| Campo | Regla |
|---|---|
| `metaTitle`, `metaDescription` | SEO del PDP; por defecto nombre/descripción del POS |
| `coverImageUrl` | portada elegida en la web; vale si es foto propia o una foto del POS que el producto aún tiene |
| `videoUrl` | video propio de la web; si no, el del POS |
| `isOnSale`, `isOnSaleAt` | oferta manual; la etiqueta ON_SALE del POS manda |
| `isNew` | "Nueva colección" (bandera solo de la web) |
| `publishedAt` | alta en la tienda: ordena los listados (el POS no envía `createdAt`). Backfill = `products.createdAt`; productos nuevos: la registra el webhook/sincronización (`ensure`) |

No se guardan destacado, nuevo-con-fecha, sugerido ni tipos de prenda: la sincronización ya los pisaba con las
etiquetas/clasificaciones del POS, así que el POS es la fuente. El admin (`update-pos-managed-product`) escribe
en `product_web_settings` y sigue escribiendo la copia en `products` porque su pantalla la lee.

## 9. Lo que falta para apagar la copia del catálogo en Neon (paso I)
1. **Admin de productos:** lista y edita desde `products`. Para productos del POS debe leer del catálogo de lectura
   y editar solo `product_web_settings`.
2. **Taxonomía:** los listados ubican productos con `categories.posWebId` y `garment_types` de Neon, que mantiene
   `sync-pos-categories`. Es taxonomía, no catálogo; puede quedarse o leerse de `/categories` del POS.
3. **Checkout con POS caído:** `pos-line-prices.ts` y `verifyPosAvailability` usan la copia como respaldo.
4. **Cupones con alcance (paso F)** y **contabilidad/estadísticas**: traducen a ids de Neon (`neonProductIdsOf`).
5. **Stock bajo en el admin** (`getLowStockAlerts`) y **respaldo de PDP/listados** si el POS no responde.
6. Paso J: además, los 79 productos creados en la web siguen viviendo en `products` (decisión de negocio).
