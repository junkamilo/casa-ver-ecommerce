# Configuración del Sistema de Emails - Casa Verde

## 📋 Estado Actual

- ✅ Servicio de email implementado en `src/services/email/client.ts`
- ✅ Dependencia `resend@^6.9.3` instalada
- ✅ API Key configurada en `.env.local`
- ❓ Email "from" (`noreply@casaverdeoficial.com`) necesita verificarse en Resend

## 🔴 Problema Identificado

El email no se envía después de la compra porque **el dominio `casaverdeoficial.com` probablemente NO está verificado en Resend**.

En Resend, hay dos modos:
1. **Modo Testing** (localhost/desarrollo) - cualquier email funciona
2. **Modo Producción** (dominio real) - necesitas verificar el dominio

## ✅ Pasos para Configurar

### 1. Verificar/Configurar en Panel de Resend

1. Ve a https://resend.com/emails
2. Inicia sesión con tu cuenta de Resend
3. En el menú lateral, busca **"Domains"** o **"Settings"**
4. Verifica el dominio `casaverdeoficial.com`:
   - Si está en rojo ❌: Necesitas agregar registros DNS
   - Si está en verde ✅: Ya está verificado

### 2. Si el Dominio NO está Verificado

Opción A: **Verificar el dominio (Recomendado)**
1. En Resend, haz clic en "Add Domain"
2. Ingresa `casaverdeoficial.com`
3. Resend te dará registros DNS para agregar en tu registrador (GoDaddy, Namecheap, etc.)
4. Espera 24-48h para que se propague

Opción B: **Usar un email de testing (Temporal)**
1. En Resend, busca "Approved Senders" o "Authorized Addresses"
2. Agrega `noreply@casaverdeoficial.com` como dirección autorizada
3. Espera a que sea aprobado (puede tomar minutos u horas)

### 3. Alternativa: Usar Email de Testing

Si estás en desarrollo o testing rápido, usa un email de testing de Resend:
- Cambiar el email "from" a: `onboarding@resend.dev`
- Esto funciona en cualquier cuenta de Resend sin verificación

### 4. Validar Configuración

Usa el endpoint de diagnóstico para verificar la configuración:

```bash
# Verificar si está configurado correctamente
curl http://localhost:3000/api/admin/email-test

# Enviar email de prueba (requiere ser admin)
curl -X POST http://localhost:3000/api/admin/email-test \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "tu-email@example.com",
    "customerName": "Nombre de Prueba"
  }'
```

## 📧 Flujo de Emails Actual

```
1. Cliente realiza compra
   ↓
2. Se crea orden en estado PENDING
   ↓
3. Se envía a pasarela de pago (Bold)
   ↓
4. Usuario paga
   ↓
5. Bold envía webhook a /api/webhooks/bold
   ↓
6. Se marca orden como PAID
   ↓
7. Se intenta enviar email de confirmación
   ↓
8. Si falla el email, se registra en:
   - order.confirmationEmailFailedAt
   - order.confirmationEmailError
```

## 🔍 Debugging

### Ver logs en base de datos

```sql
SELECT
  id,
  orderNumber,
  confirmationEmailSentAt,
  confirmationEmailFailedAt,
  confirmationEmailError
FROM orders
ORDER BY createdAt DESC
LIMIT 10;
```

### Ver logs de webhooks

```sql
SELECT
  eventType,
  status,
  errorMessage,
  createdAt
FROM webhook_logs
WHERE provider = 'BOLD'
ORDER BY createdAt DESC
LIMIT 10;
```

### Logs en consola del servidor

Al ejecutar `npm run dev`, busca líneas que empiecen con:
- `[Email]` - Logs del servicio de email
- `[BOLD WEBHOOK]` - Logs del webhook de Bold

## 📝 Variables de Entorno Necesarias

```env
# Email (ya configurado)
RESEND_API_KEY="re_iuvuZo7d_AGuoj1L7LZPUcFiXP4ottrke"

# Bold webhook (en sandbox, puede ser vacío)
BOLD_WEBHOOK_SECRET=""

# URL de la aplicación (ya configurado)
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="https://casaverdeoficial.com"
```

## 🚀 Próximos Pasos

1. **Ahora**: Verifica el dominio en Resend o agrega `noreply@casaverdeoficial.com` como dirección autorizada
2. **Inmediatamente después**: Prueba el endpoint `/api/admin/email-test`
3. **Luego**: Realiza una compra de prueba y verifica que llegue el email
4. **Registra en BD**: Si falla, revisa `confirmationEmailError` en la orden

## 📧 Próximas Fases (No Implementadas Aún)

- [ ] Email de confirmación de envío (cuando se envía el paquete)
- [ ] Email de notificación de entrega (cuando llega el paquete)
- [ ] Email a admin cuando hay nueva orden
- [ ] Email de recuperación de carrito abandonado
- [ ] Resends automáticos si el email falla (retry)

