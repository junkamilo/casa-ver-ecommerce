/**
 * Caché geográfico basado en Upstash Redis (producción) con fallback in-memory (dev).
 *
 * Patrón: cachear lecturas públicas bajo una clave única por query.
 * Al mutar desde admin, llamar invalidateGeography() para borrar TODO
 * el prefijo "geo:" y que el próximo request público reconstruya.
 *
 * Este enfoque evita el revalidate por tiempo (86400s) que deja cambios
 * invisibles hasta 24h, y evita unstable_cache/cacheTag cuya API varía
 * entre releases de Next.js 15/16.
 */

import { Redis } from "@upstash/redis";

const GEO_PREFIX = "geo:";
const TTL_SECONDS = 86400; // 24h — actúa como fallback; la invalidación real es manual

// ── Redis instance (singleton) ──────────────────────────────────────────────

function getRedisInstance(): Redis | null {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return null;
}

// ── In-memory fallback (dev sin Redis) ──────────────────────────────────────

const memoryCache = new Map<string, { data: unknown; expires: number }>();

// ── API pública ─────────────────────────────────────────────────────────────

/**
 * Envuelve una lectura y la cachea bajo `geo:<key>`.
 * Si ya está en caché, retorna el valor cacheado sin tocar la BD.
 */
export async function cachedGeoRead<T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const fullKey = GEO_PREFIX + key;
  const redis = getRedisInstance();

  // 1. Intentar leer de caché
  if (redis) {
    try {
      const cached = await redis.get<string>(fullKey);
      if (cached !== null && cached !== undefined) {
        // Upstash a veces parsea automáticamente
        if (typeof cached === "string") return JSON.parse(cached) as T;
        return cached as unknown as T;
      }
    } catch (e) {
      console.warn("[geo-cache] Error reading Redis:", e);
    }
  } else {
    const entry = memoryCache.get(fullKey);
    if (entry && entry.expires > Date.now()) {
      return entry.data as T;
    }
  }

  // 2. Cache miss → ejecutar fetcher
  const data = await fetcher();

  // 3. Guardar en caché
  if (redis) {
    try {
      await redis.set(fullKey, JSON.stringify(data), { ex: TTL_SECONDS });
    } catch (e) {
      console.warn("[geo-cache] Error writing Redis:", e);
    }
  } else {
    memoryCache.set(fullKey, {
      data,
      expires: Date.now() + TTL_SECONDS * 1000,
    });
  }

  return data;
}

/**
 * Invalida TODAS las claves geo:* en Redis.
 * Llamar en TODA mutación admin (create/update/toggle).
 *
 * Upstash no tiene `KEYS` nativo en serverless (REST), así que mantenemos
 * un set de claves conocidas para borrarlas.
 */
const KNOWN_KEY_PATTERNS = [
  "countries:active",
  // Los de departamentos y municipios se generan dinámicamente,
  // así que usamos un registro manual.
];

// Set global de claves dinámicas registradas durante la sesión del servidor
const registeredKeys = new Set<string>();

export function registerGeoKey(key: string) {
  registeredKeys.add(key);
}

export async function invalidateGeography() {
  const redis = getRedisInstance();

  // Recolectar todas las claves a borrar
  const allKeys = [
    ...KNOWN_KEY_PATTERNS.map((k) => GEO_PREFIX + k),
    ...Array.from(registeredKeys).map((k) => GEO_PREFIX + k),
  ];

  if (redis && allKeys.length > 0) {
    try {
      // Upstash soporta pipeline para borrar en batch
      const pipeline = redis.pipeline();
      for (const key of allKeys) {
        pipeline.del(key);
      }
      await pipeline.exec();
    } catch (e) {
      console.warn("[geo-cache] Error invalidating Redis:", e);
    }
  }

  // Siempre limpiar in-memory (puede haber ambos en dev)
  for (const key of memoryCache.keys()) {
    if (key.startsWith(GEO_PREFIX)) {
      memoryCache.delete(key);
    }
  }

  registeredKeys.clear();
}
