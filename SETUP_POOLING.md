# 🚀 GUÍA RÁPIDA: CONFIGURACIÓN DE POOLING (FASE 1.1)

## ✅ Lo que hice

1. ✅ Actualicé `schema.prisma` con comentarios sobre pooling (línea 5-8)
2. ✅ Creé `.env.production` con toda la configuración necesaria

## 📋 QUÉ DEBES HACER AHORA

### Paso 1: Copiar valores a `.env.production`
Tu `.env` actual ya tiene la mayoría de valores. Solo reemplaza:

```bash
# Neon Casa Verde (cuenta actual)
DATABASE_URL="postgresql://...@ep-round-fire-au85zzmd-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=15&pool_timeout=15"
DIRECT_URL="postgresql://...@ep-round-fire-au85zzmd.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=15"

# Valores reales en .env / .env.local / .env.production
```

### Paso 2: Testear Conexión en Local
```bash
npm run prisma:generate
npx prisma db push --skip-generate  # Verifica conexión
```

### Paso 3: Verificar Neon Panel
Entra a [Neon Console](https://console.neon.tech):
- ✅ Verifica que pooler esté ENABLED
- ✅ Confirma que pool_size está en 10-20
- ✅ Checa que connection_timeout = 15s

## 🎯 RESULTADO ESPERADO

**Sin estos cambios:**
- 100 usuarios simultáneos = 100 conexiones abiertas a DB
- Postgres rechaza después de ~200 conexiones → CRASH

**Con estos cambios:**
- 100 usuarios simultáneos = ~20 conexiones reutilizadas
- Pool rota conexiones automáticamente
- Aguanta 500+ usuarios simultáneos

## 📊 Cómo Verificar

```bash
# Ver conexiones activas en Neon
# Neon Console → Monitoring → Active Connections
# Debe estar en rango 10-20, no 100+
```

## ⚠️ IMPORTANTE

El pooling está configurado, pero aún faltan:
1. ❌ Rate limiting en endpoints
2. ❌ Paginación en admin products
3. ❌ Arreglar stock alerts

Próximo paso: **FASE 2** (Stock Alerts optimization)

---

**Duración estimada:** 30 minutos + testing

¿Pasamos a FASE 2?
