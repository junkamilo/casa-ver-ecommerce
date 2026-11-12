#!/usr/bin/env bash
# Dispara un cron de la web: GET /api/cron/<nombre> con "Authorization: Bearer <CRON_SECRET>".
#
# Uso:    cv-cron.sh <nombre>        (nombres en CRON_JOBS más abajo)
# Config: archivo con CRON_SECRET y CV_APP_URL. Por defecto /etc/casa-verde/cron.env;
#         otro archivo: CV_CRON_ENV=/ruta/archivo cv-cron.sh <nombre>
# Log:    /var/log/casa-verde/cron.log (o CV_CRON_LOG=/ruta)
#
# Se lee cada variable con grep, sin ejecutar el archivo: un secreto con $ o comillas no rompe el script.
# Sale con código 0 solo si la ruta respondió 200.
set -uo pipefail

CRON_JOBS="bold-fallback abandoned-cart abandoned-checkout payment-audit pos-sync pos-orders review-requests"

JOB="${1:-}"
case " $CRON_JOBS " in
  *" $JOB "*) ;;
  *) echo "uso: $0 <${CRON_JOBS// /|}>" >&2; exit 2 ;;
esac

ENV_FILE="${CV_CRON_ENV:-/etc/casa-verde/cron.env}"
LOG_FILE="${CV_CRON_LOG:-/var/log/casa-verde/cron.log}"

log() {
  local linea
  linea="$(date '+%Y-%m-%d %H:%M:%S') $*"
  echo "$linea"
  mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null && echo "$linea" >> "$LOG_FILE" 2>/dev/null
}

leer_var() {
  grep -E "^$1=" "$ENV_FILE" | tail -n 1 | cut -d= -f2- \
    | sed -e 's/\r$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

if [ ! -r "$ENV_FILE" ]; then
  log "job=$JOB error=no_se_puede_leer_$ENV_FILE"
  exit 2
fi

CRON_SECRET="$(leer_var CRON_SECRET)"
APP_URL="$(leer_var CV_APP_URL)"
APP_URL="${APP_URL:-http://127.0.0.1:3000}"

if [ -z "$CRON_SECRET" ]; then
  log "job=$JOB error=falta_CRON_SECRET_en_$ENV_FILE"
  exit 2
fi

CUERPO="$(mktemp)"
trap 'rm -f "$CUERPO"' EXIT

# 900 s: pos-sync y pos-orders pueden tardar varios minutos.
CODIGO="$(curl -sS -o "$CUERPO" -w '%{http_code}' --max-time 900 \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  "${APP_URL%/}/api/cron/${JOB}" 2>>"$LOG_FILE")" || CODIGO="000"

RESPUESTA="$(head -c 1500 "$CUERPO" | tr '\n' ' ')"
log "job=$JOB http=$CODIGO respuesta=${RESPUESTA}"

[ "$CODIGO" = "200" ]
