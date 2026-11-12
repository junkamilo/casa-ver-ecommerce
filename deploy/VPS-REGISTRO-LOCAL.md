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
