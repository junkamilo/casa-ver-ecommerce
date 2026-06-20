import type { DashboardSlaItemDTO, DashboardSlaSeverity } from "../contracts/dashboard.dto";

const SLA_RULES = {
  PAID: { warningMinutes: 30, criticalMinutes: 120, label: "Por enviar", action: "Preparar envío" },
  PROCESSING: { warningMinutes: 240, criticalMinutes: 1440, label: "Procesando", action: "Marcar como enviado" },
  SHIPPED: { warningMinutes: 4320, criticalMinutes: 7200, label: "En camino", action: "Confirmar entrega" },
} as const;

type SlaStatus = keyof typeof SLA_RULES;

function formatWaiting(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  return `${days} d`;
}

function resolveSeverity(
  waitingMinutes: number,
  warningMinutes: number,
  criticalMinutes: number
): DashboardSlaSeverity | null {
  if (waitingMinutes >= criticalMinutes) return "critical";
  if (waitingMinutes >= warningMinutes) return "warning";
  return null;
}

function resolveAnchorDate(order: {
  status: string;
  paidAt: Date | null;
  shippedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
}): Date | null {
  switch (order.status) {
    case "PAID":
      return order.paidAt ?? order.createdAt;
    case "PROCESSING":
      return order.paidAt ?? order.updatedAt;
    case "SHIPPED":
      return order.shippedAt ?? order.updatedAt;
    default:
      return null;
  }
}

export function buildSlaQueueItem(
  order: {
    id: string;
    orderNumber: string;
    status: string;
    total: unknown;
    paidAt: Date | null;
    shippedAt: Date | null;
    updatedAt: Date;
    createdAt: Date;
    user: { name: string | null } | null;
  },
  now: Date
): DashboardSlaItemDTO | null {
  if (!(order.status in SLA_RULES)) return null;

  const rule = SLA_RULES[order.status as SlaStatus];
  const anchor = resolveAnchorDate(order);
  if (!anchor) return null;

  const waitingMinutes = Math.max(0, Math.floor((now.getTime() - anchor.getTime()) / 60_000));
  const severity = resolveSeverity(waitingMinutes, rule.warningMinutes, rule.criticalMinutes);
  if (!severity) return null;

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    statusLabel: rule.label,
    waitingMinutes,
    waitingLabel: formatWaiting(waitingMinutes),
    severity,
    suggestedAction: rule.action,
    customerName: order.user?.name ?? null,
    total: Number(order.total),
  };
}

export function sortSlaQueue(items: DashboardSlaItemDTO[]): DashboardSlaItemDTO[] {
  const severityRank: Record<DashboardSlaSeverity, number> = { critical: 0, warning: 1 };
  return [...items].sort((a, b) => {
    const sev = severityRank[a.severity] - severityRank[b.severity];
    if (sev !== 0) return sev;
    return b.waitingMinutes - a.waitingMinutes;
  });
}
