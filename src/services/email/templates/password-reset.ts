import { emailLayout } from "./components/layout";
import { emailHeader } from "./components/header";
import { emailFooter } from "./components/footer";

export function passwordResetTemplate(customerName: string, resetUrl: string): string {
  const body = `
  <tr>
    <td style="padding:40px 32px;">
      <h2 style="margin:0 0 20px 0;font-size:22px;font-weight:600;color:#1F2937;">¡Hola, ${customerName}! 💚</h2>

      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#374151;">
        Recibimos una solicitud para restablecer tu contraseña.
      </p>
      <p style="margin:0 0 32px 0;font-size:15px;line-height:1.7;color:#374151;">
        Puedes hacerlo utilizando el siguiente enlace:
      </p>

      <div style="text-align:center;margin-bottom:32px;">
        <a href="${resetUrl}" style="display:inline-block;padding:14px 40px;background-color:#154734;color:#FFFFFF;font-size:15px;font-weight:600;border-radius:6px;text-decoration:none;letter-spacing:0.03em;">
          Restablecer contraseña
        </a>
      </div>

      <p style="margin:0 0 32px 0;font-size:13px;color:#9CA3AF;text-align:center;">
        Si no realizaste esta solicitud, puedes ignorar este mensaje.
      </p>

      <div style="border-top:1px solid #E5E7EB;padding-top:24px;">
        <p style="margin:0 0 4px 0;font-size:15px;color:#374151;">Con amor,</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#154734;">Casa Verde 💚</p>
      </div>
    </td>
  </tr>`;

  return emailLayout("Recupera tu contraseña - Casa Verde", `${emailHeader()}${body}${emailFooter()}`);
}
