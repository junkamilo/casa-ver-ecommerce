import { emailLayout } from "./components/layout";
import { emailHeader } from "./components/header";
import { emailFooter } from "./components/footer";
import { contactCard } from "./components/contact-card";
import { PEDIDOS_PATH } from "@/app/perfil/constants/pedidos-route";
import { BASE_URL, WHATSAPP_URL, WHATSAPP_NUMBER, BRAND_GOLD } from "../constants";
import type { OrderItemEmailData } from "../types";

function formatCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);
}

interface OrderConfirmationData {
  customerName: string;
  orderNumber: string;
  items: OrderItemEmailData[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
}

export function orderConfirmationTemplate(data: OrderConfirmationData): string {
  const { customerName, orderNumber, items, subtotal, shippingCost, discount, total } = data;

  const itemRows = items.map((item) => `
    <tr style="border-bottom:1px solid #E5E7EB;">
      <td style="padding:16px 0;text-align:left;font-size:14px;color:#1F2937;">
        <div style="font-weight:600;">${item.name}</div>
        ${item.color ? `<div style="color:#6B7280;font-size:12px;">Color: ${item.color}</div>` : ""}
        ${item.size  ? `<div style="color:#6B7280;font-size:12px;">Talla: ${item.size}</div>`  : ""}
      </td>
      <td style="padding:16px 0;text-align:center;font-size:14px;color:#1F2937;">${item.quantity}</td>
      <td style="padding:16px 0;text-align:right;font-size:14px;color:#1F2937;">${formatCOP(item.price)}</td>
      <td style="padding:16px 0;text-align:right;font-size:14px;font-weight:600;color:#154734;">${formatCOP(item.price * item.quantity)}</td>
    </tr>`).join("");

  const discountRow = discount > 0 ? `
    <tr>
      <td style="padding:8px 0;font-size:14px;color:#1F2937;">Descuento:</td>
      <td style="padding:8px 0;text-align:right;font-size:14px;font-weight:600;color:${BRAND_GOLD};">-${formatCOP(discount)}</td>
    </tr>` : "";

  const body = `
  <tr>
    <td style="padding:40px 32px;">
      <h2 style="margin:0 0 16px 0;font-size:20px;font-weight:600;color:#1F2937;">¡Hola, ${customerName}! 💚</h2>

      <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;color:#374151;">
        Hemos recibido tu pedido y tu pago correctamente ✨
      </p>
      <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;color:#374151;">
        ¡Gracias por elegir Casa Verde! Tu pedido ya está confirmado y comenzaremos a prepararlo muy pronto.
        Recuerda que la mayoría de nuestras prendas se elaboran bajo confección, por lo que el tiempo de despacho es de 2 a 5 días hábiles 🪡🧵📦
      </p>
      <p style="margin:0 0 12px 0;font-size:14px;line-height:1.7;color:#6B7280;background:#F9FAFB;padding:12px 16px;border-radius:6px;border:1px solid #E5E7EB;">
        También recibirás un <strong>comprobante de pago de Bold</strong> en este mismo correo. Revisa tu bandeja de entrada y spam si no lo ves en unos minutos.
      </p>
      <p style="margin:0 0 24px 0;font-size:15px;line-height:1.7;color:#374151;">
        Si tienes alguna duda o necesitas asesoría, puedes escribirnos por
        <a href="${WHATSAPP_URL}" style="color:#154734;font-weight:600;text-decoration:none;">WhatsApp al ${WHATSAPP_NUMBER}</a> 💬
      </p>

      <div style="margin:0 0 24px 0;padding:16px;background-color:#F9FAFB;border-radius:6px;border:1px solid #E5E7EB;">
        <p style="margin:0;font-size:12px;font-weight:500;color:#6B7280;">NÚMERO DE ORDEN</p>
        <p style="margin:8px 0 0 0;font-size:24px;font-weight:700;color:#154734;">${orderNumber}</p>
      </div>

      <h3 style="margin:0 0 16px 0;font-size:16px;font-weight:600;color:#1F2937;">Resumen del Pedido</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <thead>
          <tr style="border-bottom:2px solid #154734;">
            <th style="padding:12px 0;text-align:left;font-size:14px;font-weight:600;color:#154734;">Producto</th>
            <th style="padding:12px 0;text-align:center;font-size:14px;font-weight:600;color:#154734;">Cant.</th>
            <th style="padding:12px 0;text-align:right;font-size:14px;font-weight:600;color:#154734;">Precio</th>
            <th style="padding:12px 0;text-align:right;font-size:14px;font-weight:600;color:#154734;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="padding:16px;background-color:#F9FAFB;border-radius:6px;margin-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#1F2937;">Subtotal:</td>
            <td style="padding:8px 0;text-align:right;font-size:14px;font-weight:600;color:#1F2937;">${formatCOP(subtotal)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#1F2937;">Costo de Envío:</td>
            <td style="padding:8px 0;text-align:right;font-size:14px;font-weight:600;color:#1F2937;">${formatCOP(shippingCost)}</td>
          </tr>
          ${discountRow}
          <tr style="border-top:1px solid #E5E7EB;">
            <td style="padding:12px 0;font-size:16px;font-weight:700;color:#154734;">Total:</td>
            <td style="padding:12px 0;text-align:right;font-size:16px;font-weight:700;color:#154734;">${formatCOP(total)}</td>
          </tr>
        </table>
      </div>

      <div style="text-align:center;margin-bottom:24px;">
        <a href="${BASE_URL}${PEDIDOS_PATH}" style="display:inline-block;padding:14px 40px;background-color:#154734;color:white;font-size:15px;font-weight:600;border-radius:6px;text-decoration:none;">
          Ver estado de mi pedido
        </a>
      </div>

      <div style="border-top:1px solid #E5E7EB;padding-top:24px;margin-top:8px;">
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#374151;">Gracias por confiar en Casa Verde</p>
        ${contactCard()}
      </div>
    </td>
  </tr>`;

  return emailLayout("Confirmación de Pedido - Casa Verde", `${emailHeader()}${body}${emailFooter(true)}`);
}
