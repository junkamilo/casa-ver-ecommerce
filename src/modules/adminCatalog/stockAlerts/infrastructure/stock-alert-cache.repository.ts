import { Redis } from "@upstash/redis";
import type { StockAlertsResponseDTO, StockAlertsQueryDTO } from "../contracts/stock-alert.dto";

export const STOCK_ALERT_CACHE_TTL = 300;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export class StockAlertCacheRepository {
  private readonly redis: Redis | null;

  constructor() {
    this.redis = getRedis();
  }

  buildKey(query: StockAlertsQueryDTO): string {
    return `stock-alerts:p${query.page}:l${query.limit}`;
  }

  async get(query: StockAlertsQueryDTO): Promise<StockAlertsResponseDTO | null> {
    if (!this.redis) return null;
    const raw = await this.redis.get(this.buildKey(query));
    if (!raw) return null;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw) as StockAlertsResponseDTO;
      } catch {
        return null;
      }
    }
    return raw as StockAlertsResponseDTO;
  }

  async set(query: StockAlertsQueryDTO, payload: StockAlertsResponseDTO): Promise<void> {
    if (!this.redis) return;
    await this.redis.setex(this.buildKey(query), STOCK_ALERT_CACHE_TTL, JSON.stringify(payload)).catch(() => {});
  }
}
