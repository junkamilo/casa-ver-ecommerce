/**
 * Rate Limiter — usa Upstash Redis cuando está configurado (producción),
 * cae a Map en-memory como fallback (desarrollo sin Redis).
 *
 * IMPORTANTE: `rateLimit` es async porque Upstash requiere red.
 * Los callers deben usar `await rateLimit(...)`.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Tipos compartidos ─────────────────────────────────────────────────────────

export interface RateLimitConfig {
  limit: number;
  window: number; // segundos
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter: number | null;
}

// ── Configuraciones por endpoint ──────────────────────────────────────────────

export const RATE_LIMIT_CONFIGS = {
  search:      { limit: 50,  window: 60 },
  cart:        { limit: 100, window: 60 },
  stockAlerts: { limit: 20,  window: 60 },
  admin:       { limit: 100, window: 60 },
  checkout:    { limit: 10,  window: 60 },
  api:         { limit: 100, window: 60 },
  auth:        { limit: 10,  window: 60 }, // registro / forgot-password
} as const;

// ── Upstash ───────────────────────────────────────────────────────────────────

function hasUpstash() {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

// Cache de instancias Ratelimit por clave de config (evita recrear en cada request)
const upstashLimiters = new Map<string, Ratelimit>();

function getUpstashLimiter(config: RateLimitConfig): Ratelimit {
  const key = `${config.limit}:${config.window}`;
  if (!upstashLimiters.has(key)) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    upstashLimiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.limit, `${config.window} s`),
        analytics: false,
      })
    );
  }
  return upstashLimiters.get(key)!;
}

async function checkUpstash(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const limiter = getUpstashLimiter(config);
  const { success, remaining, reset } = await limiter.limit(identifier);

  const now = Date.now();
  const resetTime = new Date(reset);
  const retryAfter = success ? null : Math.ceil((reset - now) / 1000);

  return { success, remaining, resetTime, retryAfter };
}

// ── In-memory fallback ────────────────────────────────────────────────────────

interface MemoryEntry {
  timestamps: number[];
  lastCleanup: number;
}

const memoryStore = new Map<string, MemoryEntry>();

function checkMemory(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = config.window * 1000;

  let entry = memoryStore.get(identifier);
  if (!entry) {
    entry = { timestamps: [], lastCleanup: now };
    memoryStore.set(identifier, entry);
  }

  if (now - entry.lastCleanup > 60_000) {
    entry.timestamps = entry.timestamps.filter((ts) => ts > now - windowMs);
    entry.lastCleanup = now;
  }

  const inWindow = entry.timestamps.filter((ts) => ts > now - windowMs).length;

  if (inWindow >= config.limit) {
    const oldest = Math.min(...entry.timestamps);
    return {
      success: false,
      remaining: 0,
      resetTime: new Date(oldest + windowMs),
      retryAfter: Math.ceil((oldest + windowMs - now) / 1000),
    };
  }

  entry.timestamps.push(now);
  const oldest = entry.timestamps[0];
  return {
    success: true,
    remaining: config.limit - inWindow - 1,
    resetTime: new Date(oldest + windowMs),
    retryAfter: null,
  };
}

// ── API pública ───────────────────────────────────────────────────────────────

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  if (hasUpstash()) {
    return checkUpstash(identifier, config);
  }
  return checkMemory(identifier, config);
}

export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

// Limpieza periódica del store in-memory (solo aplica en fallback)
type GlobalWithRateLimit = typeof globalThis & {
  __ratelimit_interval?: ReturnType<typeof setInterval>;
};

if (typeof globalThis !== "undefined" && !("__ratelimit_interval" in globalThis)) {
  (globalThis as GlobalWithRateLimit).__ratelimit_interval = setInterval(() => {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000;
    for (const [key, entry] of memoryStore.entries()) {
      if (now - entry.lastCleanup > maxAge) memoryStore.delete(key);
    }
  }, 12 * 60 * 60 * 1000);
}
