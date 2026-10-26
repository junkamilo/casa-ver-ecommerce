-- Pedidos: la logística 100 % del POS (md/COMPARACION-TABLAS-PEDIDOS-POS-vs-WEB.md, fase 4).
--
-- La web solo guarda el checkout y el pago del pedido. El estado logístico (Procesando, Enviado, Entregado),
-- la guía, el enlace de rastreo y las fechas de envío y entrega viven en el POS (sales.sales, Tienda → Pedidos)
-- y la web los lee de GET /api/public/orders («Mis pedidos», panel y reportes). El POS también emite el
-- comprobante contable de cada venta web, así que la exportación contable de la web sobra.
--
-- 1. Los pedidos anteriores a la integración (nunca llegaron al POS) conservan su estado (SHIPPED, DELIVERED)
--    como historial; la web ya no los cambia. Su guía y fechas se copian a _legacy_order_logistics.
-- 2. Se quitan trackingNumber, trackingUrl, shippedAt y deliveredAt de orders.
-- 3. Se elimina accounting_sale_exports.

CREATE TABLE IF NOT EXISTS "_legacy_order_logistics" AS
SELECT "id" AS "orderId", "orderNumber", "status", "trackingNumber", "trackingUrl", "shippedAt", "deliveredAt"
  FROM "orders"
 WHERE "trackingNumber" IS NOT NULL OR "trackingUrl" IS NOT NULL
    OR "shippedAt" IS NOT NULL OR "deliveredAt" IS NOT NULL;

ALTER TABLE "orders"
    DROP COLUMN "trackingNumber",
    DROP COLUMN "trackingUrl",
    DROP COLUMN "shippedAt",
    DROP COLUMN "deliveredAt";

DROP TABLE IF EXISTS "accounting_sale_exports";
