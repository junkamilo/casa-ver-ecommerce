import { emailLayout } from "./components/layout";
import { emailHeader } from "./components/header";
import { emailFooter } from "./components/footer";
import { contactCard } from "./components/contact-card";
import { BASE_URL, WHATSAPP_URL, WHATSAPP_NUMBER } from "../constants";

export function welcomeTemplate(): string {
  const body = `
  <tr>
    <td style="padding:40px 32px;">
      <h2 style="margin:0 0 24px 0;font-size:22px;font-weight:600;color:#1F2937;">¡Hola bonita! 💚</h2>

      <p style="margin:0 0 20px 0;font-size:15px;line-height:1.7;color:#374151;">
        Nos alegra muchísimo tenerte en Casa Verde,
      </p>
      <p style="margin:0 0 20px 0;font-size:15px;line-height:1.7;color:#374151;">
        A partir de ahora podrás descubrir nuestras prendas, hechas con amor por manos colombianas 🤚🏼🇨🇴
      </p>
      <p style="margin:0 0 20px 0;font-size:15px;line-height:1.7;color:#374151;">
        Si necesitas ayuda para elegir tu talla o tienes alguna duda, puedes escribirnos por
        <a href="${WHATSAPP_URL}" style="color:#154734;font-weight:600;text-decoration:none;">WhatsApp al ${WHATSAPP_NUMBER}</a>. Estaremos felices de asesorarte,
      </p>
      <p style="margin:0 0 32px 0;font-size:15px;line-height:1.7;color:#374151;">
        Gracias por ser parte de Casa Verde
      </p>

      <div style="text-align:center;margin-bottom:32px;">
        <a href="${BASE_URL}" style="display:inline-block;padding:14px 40px;background-color:#154734;color:#FFFFFF;font-size:15px;font-weight:600;border-radius:6px;text-decoration:none;letter-spacing:0.03em;">
          Descubrir prendas
        </a>
      </div>

      ${contactCard()}
    </td>
  </tr>`;

  return emailLayout("Bienvenida a Casa Verde", `${emailHeader()}${body}${emailFooter()}`);
}
