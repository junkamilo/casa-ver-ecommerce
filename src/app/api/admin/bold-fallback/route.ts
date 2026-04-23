import { BoldFallbackUnauthorizedError, BoldFallbackConfigError } from "@/modules/adminCatalog/boldFallback/application/bold-fallback.errors";
import { runBoldFallbackUseCase } from "@/modules/adminCatalog/boldFallback/application/run-bold-fallback.use-case";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  try {
    const result = await runBoldFallbackUseCase({
      authorizationHeader: req.headers.get("authorization"),
      isDev: process.env.NODE_ENV === "development",
      cronSecret: process.env.CRON_SECRET,
      fallbackSecret: process.env.BOLD_FALLBACK_SECRET,
      boldApiKey: process.env.BOLD_IDENTITY_KEY,
    });

    return NextResponse.json(result);

  } catch (error) {
    if (error instanceof BoldFallbackUnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof BoldFallbackConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.error("[BOLD FALLBACK] Error Interno:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}