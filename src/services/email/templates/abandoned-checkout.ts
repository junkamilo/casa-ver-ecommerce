import { emailLayout } from "./components/layout";
import { emailHeader } from "./components/header";
import { emailFooter } from "./components/footer";
import { contactCard } from "./components/contact-card";
import { productList } from "./components/product-list";
import type { CartItemEmailData } from "../types";

function formatCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);
}

interface AbandonedCheckoutData {
  customerName: string;
  orderNumber: string;
  items: CartItemEmailData[];
  total: number;
  paymentUrl: string;
}

export function abandonedCheckoutTemplate(data: AbandonedCheckoutData): string {
  const { customerName, orderNumber, items, total, paymentUrl } = data;

  const body = `
  <tr>
    <td style="padding:40px 32px;">
      <h2 style="margin:0 0 20px 0;font-size:22px;font-weight:600;color:#1F2937;">¡Hola, ${customerName}! 💚</h2>

      <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;color:#374151;">
        Notamos que iniciaste tu pedido pero no completaste el pago 👀
      </p>
      <p style="margin:0 0 32px 0;font-size:15px;line-height:1.7;color:#374151;">
        ¡Tus prendas te están esperando! Algunas pueden agotarse pronto.
      </p>

      <div style="margin:0 0 24px 0;padding:14px 20px;background-color:#F9FAFB;border-radius:6px;border:1px solid #E5E7EB;">
        <p style="margin:0;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;">Número de pedido</p>
        <p style="margin:6px 0 0 0;font-size:20px;font-weight:700;color:#154734;">${orderNumber}</p>
      </div>

      ${productList(items)}

      <div style="padding:14px 20px;background-color:#F0FDF4;border-radius:6px;margin-bottom:32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:15px;font-weight:600;color:#154734;">Total a pagar</td>
            <td style="text-align:right;font-size:18px;font-weight:700;color:#154734;">${formatCOP(total)}</td>
          </tr>
        </table>
      </div>

      <div style="text-align:center;margin-bottom:32px;">
        <a href="${paymentUrl}" style="display:inline-block;padding:14px 40px;background-color:#154734;color:#FFFFFF;font-size:15px;font-weight:600;border-radius:6px;text-decoration:none;letter-spacing:0.03em;">
          Completar mi pago
        </a>
      </div>

      ${contactCard({ message: "¿Tienes dudas con el pago?", marginBottom: "24px" })}

      <p style="margin:0;font-size:15px;line-height:1.7;color:#374151;">
        Con amor,<br/>
        <strong style="color:#154734;">Casa Verde 💚</strong>
      </p>
    </td>
  </tr>`;

  return emailLayout("Tu pedido está esperando - Casa Verde", `${emailHeader()}${body}${emailFooter()}`);
}
