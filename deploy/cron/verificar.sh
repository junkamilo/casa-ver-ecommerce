#!/usr/bin/env bash
# Verificación SIN efectos de los crons de la web en el VPS. No envía correos, no escribe en el POS ni en la base:
# solo comprueba que cada ruta existe y rechaza peticiones sin el secreto correcto.
#
# Uso: bash verificar.sh [archivo_de_config]     (por defecto /etc/casa-verde/cron.env)
# Sale con 0 si todo está bien; con 1 si alguna ruta no rechaza o si la config falla.
set -uo pipefail

ENV_FILE="${1:-${CV_CRON_ENV:-/etc/casa-verde/cron.env}}"
JOBS="bold-fallback abandoned-cart abandoned-checkout payment-audit pos-sync pos-orders review-requests"

leer_var() {
  grep -E "^$1=" "$ENV_FILE" | tail -n 1 | cut -d= -f2- \
    | sed -e 's/\r$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

FALLOS=0
if [ ! -r "$ENV_FILE" ]; then
  echo "FALLO: no se puede leer $ENV_FILE"
  exit 1
fi

CRON_SECRET="$(leer_var CRON_SECRET)"
APP_URL="$(leer_var CV_APP_URL)"
APP_URL="${APP_URL:-http://127.0.0.1:3000}"

if [ -z "$CRON_SECRET" ]; then
  echo "FALLO: CRON_SECRET vacío en $ENV_FILE"
  exit 1
fi
if [ "${#CRON_SECRET}" -lt 32 ]; then
  echo "AVISO: CRON_SECRET tiene menos de 32 caracteres; usar un valor largo y aleatorio"
  FALLOS=$((FALLOS + 1))
fi

echo "Web: ${APP_URL%/}"
echo "Config: $ENV_FILE"
echo

# La web debe responder (cualquier respuesta HTTP sirve; 000 significa que no hay servidor).
CODIGO_RAIZ="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "${APP_URL%/}/api/cron/pos-sync")"
if [ "$CODIGO_RAIZ" = "000" ]; then
  echo "FALLO: la web no responde en ${APP_URL%/}"
  exit 1
fi
echo "web responde (http=$CODIGO_RAIZ)"
echo

for JOB in $JOBS; do
  SIN="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "${APP_URL%/}/api/cron/${JOB}")"
  FALSO="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 \
    -H 'Authorization: Bearer no-es-el-secreto' "${APP_URL%/}/api/cron/${JOB}")"
  if [ "$SIN" = "401" ] && [ "$FALSO" = "401" ]; then
    echo "OK    $JOB  sin_cabecera=$SIN  secreto_falso=$FALSO"
  else
    echo "FALLO $JOB  sin_cabecera=$SIN  secreto_falso=$FALSO  (se esperaba 401 y 401)"
    FALLOS=$((FALLOS + 1))
  fi
done

echo
# El script rechaza un secreto falso (debe salir con 1).
TMP_ENV="$(mktemp)"
trap 'rm -f "$TMP_ENV"' EXIT
{ echo "CRON_SECRET=no-es-el-secreto"; echo "CV_APP_URL=${APP_URL}"; } > "$TMP_ENV"
CV_CRON_ENV="$TMP_ENV" CV_CRON_LOG="${TMPDIR:-/tmp}/cv-cron-verificacion.log" \
  "$(dirname "$0")/cv-cron.sh" pos-sync > /dev/null 2>&1
if [ $? -eq 1 ]; then
  echo "OK    cv-cron.sh rechaza un secreto falso (salida 1)"
else
  echo "FALLO cv-cron.sh no rechazó un secreto falso"
  FALLOS=$((FALLOS + 1))
fi

echo
if [ "$FALLOS" -eq 0 ]; then
  echo "Verificación sin efectos: TODO OK. El primer ciclo real queda pendiente (ver README)."
  exit 0
fi
echo "Verificación: $FALLOS problema(s). Revisar antes de activar los crons."
exit 1
