import { emailLayout } from "./components/layout";
import { emailHeader } from "./components/header";
import { emailFooter } from "./components/footer";

function formatCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export interface PosRejectedOrderAdminTemplateData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  total: number;
  reason: string;
}

/**
 * Alerta al admin: un pedido ya pagado en la pasarela que el POS no registró (p. ej. sin stock). Reemplaza la
 * campana del admin web: hay que reembolsar al cliente en la pasarela y cancelar el pedido.
 */
export function posRejectedOrderAdminTemplate(data: PosRejectedOrderAdminTemplateData): string {
  const body = `
  <tr>
    <td style="padding:40px 32px;">
      <h2 style="margin:0 0 8px 0;font-size:20px;font-weight:700;color:#B91C1C;">Pedido pagado sin registrar en el POS</h2>
      <p style="margin:0 0 24px 0;font-size:14px;color:#6B7280;">El cliente ya pagó, pero el POS no registró la venta.</p>

      <div style="margin:0 0 24px 0;padding:16px;background-color:#FEF2F2;border-radius:6px;border:1px solid #FECACA;">
        <p style="margin:0;font-size:12px;font-weight:600;color:#991B1B;">ORDEN</p>
        <p style="margin:8px 0 0 0;font-size:26px;font-weight:700;color:#7F1D1D;">#${escapeHtml(data.orderNumber)}</p>
        <p style="margin:8px 0 0 0;font-size:14px;color:#374151;">${escapeHtml(data.paymentMethod)} · ${formatCOP(data.total)}</p>
      </div>

      <h3 style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#1F2937;">Motivo del POS</h3>
      <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#374151;">${escapeHtml(data.reason)}</p>

      <h3 style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#1F2937;">Cliente</h3>
      <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#374151;">
        <strong>${escapeHtml(data.customerName)}</strong><br>${escapeHtml(data.customerEmail)}
      </p>

      <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;">
        Qué hacer: reembolsa el pago en la pasarela (${escapeHtml(data.paymentMethod)}) y avisa al cliente. El pedido no
        aparece en Tienda → Pedidos del POS porque la venta no se creó.
      </p>
    </td>
  </tr>`;

  return emailLayout(
    `Pedido sin registrar #${data.orderNumber}`,
    `${emailHeader()}${body}${emailFooter(false)}`,
  );
}
