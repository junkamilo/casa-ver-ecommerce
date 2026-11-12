# Crons de la web en el VPS

Vercel ejecutaba estos crons con `vercel.json`. En el VPS los dispara el cron del sistema con `cv-cron.sh`,
que envía `Authorization: Bearer <CRON_SECRET>` a `GET /api/cron/<nombre>` de la web.

## Archivos

| Archivo | Para qué |
|---|---|
| `cv-cron.sh` | Dispara un cron por nombre y registra el resultado. Sale con 1 si la ruta no responde 200. |
| `crontab.cv` | Horarios en hora de Bogotá (`CRON_TZ=America/Bogota`). |
| `cron.env.example` | Plantilla del archivo de configuración del VPS. |

## Horarios (hora de Bogotá)

| Hora | Cron | Qué hace |
|---|---|---|
| 21:00 diario | `bold-fallback` | Respaldo de pagos Bold y reintento de correos de confirmación. |
| 22:00 diario | `abandoned-cart` | Correo a carritos sin tocar hace más de 1 hora. |
| 23:00 diario | `abandoned-checkout` | Correo a pedidos pendientes de pago hace más de 1 hora. |
| 04:00 lunes | `payment-audit` | Auditoría semanal de pagos. Resumen al administrador. |
| 01:00 diario | `pos-sync` | Sincronización del catálogo desde el POS. |
| 01:30 diario | `pos-orders` | Reenvío de pedidos pagados y cancelaciones al POS. |
| 10:00 diario | `review-requests` | Solicitud de reseña 7 días después de la entrega. **Pendiente de confirmar.** |

No se programa `retry-order-emails`: `bold-fallback` ya reintenta esos correos y dos reintentos podrían duplicar envíos.

## Instalación en el VPS

1. Comprobar que el cron soporta `CRON_TZ`: `man 5 crontab` debe mencionarlo. Si no, usar los horarios en UTC
   (21:00 Bogotá = 02:00 UTC, y así para el resto) y quitar la línea `CRON_TZ`.
2. Confirmar que la web corre en producción: `NODE_ENV=production` en su `.env`. Con `NODE_ENV=development`,
   `bold-fallback` acepta peticiones sin cabecera.
3. Instalar el script:
   ```bash
   sudo install -m 755 deploy/cron/cv-cron.sh /usr/local/bin/cv-cron.sh
   ```
4. Crear la configuración:
   ```bash
   sudo mkdir -p /etc/casa-verde /var/log/casa-verde
   sudo install -m 600 deploy/cron/cron.env.example /etc/casa-verde/cron.env
   sudo nano /etc/casa-verde/cron.env   # CRON_SECRET igual que la web; CV_APP_URL si cambia el puerto
   ```
5. Instalar los horarios en el crontab del usuario que ejecuta el script (no hace falta root):
   ```bash
   crontab -l 2>/dev/null > /tmp/cron.actual; cat deploy/cron/crontab.cv >> /tmp/cron.actual; crontab /tmp/cron.actual
   ```
   Si ya hay líneas de otros programas, revisarlas antes de instalar para no duplicarlas.

## Probar sin enviar correos

`cv-cron.sh` manda correos y escribe en el POS cuando corre con éxito. Para probar la conexión sin efectos,
usar un secreto equivocado: la ruta responde 401 y el script termina con código 1.

```bash
CV_CRON_ENV=/ruta/a/un/env/con/secreto/falso /usr/local/bin/cv-cron.sh payment-audit; echo $?
```

Después de la primera ejecución real, revisar `/var/log/casa-verde/cron.log`: cada línea muestra el nombre del
cron, el código HTTP y la respuesta.

## Prueba local (Windows)

Windows no tiene cron. Para probar el script y la autenticación contra la web local:

1. `npx next build` y `npx next start -p 3000` en la carpeta de la web (modo producción, base local del contenedor).
2. `CV_CRON_ENV=.env.cron bash deploy/cron/cv-cron.sh <nombre>`. `.env.cron` tiene el mismo `CRON_SECRET` que `.env`
   y `CV_APP_URL=http://127.0.0.1:3000`.

Cada cron con éxito ejecuta su tarea real (correos, POS). Por eso la prueba local solo comprueba la autenticación:
con un secreto falso, todas las rutas deben responder 401.

## Verificar después de instalar (sin efectos)

```bash
bash /ruta/a/deploy/cron/verificar.sh          # usa /etc/casa-verde/cron.env
```

Comprueba que la web responde, que las siete rutas rechazan peticiones sin el secreto correcto y que el script
rechaza un secreto falso. No envía correos ni escribe en el POS o en la base. Debe terminar con `TODO OK`.

## Primer ciclo real (lo que hay que revisar)

Estas comprobaciones solo se pueden hacer con los crons corriendo, porque ejecutarlos antes enviaría correos y
escribiría en el POS. Revisar `/var/log/casa-verde/cron.log` después de cada ejecución: `http=200` es éxito.

| Cron | Hora (Bogotá) | Qué esperar |
|---|---|---|
| `pos-sync` | 01:00 | `http=200` con `products.seen` igual al número de productos publicados en el POS y `errors: []`. |
| `pos-orders` | 01:30 | `http=200`. Los pedidos ya registrados aparecen como `replayed` o `skipped`. |
| `bold-fallback` | 21:00 | `http=200`. Pedidos pendientes revisados contra Bold. |
| `abandoned-cart` | 22:00 | `http=200`. Correos solo a carritos sin tocar más de 1 hora. |
| `abandoned-checkout` | 23:00 | `http=200`. Ver pendiente abajo. |
| `payment-audit` | lunes 04:00 | `http=200`. Llega un correo de auditoría al administrador. |
| `review-requests` | 10:00 | Ver pendiente abajo. |

Si aparece `http=401`, el `CRON_SECRET` del VPS no coincide con el de la web: corregir `/etc/casa-verde/cron.env`.
Si aparece `http=000`, la web no responde en `CV_APP_URL`: revisar que esté corriendo y el puerto.

## Pendientes antes de activar

- **`abandoned-checkout`**: los 8 pedidos de prueba pendientes de la base local se eliminaron. Antes de activar el cron, revisar que no haya pedidos reales pendientes de pago hace más de 1 hora con cliente verificado.
- **`review-requests`** depende de la lista de entregas del POS. No se pudo verificar sin llamar al POS y enviar
  correos. Confirmar la hora (10:00 propuesta) y revisar el primer resultado en el log.
- **Horarios de carrito y checkout abandonados** (22:00 y 23:00): son horas tardías para un recordatorio. Es decisión
  de negocio; si se mueven, editar `crontab.cv`.
- **`NODE_ENV=production`** en la web del VPS. Con `development`, `bold-fallback` acepta peticiones sin cabecera.
