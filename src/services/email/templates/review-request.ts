import { emailLayout } from "./components/layout";
import { emailHeader } from "./components/header";
import { emailFooter } from "./components/footer";

interface ReviewRequestData {
  customerName: string;
  productName: string;
  productImageUrl?: string | null;
  orderNumber: string;
  reviewUrl: string;
}

export function reviewRequestTemplate(data: ReviewRequestData): string {
  const { customerName, productName, productImageUrl, orderNumber, reviewUrl } = data;

  const firstName = customerName.split(" ")[0];

  const productImage = productImageUrl
    ? `<tr>
        <td style="padding:0 32px 24px 32px;text-align:center;">
          <img src="${productImageUrl}" alt="${productName}" width="160" height="160"
            style="border-radius:12px;object-fit:cover;border:1px solid #E5E7EB;display:inline-block;" />
        </td>
      </tr>`
    : "";

  const body = `
  <tr>
    <td style="padding:40px 32px 24px 32px;">
      <h2 style="margin:0 0 16px 0;font-size:22px;font-weight:600;color:#1F2937;">
        ¡Hola, ${firstName}! ¿Cómo te quedó? 💚
      </h2>
      <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;color:#374151;">
        Han pasado unos días desde que recibiste tu pedido <strong>#${orderNumber}</strong> y nos encantaría saber qué te pareció.
      </p>
      <p style="margin:0 0 28px 0;font-size:15px;line-height:1.7;color:#374151;">
        Tu opinión es muy valiosa para que otras clientas puedan elegir con confianza. ¡Solo toma un minuto!
      </p>
    </td>
  </tr>

  ${productImage}

  <tr>
    <td style="padding:0 32px 12px 32px;">
      <div style="background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:16px 20px;">
        <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;">
          Prenda a evaluar
        </p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#154734;">${productName}</p>
      </div>
    </td>
  </tr>

  <tr>
    <td style="padding:28px 32px 40px 32px;text-align:center;">
      <a href="${reviewUrl}"
        style="display:inline-block;background-color:#154734;color:#ffffff;font-size:15px;font-weight:600;
               text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.02em;">
        ⭐ Dejar mi opinión
      </a>
      <p style="margin:16px 0 0 0;font-size:12px;color:#9CA3AF;line-height:1.5;">
        Este enlace es exclusivo para ti y expira en 30 días.
      </p>
    </td>
  </tr>
  `;

  return emailLayout(`¿Qué te pareció tu pedido? — Casa Verde`, emailHeader() + `<table width="100%" cellpadding="0" cellspacing="0">${body}</table>` + emailFooter());
}
