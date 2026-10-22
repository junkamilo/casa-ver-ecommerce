# Integración POS -> Web Casa Verde

Contrato para quien desarrolla la web. El POS es la fuente de verdad del catálogo; la web lo consulta con una
clave de integración y recibe avisos firmados cuando algo cambia.

## 1. Credenciales

Las genera el administrador del POS con `scripts/generar-clave-web.ps1`:

- **Clave de API** (`X-Api-Key`): se guarda como variable de entorno del **servidor** de la web. Nunca en el
  navegador ni en código del cliente.
- **Secreto del webhook**: para verificar la firma de los avisos.

## 2. API pública (solo lectura)

Base: `https://<pos>/api/public/catalog`. Todas las peticiones llevan `X-Api-Key: <clave>`. Solo GET.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/categories?updatedSince=` | Árbol de categorías visibles con sus subcategorías |
| GET | `/categories/{webId}` | Una categoría con sus subcategorías |
| GET | `/products?categoryWebId=&subcategoryWebId=&updatedSince=&page=0&size=50` | Productos visibles (máx. 100 por página) |
| GET | `/products/{slug}` | Detalle de un producto |

- `updatedSince` es ISO-8601 (`2026-09-29T00:00:00Z`) y devuelve solo lo creado o modificado después. Los
  cambios de stock no cambian `updatedAt`: llegan como aviso `product.stock_changed`.
- Respuesta: `{"success": true, "data": ...}`. Los listados de productos: `data = {items, total, page, size}`.
- Stock: no se envían cantidades. Cada variante trae `available` (hay unidades) y `lowStock` (quedan pocas).
  El producto trae `available` si alguna variante está disponible.
- `displayPrice` es el precio antes (tachado); `null` si no hay.
- Caché: `Cache-Control: public, max-age=60` y `ETag`. Reenvíe `If-None-Match` para recibir `304`.
- Errores: `401` sin clave o clave inválida, `404` no existe o no es visible, `405` método distinto de GET,
  `429` demasiadas peticiones (respetar `Retry-After`; límite por defecto 120 por minuto).

## 3. Avisos de cambios (webhook)

El POS hace `POST` a la URL acordada (`WEB_WEBHOOK_URL`) con:

```
Content-Type: application/json
X-CasaVerde-Timestamp: 1790000000
X-CasaVerde-Signature: sha256=<hex>
X-CasaVerde-Event-Id: 5b1f...-uuid
X-CasaVerde-Event: category.upserted

{"eventId":"5b1f...","event":"category.upserted","entityType":"category","id":"c...","action":"upserted","occurredAt":"2026-09-29T06:00:00Z"}
```

- `entityType`: `category`, `subcategory` o `product`. `id`: `webId` (categorías) o `slug` (productos).
- `action`:
  - `upserted`: creado o modificado y visible. Vuelva a consultar el recurso en la API.
  - `removed`: borrado, desactivado u oculto. Deje de mostrarlo. Si es una categoría, oculte también sus
    subcategorías y productos. Si cambió el slug de un producto llega `removed` del anterior y `upserted` del nuevo.
  - `stock_changed`: cambió la disponibilidad de alguna variante. Vuelva a consultar `/products/{slug}`.

Verificación obligatoria en la web:

1. Calcular `HMAC-SHA256(secreto, timestamp + "." + cuerpoCrudo)` en hexadecimal y compararlo en tiempo
   constante con la firma (sin el prefijo `sha256=`). Usar el cuerpo **crudo**, sin re-serializar el JSON.
2. Rechazar si `timestamp` difiere más de 5 minutos de la hora actual.
3. Descartar duplicados por `X-CasaVerde-Event-Id` (el POS reintenta hasta recibir 2xx).
4. Responder `2xx` rápido y procesar después (el POS espera como máximo 5 segundos).

Ejemplo (Node.js):

```js
import crypto from 'node:crypto'

export function verify(rawBody, headers, secret) {
  const ts = Number(headers['x-casaverde-timestamp'])
  if (!ts || Math.abs(Date.now() / 1000 - ts) > 300) return false
  const expected = crypto.createHmac('sha256', secret).update(`${ts}.${rawBody}`).digest('hex')
  const received = String(headers['x-casaverde-signature'] || '').replace(/^sha256=/, '')
  return received.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected))
}
```

## 4. Respaldo

Además de los avisos, sincronice completo una vez al día (`/categories` y todas las páginas de `/products`) y
retire lo que ya no aparezca. 