import { emailLayout } from "./components/layout";
import { emailHeader } from "./components/header";
import { emailFooter } from "./components/footer";
import { BASE_URL, BRAND_GOLD } from "../constants";
import type { OrderItemEmailData } from "../types";

function formatCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);
}

const PAYMENT_LABELS: Record<string, string> = {
  BOLD: "Bold",
  ADDI: "Addi",
};

export interface NewOrderAdminTemplateData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDepartment: string;
  paymentMethod: string;
  items: OrderItemEmailData[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
}

export function newOrderAdminTemplate(data: NewOrderAdminTemplateData): string {
  const {
    orderNumber,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    shippingCity,
    shippingDepartment,
    paymentMethod,
    items,
    subtotal,
    shippingCost,
    discount,
    total,
  } = data;

  const paymentLabel = PAYMENT_LABELS[paymentMethod] ?? paymentMethod;
  const adminOrderUrl = `${BASE_URL}/admin/pedidos?abrir=${encodeURIComponent(orderNumber)}`;

  const itemRows = items
    .map(
      (item) => `
    <tr style="border-bottom:1px solid #E5E7EB;">
      <td style="padding:12px 0;font-size:14px;color:#1F2937;">
        <div style="font-weight:600;">${item.name}</div>
        ${item.color ? `<div style="color:#6B7280;font-size:12px;">${item.color} · Talla ${item.size ?? "—"}</div>` : ""}
      </td>
      <td style="padding:12px 0;text-align:center;font-size:14px;">${item.quantity}</td>
      <td style="padding:12px 0;text-align:right;font-size:14px;font-weight:600;color:#154734;">${formatCOP(item.price * item.quantity)}</td>
    </tr>`
    )
    .join("");

  const discountRow =
    discount > 0
      ? `<tr>
          <td style="padding:8px 0;font-size:14px;">Descuento</td>
          <td style="padding:8px 0;text-align:right;font-size:14px;color:${BRAND_GOLD};">-${formatCOP(discount)}</td>
        </tr>`
      : "";

  const body = `
  <tr>
    <td style="padding:40px 32px;">
      <h2 style="margin:0 0 8px 0;font-size:20px;font-weight:700;color:#154734;">Nueva venta confirmada 💚</h2>
      <p style="margin:0 0 24px 0;font-size:14px;color:#6B7280;">Se registró un pago exitoso en la tienda.</p>

      <div style="margin:0 0 24px 0;padding:16px;background-color:#F0FDF4;border-radius:6px;border:1px solid #BBF7D0;">
        <p style="margin:0;font-size:12px;font-weight:600;color:#166534;">ORDEN</p>
        <p style="margin:8px 0 0 0;font-size:26px;font-weight:700;color:#154734;">#${orderNumber}</p>
        <p style="margin:8px 0 0 0;font-size:14px;color:#374151;">Pago vía <strong>${paymentLabel}</strong></p>
      </div>

      <h3 style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#1F2937;">Cliente</h3>
      <div style="margin:0 0 24px 0;padding:16px;background-color:#F9FAFB;border-radius:6px;border:1px solid #E5E7EB;font-size:14px;line-height:1.6;color:#374151;">
        <p style="margin:0 0 4px 0;"><strong>${customerName}</strong></p>
        <p style="margin:0 0 4px 0;">${customerEmail}</p>
        <p style="margin:0 0 4px 0;">${customerPhone}</p>
        <p style="margin:8px 0 0 0;">${shippingAddress}<br>${shippingCity}, ${shippingDepartment}</p>
      </div>

      <h3 style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:#1F2937;">Productos</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <thead>
          <tr style="border-bottom:2px solid #154734;">
            <th style="padding:10px 0;text-align:left;font-size:13px;color:#154734;">Producto</th>
            <th style="padding:10px 0;text-align:center;font-size:13px;color:#154734;">Cant.</th>
            <th style="padding:10px 0;text-align:right;font-size:13px;color:#154734;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="padding:16px;background-color:#F9FAFB;border-radius:6px;margin-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;font-size:14px;">Subtotal</td>
            <td style="padding:6px 0;text-align:right;font-size:14px;">${formatCOP(subtotal)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:14px;">Envío</td>
            <td style="padding:6px 0;text-align:right;font-size:14px;">${formatCOP(shippingCost)}</td>
          </tr>
          ${discountRow}
          <tr style="border-top:1px solid #E5E7EB;">
            <td style="padding:12px 0;font-size:16px;font-weight:700;color:#154734;">Total</td>
            <td style="padding:12px 0;text-align:right;font-size:16px;font-weight:700;color:#154734;">${formatCOP(total)}</td>
          </tr>
        </table>
      </div>

      <div style="text-align:center;">
        <a href="${adminOrderUrl}" style="display:inline-block;padding:14px 32px;background-color:#154734;color:white;font-size:15px;font-weight:600;border-radius:6px;text-decoration:none;">
          Ver pedido en el admin
        </a>
      </div>
    </td>
  </tr>`;

  return emailLayout(`Nueva venta #${orderNumber}`, `${emailHeader()}${body}${emailFooter(false)}`);
}
