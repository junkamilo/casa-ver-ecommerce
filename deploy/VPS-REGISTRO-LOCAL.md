# Registro para el despliegue en el VPS

Estado de la base de datos de la web en local, para que el VPS parta del mismo punto sin depender de memoria.
Todo lo siguiente se hizo SOLO en local (contenedor `casa-verde-web-postgres`). Neon no se modificó.

## 1. Tablas legacy: ELIMINADAS

Se eliminaron los esquemas `legacy_admin`, `legacy_catalog`, `legacy_hero`, `legacy_popups`, `legacy_reviews`
y las 10 tablas `_legacy_*` del esquema `public`. Su contenido ya vive en el POS.
El VPS no debe recrearlas.

## 2. Datos: ELIMINADOS, base en cero

Se vaciaron TODAS las tablas de datos del esquema `public` (`TRUNCATE ... RESTART IDENTITY CASCADE`):
usuarios, cuentas, direcciones, carritos, pedidos, líneas de pedido, webhooks, tokens, registros pendientes,
eventos del POS y configuración de producto web. Verificado: 0 filas en cada una.

Se conservó únicamente `_prisma_migrations` (historial de migraciones, 77 registros): sin él, Prisma no sabe qué
esquema está aplicado. El esquema de la tabla no cambió.

Respaldo previo, en el scratchpad (contiene datos personales de clientes; borrarlo cuando no haga falta):
`web-antes-vaciar-todo.dump`. Los respaldos anteriores de la sesión son `web-antes-borrar-legacy.dump`,
`web-antes-borrar-pruebas.dump` y `web-antes-borrar-cuenta-juan.dump`.

Después de vaciar, en local se hizo un registro de prueba (con Mailpit) que dejó 1 registro pendiente en
`pending_registrations`. Si se quiere la base en cero otra vez, vaciar de nuevo las tablas de datos.

## 3. Qué significa para el VPS

- La base del VPS arranca con el esquema vigente y sin datos. No se migra nada de la copia local.
- Los datos reales de clientes y pedidos están en Neon (todavía sin rotar la contraseña) y en el POS. Antes de
  apagar Neon hay que decidir de dónde sale la base de la web en el VPS; este registro no lo decide.
- Los pendientes de la sesión anterior (pedidos `PENDING` de clientes, decisión sobre `review-requests`) ya no
  aplican en local, porque no quedan datos. Deben revisarse en la base de producción cuando corresponda.

## 4. Cambios de código (local)

- Neon retirado del código: `@prisma/adapter-neon` y `@neondatabase/serverless` desinstalados; script
  `scripts/inspect-neon-targets.mjs` eliminado. `.env` apunta al contenedor local.
- Vercel retirado del código: `@vercel/analytics` y `@vercel/speed-insights` desinstalados. `vercel.json` sigue
  existiendo; los crons se disparan desde el VPS con `deploy/cron/`.
- Administrador: la web ya no tiene rol de administrador (se administra en el POS). Quitado el campo `role` de la
  sesión y de la respuesta del perfil. Se conserva la regla que cierra sesiones de administrador anteriores.
- `src/app/api/cron/bold-fallback/route.ts`: responde 401 (antes 403) cuando la autorización falla.
- POS (`pos-frontend-casa-verde`): cambios de comisiones de medios de pago, imágenes de categorías y envío del
  modo POS. Ver el historial de la sesión.

## 5. Crons del VPS

Archivos en `deploy/cron/`: `cv-cron.sh`, `crontab.cv` (horarios en Bogotá), `cron.env.example`, `verificar.sh`
y `README.md`. Verificado en local sin efectos: las 7 rutas rechazan peticiones sin secreto o con secreto falso
(401); el script envía la cabecera `Authorization: Bearer` correcta y sale con 1 ante un secreto falso.
No se ejecutó ningún cron con el secreto válido.

Antes de activar en el VPS: `NODE_ENV=production` en la web, y `verificar.sh` debe terminar en `TODO OK`.

## 6. Correo (SMTP)

### Valores reales del VPS (`~/casa-verde-web-qa/.env`)

```
SMTP_HOST=127.0.0.1
SMTP_PORT=25
SMTP_SECURE=false
SMTP_FROM_EMAIL=admin@casaverdeoficial.com
SMTP_FROM_NAME=Casa Verde
ADMIN_ORDER_EMAIL=juancamilo.campobarrios@gmail.com
AUDIT_ADMIN_EMAIL=juancamilo.campobarrios@gmail.com
```

No tienen `SMTP_USER` ni `SMTP_PASS`: Postfix del VPS acepta correo solo desde localhost.

### Estado del VPS (según lo informado)

- Postfix y OpenDKIM instalados y configurados. Registros SPF, DKIM y DMARC publicados. PTR de `2.25.74.194`
  apunta a `mail.casaverdeoficial.com`.
- Un correo de prueba enviado desde el VPS llegó a Gmail con SPF, DKIM y DMARC en PASS.
- Lo que tiene las variables arriba es `~/casa-verde-web-qa/.env`. Que la web esté desplegada con ese `.env`
  se confirma en el VPS, no aquí.

### Qué hay que revisar en el VPS

1. Antes de borrar líneas de `~/casa-verde-web-qa/.env`, ver las líneas exactas con
   `sed -n '28,33p' ~/casa-verde-web-qa/.env`. Las líneas 30 y 31 son las antiguas con `talentocasaverde@gmail.com`,
   según la nota del VPS. Borrar solo esas dos y verificar después con el `grep` de la sección anterior.
2. Confirmar que la web QA usa esas variables: reiniciar la web y revisar que un registro envíe el código al correo.
3. Confirmar que no quedan `SMTP_USER` ni `SMTP_PASS` con valores antiguos en `.env` (si quedan, la conexión a
   Postfix en 127.0.0.1 puede fallar al autenticar).

### Local (Mailpit)

- Contenedor `casa-verde-mailpit` (`axllent/mailpit`): SMTP en `127.0.0.1:1025`, web en `127.0.0.1:8025`.
- `.env` local: `SMTP_HOST=127.0.0.1`, `SMTP_PORT=1025`, sin usuario ni contraseña. Los correos no salen a internet.
- Prueba hecha: registro con 201 y correo recibido en Mailpit.

### Pruebas con el SMTP real del VPS (opcional)

Túnel SSH hacia el Postfix del VPS: `ssh -L 2525:127.0.0.1:25 usuario@vps`, y en local `SMTP_PORT=2525`.
Esto envía correos reales: usar solo un correo propio como destinatario.

## 7. Pendiente

- Decidir la fuente de datos de la web en el VPS (ver sección 3).
- Rotar la contraseña de Neon (se imprimió en la salida de un comando fallido).
- Confirmar en el VPS la sección 6, en los puntos 1 a 3.

## 8. Web en Docker (local) y qué cambiar en el VPS

Local (funcionando): `docker-compose.web.yml` levanta `casa-verde-web` (puerto 3000) y `casa-verde-mailpit` (8025).
- `.env`: variables públicas, integraciones y `IMAGES_UNOPTIMIZED=true`, `NEXT_PUBLIC_POS_MEDIA_BASE_URL=http://localhost:8080/api`.
- `.env.docker` (no versionar): base del contenedor (`casa-verde-web-postgres`), SMTP de Mailpit, y `POS_API_BASE_URL`
  apuntando a `http://host.docker.internal:8080/api/public/catalog` con las claves del POS.
- `secrets/db_build_url.txt` (no versionar): URL usada solo en el build.
- `.dockerignore` excluye `.env*` y `secrets`: ningún secreto queda dentro de la imagen.
- Motivo de `IMAGES_UNOPTIMIZED`: dentro del contenedor, `localhost` no es el POS, así que el optimizador de Next no
  puede descargar las fotos. Con el interruptor, Next usa las imágenes tal cual y el navegador las carga del POS.

Para el VPS:
1. `IMAGES_UNOPTIMIZED` debe quedar vacío o sin definir. Solo es para local.
2. `NEXT_PUBLIC_POS_MEDIA_BASE_URL` debe ser la URL pública del POS en el VPS (con `https`), no `localhost`.
   Se fija en el build: si cambia, reconstruir la imagen.
3. `POS_API_BASE_URL`, `POS_API_KEY` y `POS_WEBHOOK_SECRET` deben apuntar al POS del VPS, con sus claves reales.
4. `NEXT_PUBLIC_APP_URL` debe ser el dominio real (no el túnel de ngrok de local).
5. Las variables de correo del VPS ya están documentadas en la sección 6.
6. Build con el secreto `db_build_url` apuntando a la base del VPS, o un valor de build válido si no se conecta.

## 9. Cambios para subir al repositorio (revisión antes del commit)

- **Correo:** el proveedor de correo pasó de Resend a SMTP (`nodemailer`). `src/services/email/resend.ts` se elimina,
  `src/services/email/smtp.ts` es nuevo y `src/services/email/index.ts` lo usa. `email:test` corre con `tsx`.
- **Dependencias:** se quitaron `@neondatabase/serverless`, `@prisma/adapter-neon`, `@vercel/analytics` y
  `@vercel/speed-insights`; se agregaron `nodemailer`, `@types/nodemailer` y `tsx`.
- **Docker:** `Dockerfile`, `.dockerignore`, `docker-compose.web.yml`, `docker-compose.web-db.yml` (no incluido en
  `.env`, solo referencia de la base del contenedor).
- **Crons:** carpeta `deploy/cron/` y `deploy/VPS-REGISTRO-LOCAL.md`.
- **No se suben (ignorados por git):** `.env`, `.env.local`, `.env.docker`, `.env.cron`, `.env.webdb` y `secrets/`.
  Verificado con `git status --ignored`: ninguno aparece como cambio.
- **Pendiente de decidir:** `AGENTS.md` lo genera `next dev` y aparece sin seguimiento. No es parte del cambio.
- **Datos personales en docs:** este archivo y `deploy/cron/README.md` mencionan correos de prueba. Revisarlos antes
  de publicar el repositorio.

## 10. Cambios de QA (imágenes de pedidos, envío en caja)

**Hecho en local, pendiente de desplegar en QA:**
- **Web, imágenes de «Mis pedidos»** (`src/lib/media-url.ts`): al pagar, la web conservaba la foto solo si era de
  Bunny. Las fotos del POS (`NEXT_PUBLIC_POS_MEDIA_BASE_URL/media/...`) se descartaban y el pedido quedaba sin imagen.
  Ahora se conservan. **Los pedidos ya creados en QA siguen sin foto**: no se recuperan solos.
- **POS, envío en caja** (V150 + `PaymentLedgerService.recordShippingCost` + `WebOrderFulfillmentService`): al pasar
  un pedido web a «Enviado», caja registra un egreso del valor del envío (`sales.sales.shipping_cost`), tipo
  «Envíos», desde el medio **Efectivo**, responsable SISTEMA/POS, código `ENVIO_PAGADO_CAJA`. Una sola vez por pedido.
  Si falta el medio «Efectivo» o el tipo «Envíos», el cambio a enviado falla con un mensaje claro.
  Pendiente de confirmar: qué medio debe pagar los envíos (hoy Efectivo) y si el valor es el del cliente o el de la transportadora.

**Pendiente de investigar con datos reales de QA (no reproducido en local):**
- Estado de «Mis pedidos» que no se actualiza después de cambiarlo en el POS. El código consulta el estado en vivo al POS
  (cada 30 s); revisar en QA la respuesta de `/api/profile/orders` (`posAvailable`) y el log `[Mis pedidos]`.
- Nombres mostrados como códigos en la compra: no se encontró el camino que lo produce en el código. Necesita la pantalla exacta.

**En el VPS:**
1. Desplegar el backend del POS (aplica V150 automáticamente al arrancar).
2. Confirmar que existe el medio «Efectivo» activo y que no es de crédito.
3. Desplegar la web con este cambio (la imagen se construye de nuevo).

## 11. Reportes → Egresos eliminado; Caja con filtro de egresos

- **Eliminado (frontend POS):** la pantalla Reportes → Egresos, su ruta, su entrada de menú, sus exportaciones
  (Excel, PDF) y sus pruebas. El botón «Ver detalles» de Reportes → Ingresos ahora abre Tienda → Caja con el filtro
  «Egreso» (`/treasury?movimiento=OUT`).
- **Caja (POS):** la fecha se muestra como `12/11/2026`; la columna «Descripción» reemplaza a «Nombre» y muestra los
  productos de la venta (nombre · color · talla × cantidad) o el concepto del movimiento; se quitó el texto pequeño
  de referencia debajo.
- **Ver detalle (POS):** muestra la descripción del movimiento y los números de venta y de pedido web con etiquetas
  «(sistema)», para que se entienda que son referencias internas.
- **Backend (POS):** el libro de caja incluye `productos` (solo ventas). Requiere desplegar el backend del POS.
- **Pruebas que ya fallaban antes de este cambio (no relacionadas):** 7 pruebas de `treasury.test.tsx` sobre el
  formulario de ingreso o egreso y el filtro «Movimiento» (verificado contra la versión de HEAD).

## 12. Reportes → Ingresos eliminado (frontend POS)

- Eliminado: la pantalla Reportes → Ingresos, su ruta, su entrada de menú, sus exportaciones (Excel y PDF), el hook
  de reporte de ingresos y sus pruebas. Las pantallas de Reportes que quedan son Ventas, Costos Productos,
  Rentabilidad de productos, Kardex y Medios de pago.
- Para ver los ingresos se usa Tienda → Caja con el filtro «Ingreso» (`/treasury?movimiento=IN`).
- El endpoint del backend `/reports/ingresos` queda en el backend; ya no lo consume el frontend.

## 13. Endpoints de Ingresos y Egresos eliminados (backend POS)

- Eliminados: `GET /api/reports/egresos` y `GET /api/reports/ingresos`, con su servicio (`CashFlowReportService`),
  su repositorio (`JdbcCashFlowReportRepository`), sus DTO (`CashFlowReportDtos`) y su prueba de integración.
- Frontend: sin `cashFlow.ts` ni fixtures de ingresos o egresos. El único uso que quedaba, el formato de fecha, está en
  `src/lib/formatDay.ts`.
- Caja (`GET /api/treasury/...`, filtros `movimiento=IN|OUT`) es la única fuente de ingresos y egresos.
- Requiere desplegar el backend del POS en QA; si la web QA aún llama a `/reports/egresos` o `/reports/ingresos`, no
  debe hacerlo después de este cambio.

## 14. Proveedores: pestaña dentro de Tienda → Usuarios (frontend POS)

- Configuraciones → Proveedores eliminado (ruta, entrada de menú y título). La ruta `/settings/suppliers` redirige a `/usuarios`.
- Tienda → Usuarios tiene la pestaña «Proveedores» (listado, búsqueda, filtro de estado, Nuevo, Editar, Información,
  Activar/Desactivar, exportación PDF/Excel). El formulario es el mismo de antes (`SupplierForm`).
- Roles: Usuarios se muestra a ADMIN, SUPERADMIN y CONTABILIDAD. Cada rol ve solo sus pestañas: Clientes, Administradores
  y Trabajadores para ADMIN/SUPERADMIN; Proveedores para ADMIN, SUPERADMIN y CONTABILIDAD.
- Sin cambios de backend: los endpoints de proveedores son los mismos.
- Prueba conocida intermitente: `login.test.tsx` («recargar la página con la IP bloqueada»), depende de la hora.
