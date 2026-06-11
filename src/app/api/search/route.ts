import { NextRequest, NextResponse } from "next/server";

import { getClientIP } from "@/lib/ratelimit";
import { searchProductsUseCase } from "@/modules/search/application/search-products.use-case";
import { RateLimitExceededError } from "@/modules/search/application/search.errors";

function isVideoUrl(url: string): boolean {
  const clean = url.split("?")[0].toLowerCase();
  return [".mp4", ".webm", ".mov", ".ogg"].some((ext) => clean.endsWith(ext));
}

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const query = req.nextUrl.searchParams.get("q") ?? "";

    const results = await searchProductsUseCase({ query, ip });
    
    return NextResponse.json(results);

  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return NextResponse.json(
        { error: error.message },
        {
          status: 429,
          headers: {
            "Retry-After": error.retryAfter,
            "X-RateLimit-Limit": error.limit,
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    console.error("[SEARCH_API_ERROR]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
