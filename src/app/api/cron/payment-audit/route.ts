/**
 * Auditoría semanal de pagos
 *
 * Detecta anomalías en la semana: órdenes atascadas, emails sin enviar,
 * pagos fallidos. Reporta a Sentry y envía resumen por email al admin.
 *
 * Cron: lunes 9 AM (ver vercel.json)
 * Seguridad: requiere Authorization: Bearer ${CRON_SECRET}
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as Sentry from "@sentry/nextjs";

const ALERT_ADMIN_EMAIL = process.env.AUDIT_ADMIN_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? "admin@casaverdeoficial.com";

function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const oneDayAgo   = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneHourAgo  = new Date(now.getTime() -      60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // ── 1. Órdenes PENDING > 24h (webhook posiblemente perdido) ─────────────
  const stuckPending = await prisma.order.findMany({
    where: { status: "PENDING", createdAt: { lt: oneDayAgo } },
    select: {
      id: true, orderNumber: true, total: true,
      paymentMethod: true, createdAt: true, transactionId: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // ── 2. Órdenes PAID sin email enviado > 1h después del pago ─────────────
  const paidNoEmail = await prisma.order.findMany({
    where: {
      status: "PAID",
      paidAt: { lt: oneHourAgo },
      confirmationEmailSentAt: null,
    },
    select: {
      id: true, orderNumber: true, total: true,
      paidAt: true, confirmationEmailFailedAt: true, confirmationEmailError: true,
    },
    orderBy: { paidAt: "asc" },
  });

  // ── 3. Órdenes con email confirmación fallido (sin recuperar) ────────────
  const emailFailed = await prisma.order.findMany({
    where: {
      confirmationEmailFailedAt: { not: null },
      confirmationEmailSentAt: null,
    },
    select: {
      id: true, orderNumber: true,
      confirmationEmailFailedAt: true, confirmationEmailError: true,
    },
    orderBy: { confirmationEmailFailedAt: "asc" },
    take: 50,
  });

  // ── 4. Resumen semana: ingresos y volumen ────────────────────────────────
  const weeklyOrders = await prisma.order.findMany({
    where: { status: "PAID", paidAt: { gte: sevenDaysAgo } },
    select: { total: true, paymentMethod: true },
  });

  const weeklyRevenue  = weeklyOrders.reduce((s, o) => s + Number(o.total), 0);
  const weeklyByMethod = weeklyOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.paymentMethod] = (acc[o.paymentMethod] ?? 0) + 1;
    return acc;
  }, {});

  // ── 5. Órdenes FAILED en la semana ──────────────────────────────────────
  const weeklyFailed = await prisma.order.count({
    where: { status: "FAILED", createdAt: { gte: sevenDaysAgo } },
  });

  // ── Compilar informe ──────────────────────────────────────────────────────
  const report = {
    generatedAt: now.toISOString(),
    period: { from: sevenDaysAgo.toISOString(), to: now.toISOString() },
    alerts: {
      stuckPendingOrders: stuckPending.length,
      paidOrdersWithNoEmail: paidNoEmail.length,
      emailFailures: emailFailed.length,
    },
    weekly: {
      paidOrders:    weeklyOrders.length,
      failedOrders:  weeklyFailed,
      revenue:       weeklyRevenue,
      revenueCOP:    formatCOP(weeklyRevenue),
      byPaymentMethod: weeklyByMethod,
    },
    details: {
      stuckPending:  stuckPending.map(o => ({ ...o, total: Number(o.total) })),
      paidNoEmail:   paidNoEmail.map(o => ({ ...o, total: Number(o.total) })),
      emailFailed,
    },
  };

  // ── Reportar anomalías críticas a Sentry ─────────────────────────────────
  const hasCritical = stuckPending.length > 0 || paidNoEmail.length > 0;

  if (hasCritical) {
    Sentry.withScope((scope) => {
      scope.setTag("cron", "payment-audit");
      scope.setLevel(stuckPending.length > 5 || paidNoEmail.length > 5 ? "error" : "warning");
      scope.setContext("audit_summary", {
        stuckPendingOrders:   stuckPending.length,
        paidOrdersNoEmail:    paidNoEmail.length,
        emailFailures:        emailFailed.length,
        weeklyRevenue:        formatCOP(weeklyRevenue),
        weeklyPaidOrders:     weeklyOrders.length,
      });
      Sentry.captureMessage(
        `[Auditoría] ${stuckPending.length} órdenes atascadas, ` +
        `${paidNoEmail.length} pagadas sin email de confirmación`
      );
    });
  }

  // ── Enviar resumen por email al admin ────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const statusColor = hasCritical ? "#dc2626" : "#154734";
    const statusLabel  = hasCritical ? "⚠ Requiere atención" : "✓ Sin anomalías críticas";

    const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><style>
  body { font-family: sans-serif; background: #f9f9f9; color: #222; }
  .wrap { max-width: 620px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
  .header { background: #154734; color: #fff; padding: 24px 32px; }
  .header h1 { margin: 0; font-size: 20px; }
  .header p { margin: 4px 0 0; font-size: 13px; opacity: .8; }
  .status { padding: 12px 32px; background: ${statusColor}15; border-left: 4px solid ${statusColor}; margin: 24px 32px 0; border-radius: 4px; color: ${statusColor}; font-weight: 600; }
  .section { padding: 0 32px 24px; }
  .section h2 { font-size: 15px; color: #154734; margin: 24px 0 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
  .kpi { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
  .kpi-item { background: #f3f4f6; border-radius: 6px; padding: 12px 16px; min-width: 110px; }
  .kpi-item .val { font-size: 22px; font-weight: 700; color: #154734; }
  .kpi-item .lbl { font-size: 11px; color: #6b7280; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  td, th { padding: 7px 8px; text-align: left; border-bottom: 1px solid #f3f4f6; }
  th { color: #6b7280; font-weight: 600; background: #f9fafb; }
  .badge-ok { color: #16a34a; } .badge-warn { color: #dc2626; }
  .footer { background: #f3f4f6; padding: 16px 32px; font-size: 12px; color: #9ca3af; }
</style></head>
<body>
<div class="wrap">
  <div class="header">
    <h1>Auditoría Semanal de Pagos</h1>
    <p>Casa Verde — ${now.toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
  </div>
  <div class="status">${statusLabel}</div>
  <div class="section">
    <h2>Resumen semanal</h2>
    <div class="kpi">
      <div class="kpi-item"><div class="val">${weeklyOrders.length}</div><div class="lbl">Pedidos pagados</div></div>
      <div class="kpi-item"><div class="val">${weeklyFailed}</div><div class="lbl">Pagos fallidos</div></div>
      <div class="kpi-item"><div class="val">${formatCOP(weeklyRevenue)}</div><div class="lbl">Ingresos</div></div>
    </div>
    <table>
      <tr><th>Método de pago</th><th>Pedidos</th></tr>
      ${Object.entries(weeklyByMethod).map(([m, c]) => `<tr><td>${m}</td><td>${c}</td></tr>`).join("")}
    </table>

    <h2>Alertas ${hasCritical ? "⚠" : "✓"}</h2>
    <table>
      <tr><th>Tipo</th><th>Cantidad</th><th>Estado</th></tr>
      <tr>
        <td>Órdenes PENDING > 24h</td>
        <td>${stuckPending.length}</td>
        <td class="${stuckPending.length > 0 ? "badge-warn" : "badge-ok"}">${stuckPending.length > 0 ? "⚠ Revisar" : "✓ OK"}</td>
      </tr>
      <tr>
        <td>Pagadas sin email (> 1h)</td>
        <td>${paidNoEmail.length}</td>
        <td class="${paidNoEmail.length > 0 ? "badge-warn" : "badge-ok"}">${paidNoEmail.length > 0 ? "⚠ Revisar" : "✓ OK"}</td>
      </tr>
      <tr>
        <td>Emails fallidos sin recuperar</td>
        <td>${emailFailed.length}</td>
        <td class="${emailFailed.length > 0 ? "badge-warn" : "badge-ok"}">${emailFailed.length > 0 ? "⚠ Revisar" : "✓ OK"}</td>
      </tr>
    </table>

    ${stuckPending.length > 0 ? `
    <h2>Órdenes PENDING > 24h</h2>
    <table>
      <tr><th>Orden</th><th>Total</th><th>Método</th><th>Creada</th></tr>
      ${stuckPending.map(o => `<tr>
        <td>${o.orderNumber}</td>
        <td>${formatCOP(Number(o.total))}</td>
        <td>${o.paymentMethod}</td>
        <td>${new Date(o.createdAt).toLocaleDateString("es-CO")}</td>
      </tr>`).join("")}
    </table>` : ""}

    ${paidNoEmail.length > 0 ? `
    <h2>Órdenes pagadas sin email de confirmación</h2>
    <table>
      <tr><th>Orden</th><th>Total</th><th>Pagada</th><th>Error</th></tr>
      ${paidNoEmail.map(o => `<tr>
        <td>${o.orderNumber}</td>
        <td>${formatCOP(Number(o.total))}</td>
        <td>${o.paidAt ? new Date(o.paidAt).toLocaleDateString("es-CO") : "—"}</td>
        <td>${o.confirmationEmailError ?? (o.confirmationEmailFailedAt ? "Falló" : "Nunca encolado")}</td>
      </tr>`).join("")}
    </table>` : ""}
  </div>
  <div class="footer">Auditoría automática — Casa Verde eCommerce · casaverdeoficial.com</div>
</div>
</body></html>`;

    await resend.emails.send({
      from:    "Casa Verde Admin <noreply@casaverdeoficial.com>",
      to:      ALERT_ADMIN_EMAIL,
      subject: `[Auditoría] Semana ${now.toLocaleDateString("es-CO")} — ${hasCritical ? "⚠ Requiere atención" : "✓ Sin anomalías"}`,
      html,
    }).catch((err: unknown) => {
      console.error("[Cron/PaymentAudit] Error enviando email de auditoría:", err);
    });
  }

  console.log(
    `[Cron/PaymentAudit] pending=${stuckPending.length} ` +
    `noEmail=${paidNoEmail.length} emailFailed=${emailFailed.length} ` +
    `weeklyRevenue=${formatCOP(weeklyRevenue)} paidOrders=${weeklyOrders.length}`
  );

  return NextResponse.json(report);
}
