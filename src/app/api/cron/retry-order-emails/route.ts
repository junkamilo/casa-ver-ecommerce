/**
 * Reintenta emails de confirmación bajo demanda (manual o integrado en crons diarios).
 * Seguridad: Authorization: Bearer ${CRON_SECRET}
 */

import { NextResponse } from "next/server";
import { retryPendingOrderConfirmationEmails } from "@/modules/payments/shared/application/retry-order-confirmation-emails";

function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await retryPendingOrderConfirmationEmails();
  console.log("[Cron/RetryEmail]", summary);
  return NextResponse.json(summary);
}
