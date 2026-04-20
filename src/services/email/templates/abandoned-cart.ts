import { emailLayout } from "./components/layout";
import { emailHeader } from "./components/header";
import { emailFooter } from "./components/footer";
import { contactCard } from "./components/contact-card";
import { productList } from "./components/product-list";
import type { CartItemEmailData } from "../types";

interface AbandonedCartData {
  items: CartItemEmailData[];
  cartUrl: string;
}

export function abandonedCartTemplate({ items, cartUrl }: AbandonedCartData): string {
  const body = `
  <tr>
    <td style="padding:40px 32px;">
      <h2 style="margin:0 0 20px 0;font-size:22px;font-weight:600;color:#1F2937;">¡Hola bonita! 💚</h2>

      <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;color:#374151;">
        Notamos que dejaste algunas prendas en tu carrito 👀✨
      </p>
      <p style="margin:0 0 32px 0;font-size:15px;line-height:1.7;color:#374151;">
        ¡No te quedes sin ellas! Algunas pueden agotarse pronto.
      </p>

      ${productList(items)}

      <div style="text-align:center;margin-bottom:32px;">
        <a href="${cartUrl}" style="display:inline-block;padding:14px 40px;background-color:#154734;color:#FFFFFF;font-size:15px;font-weight:600;border-radius:6px;text-decoration:none;letter-spacing:0.03em;">
          Completar mi compra
        </a>
      </div>

      ${contactCard({ message: "Si necesitas ayuda para decidir tu talla o tienes dudas,", marginBottom: "24px" })}

      <p style="margin:0;font-size:15px;line-height:1.7;color:#374151;">
        Estamos aquí para ti,<br/>
        <strong style="color:#154734;">Casa Verde</strong>
      </p>
    </td>
  </tr>`;

  return emailLayout("Bonita, olvidaste algo - Casa Verde", `${emailHeader()}${body}${emailFooter()}`);
}
