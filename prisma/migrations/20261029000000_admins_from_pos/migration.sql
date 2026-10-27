-- Administradores: 100 % del POS (md/COMPARACION-TABLAS-ADMINS-Y-USUARIOS-POS-vs-WEB.md, paso 4).
--
-- Los administradores de la web son usuarios del POS con acceso web (platform.users.web_admin), con la misma
-- contraseña del POS. El login de la web los verifica con POST /api/public/admins/verify y la sesión lleva el
-- id del POS: la web ya no guarda administradores. La tabla users queda solo para clientes de la tienda.
--
-- Las cuentas que la sincronización creó o enlazó para los admins se conservan como cuentas de cliente
-- (pueden tener pedidos, direcciones o reseñas); solo pierden la marca de administrador.

ALTER TABLE "users" DROP COLUMN IF EXISTS "posUserId";
ALTER TABLE "users" DROP COLUMN IF EXISTS "role";
DROP TYPE IF EXISTS "Role";
