import { Redis } from "@upstash/redis";

const CACHE_KEY = "shipping:config:v2";
const TTL_SECONDS = 600; // 10 min

export type ShippingCacheShape = {
  freeShippingThreshold: number;
  rateByDepartment: Record<string, number>; // key = normalizedDepartmentName
  rateByCity: Record<string, number>; // key = normalizedCityName|normalizedDepartmentName (excepción)
};

// In-memory fallback para desarrollo local sin redis configurado
let inMemoryCache: { data: ShippingCacheShape; expires: number } | null = null;

function getRedisInstance(): Redis | null {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return null;
}

export async function getCachedShippingConfig(): Promise<ShippingCacheShape | null> {
  const redis = getRedisInstance();
  if (redis) {
    try {
      const raw = await redis.get<string>(CACHE_KEY);
      // Upstash sometimes parses JSON automatically if it was stored as stringified JSON,
      // but let's handle both cases just in case.
      if (typeof raw === "string") return JSON.parse(raw);
      if (raw && typeof raw === "object") return raw as unknown as ShippingCacheShape;
      return null;
    } catch (e) {
      console.warn("Error reading from Redis shipping cache", e);
      return null;
    }
  }

  // Fallback in-memory
  if (inMemoryCache && inMemoryCache.expires > Date.now()) {
    return inMemoryCache.data;
  }
  return null;
}

export async function setCachedShippingConfig(data: ShippingCacheShape) {
  const redis = getRedisInstance();
  if (redis) {
    try {
      await redis.set(CACHE_KEY, JSON.stringify(data), { ex: TTL_SECONDS });
    } catch (e) {
      console.warn("Error writing to Redis shipping cache", e);
    }
    return;
  }

  // Fallback in-memory
  inMemoryCache = {
    data,
    expires: Date.now() + TTL_SECONDS * 1000,
  };
}

export async function invalidateShippingCache() {
  const redis = getRedisInstance();
  if (redis) {
    try {
      await redis.del(CACHE_KEY);
    } catch (e) {
      console.warn("Error deleting from Redis shipping cache", e);
    }
  }
  inMemoryCache = null;
}
