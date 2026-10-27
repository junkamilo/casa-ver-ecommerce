import { BoldFallbackUnauthorizedError, BoldFallbackConfigError } from "@/modules/adminCatalog/boldFallback/application/bold-fallback.errors";
import { runBoldFallbackUseCase } from "@/modules/adminCatalog/boldFallback/application/run-bold-fallback.use-case";
import { retryPendingOrderConfirmationEmails } from "@/modules/payments/shared/application/retry-order-confirmation-emails";
import { NextRequest, NextResponse } from "next/server";
import { toErrorResponse } from "@/server/http/error-response";


export async function GET(req: NextRequest) {
  try {
    const result = await runBoldFallbackUseCase({
      authorizationHeader: req.headers.get("authorization"),
      isDev: process.env.NODE_ENV === "development",
      cronSecret: process.env.CRON_SECRET,
      fallbackSecret: process.env.BOLD_FALLBACK_SECRET,
      boldApiKey: process.env.BOLD_IDENTITY_KEY,
    });

    // Respaldo diario: reintentar emails de órdenes PAID sin confirmación
    // (compatible con plan Hobby de Vercel — 1 cron/día).
    const emailRetry = await retryPendingOrderConfirmationEmails();

    return NextResponse.json({ ...result, emailRetry });

  } catch (error) {
    if (error instanceof BoldFallbackUnauthorizedError) {
      return toErrorResponse(error);
    }
    if (error instanceof BoldFallbackConfigError) {
      return toErrorResponse(error);
    }
    return toErrorResponse(error);
  }
}