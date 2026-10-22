
# Promociones en Casa Verde: cómo funcionan hoy en la web y cómo integrarlas con el POS

> **Para qué sirve este documento.** Primero describe de punta a punta cómo funcionan hoy las promociones
> en la web (`casa-ver-ecommerce`): modelos, campos, validaciones, endpoints y flujo en el checkout. Después
> propone cómo el **POS Casa Verde** debe crear y enviar las promociones y cómo la web las recibe, siguiendo
> el mismo patrón de la integración de catálogo que ya funciona (API pública + webhooks firmados + respaldo
> diario). Ver `integracion-web-casa-verde.md`, `contrato-pos-producto.json` y `contrato-pos-pedido.json`.
>
> Fuente: código de la rama `casa-verde-dev` (octubre 2026). Las rutas de archivo son relativas a `src/`.

---

## Índice

- [Parte A: cómo funcionan hoy](#parte-a--cómo-funcionan-hoy-las-promociones-en-la-web)
  - [A.1 Tipos de promoción](#a1-mapa-general-los-4-mecanismos-de-promoción)
  - [A.2 Oferta por producto (precio tachado y etiqueta)](#a2-oferta-por-producto-precio-tachado--etiqueta-en-oferta)
  - [A.3 Cupones (modelo de datos)](#a3-cupones-modelo-de-datos)
  - [A.4 Los 3 tipos de cupón](#a4-los-3-tipos-de-cupón)
  - [A.5 Vigencia (horarios en Bogotá)](#a5-vigencia-temporal-horarios-en-bogotá)
  - [A.6 Endpoints del admin](#a6-endpoints-del-admin)
  - [A.7 Flujo del cupón en el checkout](#a7-flujo-e2e-de-un-cupón-en-el-checkout)
  - [A.8 Popups de publicidad](#a8-popups-de-publicidad-promopopup)
  - [A.9 Envío gratis](#a9-envío-gratis-por-monto)
  - [A.10 Qué recibe el POS hoy](#a10-qué-recibe-hoy-el-pos-sobre-las-promociones)
  - [A.11 Limitaciones actuales](#a11-limitaciones-y-detalles-a-tener-en-cuenta)
- [Parte B: integración con el POS](#parte-b--integración-de-promociones-con-el-pos-casa-verde)
  - [B.1 Principios](#b1-principios-de-diseño)
  - [B.2 Ofertas por producto desde el POS](#b2-nivel-1--ofertas-por-producto-desde-el-pos)
  - [B.3 Cupones creados en el POS](#b3-nivel-2--cupones-creados-en-el-pos)
  - [B.4 Cómo crea el POS una promoción](#b4-cómo-debe-crear-el-pos-una-promoción-pantalla-y-validaciones)
  - [B.5 API pública de promociones](#b5-cómo-la-manda-el-pos-api-pública-de-promociones)
  - [B.6 Webhooks de promociones](#b6-cómo-la-manda-el-pos-avisos-webhook)
  - [B.7 Cómo la recibe la web](#b7-cómo-la-recibe-la-web-cambios-a-implementar)
  - [B.8 Uso del cupón y devolución al POS](#b8-uso-del-cupón-y-reporte-de-vuelta-al-pos)
  - [B.9 Promociones por producto o categoría](#b9-alcance-por-producto--categoría-fase-2)
  - [B.10 Casos de prueba](#b10-casos-de-prueba-e2e)
  - [B.11 Lista de tareas](#b11-checklist-de-implementación)

---

# PARTE A: cómo funcionan hoy las promociones en la web

## A.1 Mapa general: los 4 mecanismos de promoción

Hoy la web no tiene una sola entidad llamada "Promoción". Hay **cuatro mecanismos distintos** que se
combinan:

| # | Mecanismo | A qué aplica | Dónde se configura | ¿Cambia lo que se cobra? |
|---|---|---|---|---|
| 1 | **Oferta por producto**: `basePrice` + `comparePrice` (tachado) + etiqueta `isOnSale` | Un producto | Admin → Productos (o el POS, para productos del POS) | Sí: se cobra `basePrice` / `priceOverride`. `comparePrice` es solo visual. |
| 2 | **Cupones**: modelo `Coupon` de 3 tipos | El **pedido completo** (subtotal) | Admin → Promociones (pestañas "Cupones" y "Promocionales") y automático al registrarse | Sí: descuento sobre el subtotal |
| 3 | **Popups de publicidad**: `PromoPopup` | Visual: anuncia un código de cupón | Admin → Promociones → "Publicidad" | No por sí mismo (solo muestra un código) |
| 4 | **Envío gratis por monto**: `ShippingConfig.freeShippingThreshold` | El pedido | Admin → Envíos | Sí: envío = 0 si el subtotal neto alcanza el umbral |

> **Importante:** hoy **ningún cupón está asociado a productos ni a categorías**. Todo cupón descuenta
> sobre el subtotal del pedido completo. Lo único "por producto" es el precio tachado (`comparePrice`) y la
> etiqueta "En Oferta" (`isOnSale`). La sección [B.9](#b9-alcance-por-producto--categoría-fase-2) propone
> cómo agregar cupones con alcance por producto o categoría.

Diagrama del flujo completo:

```
                ┌────────────── PRODUCTO ──────────────┐
 Admin/POS ───► │ basePrice (se cobra)                 │ ──► Tarjeta / PDP: precio + "Antes" tachado
                │ comparePrice (tachado, solo visual)  │      + badge "En Oferta" si isOnSale
                │ isOnSale / isOnSaleAt (badge)        │
                └──────────────────────────────────────┘
                                   │ (carrito: precio real de BD)
                                   ▼
 Admin ──► Coupon ──► Checkout: validateCoupon(code,email) ──► createOrder (revalida + calcula en servidor)
            ▲                                                         │ Order.discount, appliedCouponId
 PromoPopup │ (muestra el código)                                     ▼
            │                                         Pago aprobado (Bold/Addi) ──► markPaid
 Registro ──┘ (cupón EMAIL_SINGLE 10%)                     │  consolida uso del cupón PROMOTIONAL
                                                          ▼
                                       POST /api/public/orders al POS (discount prorrateado + couponCode)
```

---

## A.2 Oferta por producto (precio tachado + etiqueta "En Oferta")

### Campos (tabla `products`, `prisma/schema.prisma`)

| Campo | Tipo | Significado |
|---|---|---|
| `basePrice` | `Decimal(10,2)` | **Precio de venta real.** Es el que se cobra. |
| `comparePrice` | `Decimal(10,2)?` | Precio "antes" (tachado). Solo se muestra; **no** interviene en el cobro. |
| `isOnSale` | `Boolean` | Activa el badge **"En Oferta"**. |
| `isOnSaleAt` | `DateTime?` | Cuándo se activó la oferta. No vence sola: solo queda registrado. |
| `isProductNew` / `isProductNewAt` | `Boolean` / `DateTime?` | Badge "Nuevo Producto". **Vence a los 7 días** de `isProductNewAt`. |

En las variantes (`product_variants`):

| Campo | Significado |
|---|---|
| `priceOverride` | `Decimal?`. Si existe, **reemplaza** a `basePrice` para esa variante (ej.: la XXL vale más). |

En los conjuntos (`ProductItem`), cada pieza tiene su propio `price` y `comparePrice`.

### Cómo se muestra

- **Badge** (`lib/productBadge.ts` → `computeProductBadge`), en este orden de prioridad:
  1. `stock === 0` → **"Agotado"**
  2. nuevo vigente (menos de 7 días) **y** `isOnSale` → **"Nuevo y en Oferta"** (verde `#154734`)
  3. nuevo vigente → **"Nuevo Producto"** (rojo)
  4. `isOnSale` → **"En Oferta"** (dorado `#C19A6B`)
- **Precio tachado**: en tarjetas (`components/ui/ProductCard.tsx`, campo `oldPrice` armado en
  `modules/collections/domain/product-mapper.entity.ts`) y en la página del producto
  (`app/product/[slug]/components/ProductClient.tsx`, bloque "Precio" / "Antes"). Se muestra si
  `comparePrice` existe. En los conjuntos se usa el `comparePrice` de la pieza representativa.

### Cómo se cobra

`modules/checkout/infrastructure/prisma-checkout.repository.ts` recalcula **en el servidor** el precio de
cada línea, sin confiar en el cliente:

```
precioReal = variant.priceOverride ?? product.basePrice        (producto normal)
precioReal = item.price ?? product.basePrice                   (pieza de conjunto)
subtotal   = Σ precioReal × cantidad
```

`comparePrice` e `isOnSale` **no participan**. La oferta "real" consiste en bajar `basePrice` y poner el
precio anterior en `comparePrice`.

### Cómo se edita

- **Productos creados en la web**: Admin → Productos → modal de producto (`GeneralInfoSection.tsx`). El
  interruptor "En Oferta" guarda `isOnSale=true` y `isOnSaleAt=ahora`. Lo procesa `app/actions/products.ts`.
- **Productos del POS** (`posSlug != null`): `basePrice` y `comparePrice` **los controla el POS** y se
  sobrescriben en cada sincronización. La web solo puede editar las etiquetas (`isOnSale`, `isProductNew`,
  `isFeatured`, `isSuggested`), la portada y el SEO, desde `PosProductModal.tsx` →
  `update-pos-managed-product.use-case.ts`. Cualquier otro campo responde *"Campos controlados por el POS"*.

### Lo que el POS ya envía para ofertas

En el contrato de catálogo (`contracts/pos-catalog.schema.ts`):

| Campo del POS | Campo en la web | Regla (`domain/pos-mapper.ts`) |
|---|---|---|
| `salePrice` | `basePrice` | Directo |
| `displayPrice` | `comparePrice` | Solo si `displayPrice > salePrice`; si no, `null` (`resolveComparePrice`) |
| `labels[].code = BEST_SELLER` | `isFeatured` | Etiqueta del POS |
| `labels[].code = PRODUCT_NEW` | `isProductNew` + `isProductNewAt = assignedAt` | Etiqueta del POS |
| `labels[].code = SUGGEST_POPUP` | `isSuggested` + `suggestedAt` | Etiqueta del POS |
| *(no existe)* | `isOnSale` | **No llega del POS**: hoy se marca a mano en la web |

---

## A.3 Cupones: modelo de datos

### Tabla `coupons` (`model Coupon`)

| Campo | Tipo | Default | Uso |
|---|---|---|---|
| `id` | `cuid` | | PK |
| `code` | `String @unique` | | Código que escribe el cliente. Se guarda en **MAYÚSCULAS**. |
| `kind` | `CouponKind` | `BATCH_SINGLE` | `BATCH_SINGLE` \| `EMAIL_SINGLE` \| `PROMOTIONAL` |
| `discountType` | `CouponDiscountType` | `PERCENTAGE` | `PERCENTAGE` \| `FIXED` |
| `discountValue` | `Int` | 10 | % (1–100) o pesos enteros (FIXED) |
| `discountPercentage` | `Int` | 10 | Campo heredado. Igual a `discountValue` si es %, **0** si es FIXED |
| `assignedEmail` | `String?` | | Solo `EMAIL_SINGLE`: correo dueño del cupón |
| `isUsed` / `usedAt` / `usedByOrderId` | | `false` | Solo cupones de un uso (BATCH/EMAIL) |
| `batchId` | `String?` | | Lote (`CouponBatch`) para `BATCH_SINGLE` |
| `maxGlobalUses` | `Int?` | | Máximo de usos en total (PROMOTIONAL: 1–10 000; los de un uso: 1) |
| `maxUsesPerUser` | `Int` | 1 | PROMOTIONAL: siempre **1** (`PROMOTIONAL_MAX_USES_PER_USER`) |
| `currentGlobalUses` | `Int` | 0 | Contador de usos **pagados** (solo PROMOTIONAL) |
| `expiresAt` | `DateTime?` | | Heredado: solo se usa si `scheduleMode = NONE` |
| `scheduleMode` | `CouponScheduleMode` | `NONE` | `NONE` \| `SINGLE_DAY` \| `DATE_RANGE` |
| `validFrom` / `validTo` | `DateTime?` (UTC) | | Ventana de vigencia |
| `isActive` | `Boolean` | `true` | Desactivación manual (PROMOTIONAL) |
| `codeSource` | `CouponCodeSource?` | | `RANDOM` \| `CUSTOM` |
| `label` | `String?` | | Etiqueta libre (no se usa en el flujo) |

### Tabla `coupon_usages` (`model CouponUsage`): un registro por uso de cupón PROMOTIONAL

| Campo | Uso |
|---|---|
| `couponId` | Cupón usado |
| `orderId` (`@unique`) | Pedido. Una orden puede tener como máximo un uso registrado. |
| `userId`, `email`, `documentId` (cédula) | Identidad del comprador. El límite de 1 uso por persona se revisa por **cualquiera** de los tres. |
| `usedAt` | Fecha del uso |

### Tabla `coupon_batches` (`model CouponBatch`)

`discountPercentage`, `quantity`, `createdById`. Agrupa cupones `BATCH_SINGLE` generados en lote.

### En el pedido (`orders`)

| Campo | Uso |
|---|---|
| `discount` | Monto total del descuento del cupón, en pesos |
| `appliedCouponId` | FK al cupón aplicado |
| `paymentExpiresAt` | Ahora + 30 min. "Congela" la vigencia del cupón mientras el cliente paga |
| `total` | `subtotal + shippingCost − discount` |

---

## A.4 Los 3 tipos de cupón

### 1. `BATCH_SINGLE`: cupones masivos de un solo uso (pestaña "Cupones")

- **Creación**: el admin indica `discountPercentage` (1–100) y `quantity` (1–100 por lote).
- Se generan códigos aleatorios de **12 caracteres** `[A-Z0-9]` (`domain/coupon-code.entity.ts`), con hasta
  5 reintentos si el código ya existe.
- Siempre son `PERCENTAGE`, con `maxGlobalUses = 1` y sin correo asignado.
- **Uso**: cualquier persona con cuenta registrada (el correo del checkout debe existir en `users`).
- Se marca `isUsed=true` **al crear la orden**. Si el pago falla o expira, se libera
  (`releaseOrderStock` en `orders/infrastructure/prisma-order.repository.ts`).
- Solo se puede eliminar si no se ha usado.

### 2. `EMAIL_SINGLE`: cupón de primera compra

- Se crea **automáticamente** con `generateFirstPurchaseCoupon(email)` (`app/actions/coupons.ts`) cuando
  un correo se registra o se suscribe al newsletter.
- Código `CV-XXXXXXXXXX` (10 caracteres hexadecimales), **10 %**, `assignedEmail` = ese correo.
- Es idempotente: si ese correo ya tiene uno sin usar, devuelve el mismo.
- Solo lo puede usar el correo asignado. Se consume y se libera igual que `BATCH_SINGLE`.

### 3. `PROMOTIONAL`: cupón promocional de usos múltiples (pestaña "Promocionales")

Es el tipo más parecido a una "promoción" de tienda y el que interesa para el POS.

**Campos de creación** (`createPromotionalCouponSchema` en
`modules/adminCatalog/coupons/contracts/coupon.schema.ts`):

| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| `codeSource` | `"RANDOM"` \| `"CUSTOM"` | Sí | |
| `code` | string | Solo si `CUSTOM` | Se pasa a mayúsculas, regex `^[A-Z0-9-]{4,20}$`, único. Prohibido si `RANDOM` |
| `discountType` | `"PERCENTAGE"` \| `"FIXED"` | Sí | |
| `discountValue` | int > 0 | Sí | % ≤ 100. FIXED ≤ 5 000 000 |
| `maxGlobalUses` | int | Sí | 1 – 10 000 |
| `scheduleEnabled` | boolean | No (default `false`) | Sin vigencia = válido siempre |
| `scheduleMode` | `"SINGLE_DAY"` \| `"DATE_RANGE"` | Si `scheduleEnabled` | |
| `singleDayDate` | `YYYY-MM-DD` | Si `SINGLE_DAY` | No puede ser anterior a hoy (hora de Bogotá) |
| `startTime` / `endTime` | `HH:mm` | Si `SINGLE_DAY` | `endTime > startTime` |
| `fromDate` / `toDate` | `YYYY-MM-DD` | Si `DATE_RANGE` | `fromDate ≥ hoy`, `toDate ≥ fromDate` |

**Valores que fija el servidor**: `kind=PROMOTIONAL`, `maxUsesPerUser=1`, `currentGlobalUses=0`,
`isActive=true`, `expiresAt=null`, `discountPercentage = discountValue` si es % (si no, 0).

**Estado calculado** (`getPromotionalCouponStatus`, se muestra en el listado):

| Estado | Condición (en este orden) |
|---|---|
| `INACTIVE` | `isActive = false` |
| `SCHEDULED` | ahora < `validFrom` |
| `EXPIRED` | ahora > `validTo` |
| `EXHAUSTED` | `currentGlobalUses ≥ maxGlobalUses` |
| `ACTIVE` | en cualquier otro caso |

**Reglas de uso**:
- Cualquier persona puede usarlo (no hace falta cuenta registrada ni correo asignado).
- **1 uso por persona**: se cuenta en `coupon_usages` por correo **o** cédula **o** usuario.
- El contador `currentGlobalUses` se incrementa **solo cuando el pago se aprueba**, no al crear la orden.
- **Desactivar** (`PATCH`): `isActive=false`. No se puede reactivar desde la interfaz.
- **Eliminar** (`DELETE`): solo si `currentGlobalUses = 0`.

### Cálculo del descuento (`calculateCouponDiscountAmount` en `checkout/domain/coupon.entity.ts`)

```ts
if (value <= 0 || subtotal <= 0) return 0;
FIXED      → Math.min(value, subtotal)                // nunca deja el subtotal negativo
PERCENTAGE → value > 100 ? subtotal : Math.round(subtotal * value / 100)
```

Se aplica sobre el **subtotal de productos**, nunca sobre el envío.

---

## A.5 Vigencia temporal (horarios en Bogotá)

`checkout/domain/coupon-schedule.ts` → `buildCouponSchedule`. Todo se interpreta en **America/Bogota
(UTC−05:00)** y se guarda en UTC:

| Modo | Entrada | `validFrom` | `validTo` |
|---|---|---|---|
| `NONE` | `scheduleEnabled=false` | `null` | `null` |
| `SINGLE_DAY` | `2026-11-28`, `08:00`–`22:00` | `2026-11-28T13:00:00Z` | `2026-11-29T03:00:00Z` |
| `DATE_RANGE` | `2026-11-27` → `2026-11-30` | `2026-11-27T05:00:00Z` (00:00 Bogotá) | `2026-12-01T04:59:59.999Z` (23:59:59.999 Bogotá) |

`getCouponScheduleStatus` devuelve `NOT_STARTED` / `EXPIRED` / `VALID` / `NO_SCHEDULE`. **Siempre** se usa la
hora del servidor, nunca la del cliente.

**Tiempo de gracia para pagar** (`checkout/domain/order-payment-grace.ts`): al crear la orden se guarda
`paymentExpiresAt = ahora + 30 min`. Si el cupón vence mientras el cliente paga, el pago se honra igual: el
webhook de pago **no** vuelve a revisar `validFrom`/`validTo`. Si el pago llega después de esos 30 minutos,
se rechaza (`OrderPaymentGraceExpiredError`).

---

## A.6 Endpoints del admin

Todos pasan por `runAdminRoute` (exigen sesión de administrador). Los errores se traducen con
`toErrorResponse`: `CouponValidationError` → 400, `CouponNotFoundError` → 404, `CouponConflictError` → 409.

### Cupones de lote (`app/api/admin/coupons/route.ts`)

| Método | Ruta | Cuerpo / Query | Respuesta |
|---|---|---|---|
| GET | `/api/admin/coupons?page=1&limit=20&search=` | | `{ data: CouponListItemDTO[], pagination }` |
| POST | `/api/admin/coupons` | `{ "discountPercentage": 15, "quantity": 50 }` | `201 { batch, coupons[] }` |
| DELETE | `/api/admin/coupons?id=<id>` | | `{ success, id }` (409 si ya se usó) |
| GET | `/api/admin/coupons/usage?id=<id>` | | Detalle: cupón + cliente + orden donde se usó |

### Cupones promocionales (`app/api/admin/coupons/promotional/route.ts`)

| Método | Ruta | Cuerpo / Query | Respuesta |
|---|---|---|---|
| GET | `/api/admin/coupons/promotional?page=&limit=&search=` | | `{ data: PromotionalCouponListItemDTO[], pagination }` |
| POST | `/api/admin/coupons/promotional` | ver ejemplo abajo | `201 PromotionalCouponListItemDTO` |
| PATCH | `/api/admin/coupons/promotional?id=<id>` | | Desactiva (`isActive=false`) |
| DELETE | `/api/admin/coupons/promotional?id=<id>` | | Elimina (409 si ya tiene usos) |
| GET | `/api/admin/coupons/promotional/usages?id=<id>` | | `PromotionalCouponUsageItemDTO[]` (correo, cédula, orden, estado, fecha) |

Ejemplo de creación:

```json
POST /api/admin/coupons/promotional
{
  "codeSource": "CUSTOM",
  "code": "blackfriday25",
  "discountType": "PERCENTAGE",
  "discountValue": 25,
  "maxGlobalUses": 500,
  "scheduleEnabled": true,
  "scheduleMode": "DATE_RANGE",
  "fromDate": "2026-11-27",
  "toDate": "2026-11-30"
}
```

Respuesta (`PromotionalCouponListItemDTO`):

```json
{
  "id": "cmh1x...",
  "code": "BLACKFRIDAY25",
  "codeSource": "CUSTOM",
  "discountType": "PERCENTAGE",
  "discountValue": 25,
  "maxGlobalUses": 500,
  "maxUsesPerUser": 1,
  "currentGlobalUses": 0,
  "isActive": true,
  "scheduleMode": "DATE_RANGE",
  "validFrom": "2026-11-27T05:00:00.000Z",
  "validTo": "2026-12-01T04:59:59.999Z",
  "scheduleLabel": "27 nov – 30 nov 2026",
  "status": "SCHEDULED",
  "createdAt": "2026-10-15T15:00:00.000Z"
}
```

### Popups (`app/api/admin/promo-popups`)

| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/admin/promo-popups` | Listar |
| POST | `/api/admin/promo-popups` | Crear |
| PATCH | `/api/admin/promo-popups/{id}` | Si el cuerpo es solo `{ "isActive": bool }`, lo activa o desactiva. Si no, actualiza todo. |
| DELETE | `/api/admin/promo-popups/{id}` | Eliminar |
| GET | `/api/promo-popups/active?placement=HOME` | **Público.** Popup activo y vigente de esa ubicación (caché de 60 s) |

### Server actions del cliente (`app/actions/coupons.ts`)

| Función | Uso |
|---|---|
| `validateCoupon(code, email?)` | "Aplicar cupón" en el checkout. Solo revisa, **no consume** |
| `generateFirstPurchaseCoupon(email)` | Cupón de bienvenida |

### Pantallas

`app/admin/promociones/page.tsx` con tres pestañas: **Cupones** (lote), **Promocionales**
(`PromotionalCouponsTab.tsx` + `usePromotionalCouponManager.ts`) y **Publicidad** (`AdvertisingTab.tsx`).
También está la tarjeta de estadísticas `admin/estadisticas/components/DiscountImpactCard.tsx`.

---

## A.7 Flujo E2E de un cupón en el checkout

```
Cliente                     Web (cliente)                      Web (servidor)                         BD
  │ escribe "BLACKFRIDAY25" │                                   │                                      │
  │────────────────────────►│ validateCoupon(code, email)       │                                      │
  │                         │──────────────────────────────────►│ findUnique(code)                     │
  │                         │                                   │ PROMOTIONAL: isActive, vigencia,     │
  │                         │                                   │   usos globales disponibles          │
  │                         │                                   │ BATCH/EMAIL: isUsed, dueño, cuenta   │
  │                         │◄──────────────────────────────────│ { valid, discountType, value,        │
  │                         │   recalcula totales en pantalla   │   couponId, kind }                   │
  │ clic en "Pagar"         │ createOrder({ couponId, ... })    │                                      │
  │────────────────────────►│──────────────────────────────────►│ TRANSACCIÓN:                         │
  │                         │                                   │ 1. precio real de cada línea (BD)    │
  │                         │                                   │ 2. revalida el cupón (como arriba)   │
  │                         │                                   │ 3. PROMOTIONAL: ¿ya lo usó por       │
  │                         │                                   │    correo, cédula o usuario? → 409   │
  │                         │                                   │ 4. descuento = calculate…(subtotal)  │
  │                         │                                   │ 5. envío = 0 si (subtotal−desc)      │
  │                         │                                   │    ≥ umbral de envío gratis          │
  │                         │                                   │ 6. Order PENDING: discount,          │
  │                         │                                   │    appliedCouponId, paymentExpiresAt │
  │                         │                                   │ 7. BATCH/EMAIL → isUsed=true         │
  │  paga en Bold / Addi    │                                   │                                      │
  │                         │                    webhook PAID ─►│ markPaid → consolidatePromotional…   │
  │                         │                                   │  • ¿ya existe CouponUsage? → nada    │
  │                         │                                   │  • ¿excede 1 por persona? → aviso    │
  │                         │                                   │  • UPDATE currentGlobalUses+1        │
  │                         │                                   │    WHERE current < max (atómico)     │
  │                         │                                   │  • INSERT CouponUsage                │
  │                         │                                   │ → POST pedido al POS (si tiene       │
  │                         │                                   │   productos del POS)                 │
  │                         │       pago fallido o expirado ───►│ releaseOrderStock: libera stock y    │
  │                         │                                   │   cupón BATCH/EMAIL (isUsed=false)   │
```

**Errores que ve el cliente** (`checkout/application/checkout.errors.ts`):

| Error | Mensaje |
|---|---|
| (no existe) | "El cupón no existe" |
| `CouponInactiveError` | "El cupón no está activo" |
| `CouponNotYetValidError` | "El cupón aún no está disponible" |
| `CouponExpiredError` | "El cupón ha expirado" |
| `CouponExhaustedError` | "El cupón ya no tiene usos disponibles" |
| `CouponAlreadyUsedError` | "Este cupón ya fue utilizado por ti" |
| BATCH sin cuenta | "Debes registrarte para usar este cupón" |
| EMAIL de otro correo | "El cupón no pertenece a este correo" |

**En pantalla** (`checkout/presentation/hooks/use-checkout.ts`): el descuento se reparte visualmente en
cada línea como porcentaje (`calcLineItemDisplayTotals`). Para FIXED se convierte a un % equivalente. Se
muestran los modales `CouponAppliedModal` y `FreeShippingAppliedModal`.

---

## A.8 Popups de publicidad (`PromoPopup`)

Sirven para **anunciar** un código. No validan que el cupón exista: el admin escribe el código a mano.

| Campo | Validación |
|---|---|
| `name` | Nombre interno, 1–80 caracteres |
| `placement` | `HOME` \| `PRODUCT` \| `CHECKOUT` |
| `isActive` | Solo **un** popup activo por ubicación: al activar uno se desactivan los demás de esa ubicación |
| `headline` (≤80), `subtitle` (≤120), `disclaimer` (≤200) | Textos |
| `couponCode` | 1–30 caracteres, en mayúsculas |
| `ctaText` (≤40), `ctaUrl` | La URL debe empezar con `/` o `http(s)://`. Default `/tienda` |
| `delaySeconds` | 0–60 |
| `scheduleEnabled` + `scheduleMode` + fechas/horas | Igual que los cupones (Bogotá) |

Se muestran con `components/promo-popup/PromoPopupHost.tsx` → `GET /api/promo-popups/active?placement=…`.

---

## A.9 Envío gratis por monto

- `ShippingConfig.freeShippingThreshold` (singleton). Se edita en `/api/admin/shipping-config`.
- `applyFreeShipping(precioEnvío, subtotalNeto, umbral)` → `subtotalNeto >= umbral ? 0 : precioEnvío`.
- **`subtotalNeto` = subtotal − descuento del cupón.** Un cupón puede hacer que el pedido baje del umbral y
  pierda el envío gratis.

---

## A.10 Qué recibe hoy el POS sobre las promociones

Cuando se paga un pedido con productos del POS, `report-order-to-pos.use-case.ts` →
`buildPosOrderPayload` (`posIntegration/domain/pos-mapper.ts`) envía `POST /api/public/orders` con:

```json
{
  "orderNumber": "ORD-0153",
  "shipping": 11000,
  "discount": 32475,
  "couponCode": "BLACKFRIDAY25",
  "orderTotal": 108425,
  "lines": [
    { "productSlug": "vestido-lino", "colorId": 3, "sizeId": 2, "quantity": 1, "unitPrice": 129900 }
  ],
  "customer": { "...": "..." },
  "payment": { "...": "..." }
}
```

- `unitPrice` = precio de la web **sin** descuento de cupón (el `salePrice` que mandó el POS).
- `discount` y `shipping` van **prorrateados**: en un pedido mixto (productos del POS + productos solo de
  la web) se multiplican por `subtotalPOS / subtotalTotal` y se redondean a pesos.
- `couponCode` es solo informativo: hoy el POS no conoce ese cupón.

---

## A.11 Limitaciones y detalles a tener en cuenta

1. **No hay alcance por producto ni categoría**: todos los cupones aplican al pedido completo.
2. **`isOnSale` no depende de `comparePrice`**: se puede ver "En Oferta" sin precio tachado, o al revés.
   Para productos del POS, `isOnSale` lo pone la web a mano y la sincronización no lo toca.
3. **`isOnSale` no vence**. Solo "Nuevo" vence a los 7 días.
4. **Carrera en PROMOTIONAL**: el contador sube al pagar. Si quedan N usos y entran más de N pedidos
   pendientes al mismo tiempo, todos reciben el descuento. Al consolidar, los sobrantes solo dejan un aviso
   en el log (`Cupón … agotado al consolidar`). Es una decisión de diseño: se prioriza no rechazar pagos ya
   hechos.
5. **Un solo cupón por pedido.** No se acumulan.
6. **Los popups no validan** que `couponCode` exista ni que esté vigente.
7. **El POS no tiene promociones**: solo recibe `discount` y `couponCode` en el pedido.

---

# PARTE B: integración de promociones con el POS Casa Verde

## B.1 Principios de diseño

Se sigue el mismo patrón que ya funciona para el catálogo:

| Regla | Detalle |
|---|---|
| **El POS es la fuente de verdad** de las promociones que crea | La web las guarda como copia de solo lectura, igual que los productos del POS (`posSlug`) |
| **Lectura por API pública** | `GET` con `X-Api-Key`, respuesta `{success, data}`, `updatedSince`, `ETag`, límite de 120/min |
| **Avisos por webhook firmado** | Mismo HMAC, mismos encabezados `X-CasaVerde-*` y misma deduplicación por `eventId` (tabla `PosWebhookEvent`) |
| **Respaldo diario** | La sincronización completa también descarga las promociones y retira las que ya no aparezcan |
| **La web sigue calculando el cobro** | El checkout, la validación y el contador viven en la web. El POS nunca calcula el descuento de un pedido web |
| **Los cupones de la web siguen existiendo** | Coexisten `source = WEB` (creados en el admin web) y `source = POS` |

Se proponen **dos niveles**:

- **Nivel 1: ofertas por producto** (precio tachado + etiqueta). Casi todo ya existe; solo falta una etiqueta.
- **Nivel 2: cupones del POS** (códigos con descuento sobre el pedido). Es la entidad nueva.
- Fase 2: cupones con **alcance por producto o categoría** ([B.9](#b9-alcance-por-producto--categoría-fase-2)).

---

## B.2 Nivel 1: ofertas por producto desde el POS

### Qué hace el POS

Para poner un producto en oferta, el POS **ya** debe hacer esto:

1. Cambiar `salePrice` al precio con descuento.
2. Poner el precio anterior en `displayPrice` (debe ser **mayor** que `salePrice`; si no, la web lo ignora).
3. **Nuevo:** asignar la etiqueta `ON_SALE` con `assignedAt`.
4. **Nuevo (opcional):** enviar el bloque `offer` con la vigencia, para que la web la muestre y la retire
   sola aunque se pierda un aviso.
5. Emitir `product.upserted` (al empezar **y** al terminar la oferta).

### Cambio en el contrato de producto (`GET /products/{slug}`)

```json
{
  "slug": "vestido-lino",
  "salePrice": 103920,
  "displayPrice": 129900,
  "labels": [
    { "code": "ON_SALE", "assignedAt": "2026-11-27T05:00:00Z" }
  ],
  "offer": {
    "promotionId": "PRM-2026-0042",
    "name": "Black Friday 20%",
    "discountType": "PERCENTAGE",
    "discountValue": 20,
    "startsAt": "2026-11-27T05:00:00Z",
    "endsAt": "2026-12-01T04:59:59Z"
  }
}
```

| Campo | Obligatorio | Regla |
|---|---|---|
| `labels[].code = "ON_SALE"` | Sí, si está en oferta | La web pone `isOnSale=true` e `isOnSaleAt=assignedAt` |
| `offer` | No | Informativo. **El precio que se cobra sigue siendo `salePrice`**: la web no recalcula nada con `discountValue` |
| `offer.endsAt` | No | Si pasó, la web oculta el tachado y la etiqueta aunque no llegue el aviso (protección) |

> **Recomendado:** que al vencer la oferta el POS restaure `salePrice` y emita `product.upserted`. Así el
> precio que se cobra siempre lo decide el POS. La web solo usa `endsAt` para no seguir mostrando el
> tachado si se perdió el aviso; el cobro sigue siendo el `salePrice` guardado hasta la próxima
> sincronización (como máximo 24 h, por el respaldo diario).

### Cambios en la web

| Archivo | Cambio |
|---|---|
| `posIntegration/contracts/pos-catalog.schema.ts` | `posProductSchema`: agregar `offer: posOfferSchema.nullish()` |
| `posIntegration/domain/pos-mapper.ts` → `mapPosLabels` | `ON_SALE` → `isOnSale`, `isOnSaleAt` |
| `posIntegration/infrastructure/prisma-pos-sync.repository.ts` | Incluir `isOnSale` / `isOnSaleAt` en `posFields`. Si la oferta ya venció → `comparePrice=null`, `isOnSale=false` |
| `prisma/schema.prisma` (`Product`) | Opcional: `onSaleEndsAt DateTime?` y `posPromotionId String?` |
| `adminCatalog/products/application/update-pos-managed-product.use-case.ts` | Quitar `isOnSale` / `isOnSaleAt` de los campos editables en productos del POS (pasan a ser del POS) |
| `lib/productBadge.ts` | Opcional: no mostrar "En Oferta" si `onSaleEndsAt < ahora` |

---

## B.3 Nivel 2: cupones creados en el POS

### Concepto

En el POS se crea una **Promoción con código** que se publica en la web como un `Coupon` de tipo
`PROMOTIONAL` con `source = POS`. La web la valida y la aplica en el checkout igual que los cupones
promocionales actuales: sin cambiar el algoritmo de descuento.

### Mapeo de campos POS → web

| Campo del POS (`PublicPromotionDto`) | Tipo | Campo en la web (`Coupon`) | Regla |
|---|---|---|---|
| `promotionId` | string, estable | `posPromotionId` *(nuevo, `@unique`)* | Llave de sincronización. **No cambia nunca.** |
| `code` | string | `code` | Mayúsculas, `^[A-Z0-9-]{4,20}$`. Único en **toda** la web |
| `name` | string | `label` | Nombre interno para el admin |
| `discountType` | `PERCENTAGE` \| `FIXED` | `discountType` | |
| `discountValue` | int | `discountValue` (+ `discountPercentage`) | % 1–100. FIXED en **pesos enteros** ≤ 5 000 000 |
| `maxUses` | int | `maxGlobalUses` | 1–10 000. Usos **en la web** (ver B.8) |
| `maxUsesPerCustomer` | int | `maxUsesPerUser` | Hoy la web solo admite **1** |
| `startsAt` / `endsAt` | ISO-8601 UTC o `null` | `validFrom` / `validTo` | Ambos `null` → `scheduleMode=NONE`. Si vienen → `DATE_RANGE` (o `SINGLE_DAY` si caen el mismo día en Bogotá) |
| `active` | boolean | `isActive` | |
| `channels` | `["WEB","STORE"]` | *(filtro)* | La web solo guarda las que incluyen `WEB` |
| `minPurchase` | int \| null | `minPurchase` *(nuevo)* | Subtotal mínimo para aplicar. Opcional (fase 1.5) |
| `scope` | objeto | *(fase 2)* | Ver B.9. En fase 1 solo `{ "type": "ORDER" }` |
| `updatedAt` | ISO | `posSyncedAt` | |

---

## B.4 Cómo debe crear el POS una promoción (pantalla y validaciones)

### Formulario sugerido en el POS: "Nueva promoción"

| Sección | Campo | Control | Validación (alineada con la web) |
|---|---|---|---|
| Identificación | Nombre interno | texto | 1–80 caracteres |
| | Código | texto + botón "Generar" | `^[A-Z0-9-]{4,20}$`, mayúsculas, único. "Generar" = 12 caracteres `[A-Z0-9]` |
| Descuento | Tipo | radio: Porcentaje / Valor fijo | |
| | Valor | número | % 1–100 · fijo 1–5 000 000 (pesos enteros, **sin centavos**) |
| | Compra mínima | número opcional | ≥ 0 |
| Límites | Usos totales | número | 1–10 000 |
| | Usos por cliente | fijo en 1 | (la web solo admite 1) |
| Vigencia | Sin límite / Un día / Rango | radio | Se interpreta en **America/Bogota** |
| | Día + hora inicio/fin | fecha + horas | día ≥ hoy, fin > inicio |
| | Desde / Hasta | fechas | desde ≥ hoy, hasta ≥ desde (hasta = 23:59:59 de ese día) |
| Canales | Web / Tienda física | checkboxes | Al menos uno |
| Alcance (fase 2) | Todo el pedido / Productos / Categorías | radio + selector | |
| Estado | Activa | interruptor | |

### Reglas de negocio en el POS

1. Convertir la vigencia a **instantes UTC** antes de publicarla (Bogotá = UTC−5, sin horario de verano):
   - Un día `2026-11-28 08:00–22:00` → `startsAt=2026-11-28T13:00:00Z`, `endsAt=2026-11-29T03:00:00Z`.
   - Rango `27–30 nov` → `startsAt=2026-11-27T05:00:00Z`, `endsAt=2026-12-01T04:59:59Z`.
2. El `promotionId` se genera una vez y **no cambia**. El `code` **sí** puede cambiar: la web lo actualiza
   por `promotionId`.
3. **Editar** una promoción que ya tiene usos: solo permitir cambiar `endsAt`, `maxUses` (hacia arriba),
   `active` y `name`. Cambiar el valor del descuento con usos ya hechos confunde los reportes; mejor crear
   una nueva.
4. **Eliminar**: si tiene usos, solo desactivar (`removed` en el webhook; la web pone `isActive=false` y
   conserva el historial). Si no tiene usos, la web puede borrarla.
5. Cada vez que se crea, edita, activa, desactiva o elimina, emitir el aviso correspondiente (B.6).

---

## B.5 Cómo la manda el POS: API pública de promociones

Base: `https://<pos>/api/public/catalog`. Encabezado `X-Api-Key`. Solo `GET`. Misma caché, `ETag`, límite y
errores que el catálogo.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/promotions?updatedSince=&channel=WEB&page=0&size=50` | Promociones visibles para la web (activas, programadas, vencidas o agotadas en los últimos 30 días) |
| GET | `/promotions/{promotionId}` | Una promoción |

- **Visible** = incluye el canal `WEB` y no está eliminada. Las inactivas **sí** se listan con
  `active=false`, para que la web las desactive en el respaldo diario.
- `404` si no existe o no es para la web. La web lo trata como `removed`.

### Respuesta de `GET /promotions/{promotionId}`

```json
{
  "success": true,
  "data": {
    "promotionId": "PRM-2026-0042",
    "code": "BLACKFRIDAY25",
    "name": "Black Friday 25% web",
    "discountType": "PERCENTAGE",
    "discountValue": 25,
    "minPurchase": null,
    "maxUses": 500,
    "maxUsesPerCustomer": 1,
    "startsAt": "2026-11-27T05:00:00Z",
    "endsAt": "2026-12-01T04:59:59Z",
    "active": true,
    "channels": ["WEB", "STORE"],
    "scope": { "type": "ORDER" },
    "updatedAt": "2026-10-15T14:32:10Z"
  }
}
```

### Listado

```json
{
  "success": true,
  "data": {
    "items": [ { "promotionId": "PRM-2026-0042", "...": "..." } ],
    "total": 1,
    "page": 0,
    "size": 50
  }
}
```

### Campos obligatorios

`promotionId`, `code`, `discountType`, `discountValue`, `maxUses`, `active`, `channels`. Los demás pueden
ser `null`.

---

## B.6 Cómo la manda el POS: avisos (webhook)

Misma URL (`WEB_WEBHOOK_URL` → `/api/pos-webhook`), misma firma HMAC y mismos encabezados que el
catálogo. Se agrega `entityType = "promotion"`:

```
POST /api/pos-webhook
X-CasaVerde-Timestamp: 1795000000
X-CasaVerde-Signature: sha256=<hex>
X-CasaVerde-Event-Id: 9a7c...-uuid
X-CasaVerde-Event: promotion.upserted

{"eventId":"9a7c...","event":"promotion.upserted","entityType":"promotion",
 "id":"PRM-2026-0042","action":"upserted","occurredAt":"2026-10-15T14:32:10Z"}
```

| Evento | Cuándo lo emite el POS | Qué hace la web |
|---|---|---|
| `promotion.upserted` | Crear, editar, activar o desactivar | `GET /promotions/{id}` y upsert del `Coupon` por `posPromotionId` |
| `promotion.removed` | Eliminar o quitar el canal WEB | Si tiene usos → `isActive=false`. Si no → borrar |

> **No se emiten avisos al empezar o terminar la vigencia**: la web compara `validFrom`/`validTo` con la
> hora del servidor en cada validación. Por eso el POS **debe** mandar bien `startsAt`/`endsAt`.

La verificación es la misma del documento de catálogo: HMAC sobre `timestamp + "." + cuerpoCrudo`,
diferencia de hora máxima de 5 minutos, deduplicación por `eventId` y responder `2xx` en menos de 5 s.

---

## B.7 Cómo la recibe la web (cambios a implementar)

### 1. Migración de Prisma

```prisma
enum CouponSource {
  WEB
  POS
}

model Coupon {
  // ...campos actuales
  source          CouponSource @default(WEB)
  posPromotionId  String?      @unique   // llave del POS
  posSyncedAt     DateTime?
  minPurchase     Int?                   // opcional (fase 1.5)
}
```

Migración: `prisma/migrations/<fecha>_add_pos_promotions/`. Los cupones existentes quedan como `WEB`.

### 2. Contrato (`posIntegration/contracts/pos-catalog.schema.ts`)

```ts
export const posPromotionSchema = z.object({
  promotionId: z.string().min(1),
  code: z.string().trim().transform((v) => v.toUpperCase())
    .pipe(z.string().regex(/^[A-Z0-9-]{4,20}$/)),
  name: nullableString,
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().int().positive(),
  minPurchase: z.number().int().nonnegative().nullish().transform((v) => v ?? null),
  maxUses: z.number().int().min(1).max(10000),
  maxUsesPerCustomer: z.number().int().default(1),
  startsAt: nullableString,
  endsAt: nullableString,
  active: z.boolean(),
  channels: z.array(z.enum(["WEB", "STORE"])).default(["WEB"]),
  scope: z.object({ type: z.enum(["ORDER", "PRODUCTS", "CATEGORIES"]) })
    .passthrough().default({ type: "ORDER" }),
  updatedAt: nullableString,
}).superRefine((p, ctx) => {
  if (p.discountType === "PERCENTAGE" && p.discountValue > 100)
    ctx.addIssue({ code: "custom", message: "Porcentaje > 100", path: ["discountValue"] });
  if (p.discountType === "FIXED" && p.discountValue > 5_000_000)
    ctx.addIssue({ code: "custom", message: "Fijo > 5.000.000", path: ["discountValue"] });
});

// posWebhookPayloadSchema.entityType → agregar "promotion"
```

### 3. Mapper (`posIntegration/domain/pos-mapper.ts`)

```ts
export function mapPosPromotion(p: PosPromotion) {
  const validFrom = p.startsAt ? new Date(p.startsAt) : null;
  const validTo = p.endsAt ? new Date(p.endsAt) : null;
  const sameBogotaDay = validFrom && validTo &&
    getBogotaTodayDate(validFrom) === getBogotaTodayDate(validTo);
  return {
    source: "POS" as const,
    posPromotionId: p.promotionId,
    code: p.code,
    label: p.name,
    kind: "PROMOTIONAL" as const,
    discountType: p.discountType,
    discountValue: p.discountValue,
    discountPercentage: p.discountType === "PERCENTAGE" ? p.discountValue : 0,
    maxGlobalUses: p.maxUses,
    maxUsesPerUser: 1,                      // la web solo admite 1
    scheduleMode: !validFrom || !validTo ? "NONE" : sameBogotaDay ? "SINGLE_DAY" : "DATE_RANGE",
    validFrom, validTo,
    isActive: p.active && p.channels.includes("WEB") && p.scope.type === "ORDER", // fase 1
    minPurchase: p.minPurchase,
    codeSource: "CUSTOM" as const,
    posSyncedAt: new Date(),
  };
}
```

### 4. Casos de uso nuevos (`posIntegration/application/`)

| Archivo | Responsabilidad |
|---|---|
| `sync-promotion.use-case.ts` | `syncPromotionById(id)`: GET, mapear y hacer upsert por `posPromotionId`. **Nunca** sobrescribe `currentGlobalUses`. Si el `code` choca con un cupón `WEB` → `PosSyncConflictError` (se registra y se avisa al admin). `removePromotionById(id)`: desactivar o borrar |
| `process-pos-event.use-case.ts` | Agregar `if (entityType === "promotion") …` |
| `full-sync.use-case.ts` | Recorrer todas las páginas de `/promotions?channel=WEB`. Las promociones `source=POS` que ya no aparezcan → `removePromotionById` |
| `infrastructure/pos-catalog.client.ts` | `getPromotion(id)`, `listPromotions(query)` |

### 5. Admin web

- En la pestaña "Promocionales" mostrar una etiqueta **"POS"** en los cupones `source=POS` y deshabilitar
  editar, desactivar y eliminar (mismo patrón que `ProductPosManagedConflictError`): *"Esta promoción la
  administra el POS"*.
- Seguir mostrando los usos (`/usages`) normalmente.

### 6. Checkout (cambios mínimos)

- `validateCoupon` y `prisma-checkout.repository.ts` no cambian para `scope=ORDER`.
- Si se implementa `minPurchase`: en ambos lugares, si `subtotal < minPurchase` →
  `"Compra mínima de $X para usar este cupón"`.

### Diagrama de recepción

```
POS crea o edita promoción
   │
   ├─► webhook promotion.upserted ─► /api/pos-webhook ─► verifica firma ─► PosWebhookEvent (dedup) ─► 200
   │                                                             │ (en segundo plano)
   │                                                             ▼
   │                                       processPosEvent → syncPromotionById
   │                                                             │ GET /promotions/{id}
   │                                                             ▼
   │                                       upsert Coupon { source: POS, posPromotionId, ... }
   │
   └─► cron diario /api/cron/pos-sync ─► fullSync ─► /promotions (todas) ─► upsert + retirar huérfanas
```

---

## B.8 Uso del cupón y reporte de vuelta al POS

### Quién cuenta los usos

| Opción | Descripción | Recomendación |
|---|---|---|
| **A. Contadores separados por canal** | `maxUses` del POS = cupo **para la web**. La web cuenta sus usos. La tienda física cuenta los suyos en el POS | **Fase 1** (simple, sin dependencia en tiempo real) |
| B. Contador compartido | Antes de cobrar, la web reserva un uso en el POS (`POST /api/public/promotions/{id}/redeem`) | Fase 2, solo si el cupo debe ser único entre web y tienda |

### Lo que la web envía al POS en el pedido pagado

Se extiende el `POST /api/public/orders` actual (`PosOrderPayload`) con un bloque `promotion`:

```json
{
  "orderNumber": "ORD-0153",
  "discount": 32475,
  "couponCode": "BLACKFRIDAY25",
  "promotion": {
    "promotionId": "PRM-2026-0042",
    "code": "BLACKFRIDAY25",
    "source": "POS",
    "discountType": "PERCENTAGE",
    "discountValue": 25,
    "orderDiscount": 32475,
    "posDiscount": 32475
  },
  "lines": [ "..." ]
}
```

| Campo | Significado |
|---|---|
| `promotion.promotionId` | `null` si el cupón es `source=WEB` (cupones creados en la web) |
| `orderDiscount` | Descuento total del pedido web |
| `posDiscount` | Parte prorrateada a los productos del POS (= `discount` de la raíz) |

**Qué hace el POS al recibirlo:**
1. Registrar la venta con `discount` como descuento global (como hoy).
2. Si `promotionId` existe, sumar un uso **del canal WEB** a esa promoción (solo para reportes).
3. Ser idempotente por `orderNumber` (como hoy): un reintento no suma otro uso.
4. Si el pedido se cancela (`POST /orders/{orderNumber}/cancel`), restar el uso.

Cambios en la web: `buildPosOrderPayload` y `report-order-to-pos.use-case.ts` (seleccionar
`appliedCoupon { code, source, posPromotionId, discountType, discountValue }`).

---

## B.9 Alcance por producto / categoría (fase 2)

Es lo que hoy **no existe** en la web y permite promociones como "20 % en la categoría Vestidos" o "$15 000
de descuento en estos 3 productos".

### Contrato del POS

```json
"scope": {
  "type": "PRODUCTS",
  "productSlugs": ["vestido-lino", "blusa-seda"]
}
```
```json
"scope": {
  "type": "CATEGORIES",
  "categoryWebIds": ["c-vestidos", "s-vestidos-largos"]
}
```

### Modelo en la web

```prisma
model CouponProduct {
  couponId  String
  productId String
  coupon    Coupon  @relation(fields: [couponId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@id([couponId, productId])
}

model CouponCategory {
  couponId   String
  categoryId String
  coupon     Coupon   @relation(fields: [couponId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  @@id([couponId, categoryId])
}

// Coupon: scopeType  CouponScope @default(ORDER)   // ORDER | PRODUCTS | CATEGORIES
```

La sincronización traduce `productSlugs` → `Product.posSlug` y `categoryWebIds` → `Category.posWebId`. Los que no se encuentren se ignoran y se registran en el log.

### Cálculo (cambio en `coupon.entity.ts` + checkout)

```
lineasElegibles  = líneas cuyo productId está en el alcance (o su categoría)
baseElegible     = Σ precio × cantidad de lineasElegibles
si baseElegible = 0 → "El cupón no aplica a los productos de tu carrito"
descuento        = calculateCouponDiscountAmount(baseElegible, tipo, valor)
```

- **Envío gratis**: se sigue evaluando con `subtotal − descuento`.
- **En pantalla**: mostrar el descuento solo en las líneas elegibles. Hoy `lineItemDiscountPercentage` lo
  aplica a todas.
- **Reporte al POS**: `posDiscount` = parte del descuento que corresponde a líneas **del POS elegibles**
  (ya no prorrateo por subtotal).
- **Ofertas acumuladas**: decidir si un producto que ya tiene `comparePrice` puede recibir el cupón.
  Recomendación: agregar `excludeOnSale: boolean` al contrato (default `false`).

---

## B.10 Casos de prueba E2E

| # | Escenario | Resultado esperado |
|---|---|---|
| 1 | El POS crea `BF25` (25 %, 500 usos, 27–30 nov, canal WEB) | La web recibe el aviso → `Coupon{source:POS, status:SCHEDULED}` en el admin con etiqueta "POS" |
| 2 | Cliente aplica `BF25` el 26 nov | "El cupón aún no está disponible" |
| 3 | Cliente aplica `bf25` (minúsculas) el 28 nov | Válido. Descuento = 25 % del subtotal |
| 4 | Paga | `currentGlobalUses=1`, existe `CouponUsage`, POST al POS con `promotion.promotionId` |
| 5 | El mismo cliente (mismo correo **o** cédula) intenta de nuevo | "Este cupón ya fue utilizado por ti" |
| 6 | El POS desactiva `BF25` | Aviso → `isActive=false` → "El cupón no está activo" |
| 7 | El POS cambia el código a `BF30` | Mismo `posPromotionId`: `code` actualizado, se conservan los usos |
| 8 | El POS crea un código que ya existe como cupón WEB | Sincronización rechazada (`PosSyncConflictError`), aviso al admin, el cupón WEB no cambia |
| 9 | Se pierde el aviso | El respaldo diario lo sincroniza |
| 10 | Pedido mixto (60 % POS / 40 % web) con FIXED $20 000 | POST al POS con `discount = 12 000` |
| 11 | Cupón vence mientras el cliente paga (dentro de 30 min) | El pago se honra y el uso se consolida |
| 12 | Promoción con `channels:["STORE"]` | La web no la guarda (o la desactiva si ya existía) |
| 13 | Oferta de producto: el POS baja `salePrice`, pone `displayPrice` y `ON_SALE` | Tarjeta con tachado + "En Oferta". Se cobra `salePrice` |
| 14 | Termina la oferta y el POS restaura el precio | Desaparecen el tachado y el badge |
| 15 | (fase 2) Cupón `PRODUCTS` y el carrito no tiene esos productos | "El cupón no aplica a los productos de tu carrito" |
| 16 | Firma inválida o timestamp viejo | `401`. No se procesa |
| 17 | Mismo `eventId` dos veces | Se procesa una sola vez |

Pruebas unitarias sugeridas: `posIntegration/__tests__/pos-promotion-mapper.test.ts` (fechas → modo,
validaciones, canales), `process-pos-event` con `entityType: "promotion"`, y extender
`coupon-domain.test.ts` para `minPurchase` y el alcance.

---

## B.11 Checklist de implementación

### POS Casa Verde

- [ ] Entidad `Promotion` (`promotionId` estable, `code` único, tipo, valor, compra mínima, usos totales,
      vigencia en UTC, `active`, canales, alcance)
- [ ] Formulario con las validaciones de [B.4](#b4-cómo-debe-crear-el-pos-una-promoción-pantalla-y-validaciones)
- [ ] `GET /api/public/catalog/promotions` y `/promotions/{promotionId}` (mismo `X-Api-Key`, `ETag`, límite)
- [ ] Avisos `promotion.upserted` / `promotion.removed` con la firma actual
- [ ] Etiqueta `ON_SALE` y bloque `offer` en el DTO de producto
- [ ] Al recibir `POST /orders` con `promotion.promotionId`: sumar el uso del canal WEB (idempotente). Al
      cancelar: restarlo
- [ ] Actualizar `contrato-pos-producto.json` y agregar `contrato-pos-promocion.json`

### Web Casa Verde

- [ ] Migración: `CouponSource`, `source`, `posPromotionId`, `posSyncedAt`, (`minPurchase`)
- [ ] `posPromotionSchema` + `entityType: "promotion"` en `posWebhookPayloadSchema`
- [ ] `mapPosPromotion` + pruebas
- [ ] `sync-promotion.use-case.ts` (upsert sin tocar `currentGlobalUses`, conflicto de código)
- [ ] `process-pos-event` y `full-sync` con promociones
- [ ] `pos-catalog.client.ts`: `getPromotion`, `listPromotions`
- [ ] Admin: etiqueta "POS" y acciones bloqueadas para `source=POS`
- [ ] `mapPosLabels`: `ON_SALE` → `isOnSale`. Sacar `isOnSale` de los campos editables de productos del POS
- [ ] `buildPosOrderPayload`: bloque `promotion`
- [ ] (Fase 1.5) `minPurchase` en `validateCoupon` y `createOrder`
- [ ] (Fase 2) Alcance por producto o categoría, contador compartido (`/redeem`)
- [ ] Actualizar `md/integracion-web-casa-verde.md` con la sección de promociones
