-- Cierre del admin web (md/COMPARACION-TABLAS-MI-PERFIL-Y-CIERRE-ADMIN-WEB.md).
--
-- La web ya no tiene panel /admin: toda la administración vive en el POS. La campana de notificaciones se
-- retira; la única alerta que quedaba (pedido pagado que el POS no registró) se envía por correo al admin y se
-- marca en orders.posRejectedAlertSentAt para no repetirla. La tabla admin_notifications se mueve al esquema
-- "legacy_admin" (fuera de Prisma) como respaldo, sin borrar datos. Para eliminarla del todo:
-- DROP SCHEMA legacy_admin CASCADE;

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "posRejectedAlertSentAt" TIMESTAMP(3);

-- Pedidos que ya tenían su alerta en la campana: no se vuelven a avisar por correo.
UPDATE "orders" o
   SET "posRejectedAlertSentAt" = n."createdAt"
  FROM (
    SELECT "orderId", min("createdAt") AS "createdAt"
      FROM "admin_notifications"
     WHERE "orderId" IS NOT NULL AND "title" LIKE 'Pedido sin registrar en el POS%'
     GROUP BY "orderId"
  ) n
 WHERE n."orderId" = o."id" AND o."posRejectedAlertSentAt" IS NULL;

CREATE SCHEMA IF NOT EXISTS "legacy_admin";

ALTER TABLE IF EXISTS "admin_notifications" SET SCHEMA "legacy_admin";
