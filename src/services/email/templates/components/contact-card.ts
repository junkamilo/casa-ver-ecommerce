import { WHATSAPP_URL, WHATSAPP_NUMBER, CONTACT_EMAIL } from "../../constants";

interface ContactCardOptions {
  message?: string;
  marginBottom?: string;
}

export function contactCard({ message = "¿Dudas?", marginBottom = "0" }: ContactCardOptions = {}): string {
  return `
  <div style="padding:20px;background-color:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;text-align:center;margin-bottom:${marginBottom};">
    <p style="margin:0 0 6px 0;font-size:14px;color:#166534;">
      💬 ${message} Escríbenos por <a href="${WHATSAPP_URL}" style="color:#154734;font-weight:600;text-decoration:none;">WhatsApp · ${WHATSAPP_NUMBER}</a>
    </p>
    <p style="margin:0;font-size:13px;color:#166534;">
      📧 <a href="mailto:${CONTACT_EMAIL}" style="color:#154734;font-weight:600;text-decoration:none;">${CONTACT_EMAIL}</a>
    </p>
  </div>`;
}
