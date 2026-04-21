import { emailLayout } from "./components/layout";
import { emailHeader } from "./components/header";
import { emailFooter } from "./components/footer";

export function verificationTemplate(customerName: string, codeFormatted: string): string {
  const body = `
  <tr>
    <td style="padding:40px 32px;">
      <h2 style="margin:0 0 12px 0;font-size:20px;font-weight:600;color:#1F2937;">¡Hola, ${customerName}!</h2>
      <p style="margin:0 0 24px 0;font-size:15px;line-height:1.7;color:#374151;">
        Usa el siguiente código para verificar tu correo electrónico e ingresar a tu nueva cuenta en Casa Verde.
      </p>

      <div style="margin:0 0 24px 0;padding:24px;background-color:#F0FDF4;border:2px solid #154734;border-radius:12px;text-align:center;">
        <p style="margin:0 0 8px 0;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;">Tu código de verificación</p>
        <p style="margin:0;font-size:44px;font-weight:800;color:#154734;letter-spacing:0.18em;font-family:monospace;">${codeFormatted}</p>
      </div>

      <p style="margin:0 0 8px 0;font-size:13px;color:#6B7280;text-align:center;">
        Ingresa este código en la pantalla de registro. Expira en <strong>15 minutos</strong>.
      </p>
      <p style="margin:0;font-size:12px;color:#9CA3AF;text-align:center;">
        Si no creaste esta cuenta, puedes ignorar este mensaje.
      </p>
    </td>
  </tr>`;

  return emailLayout("Código de verificación - Casa Verde", `${emailHeader()}${body}${emailFooter()}`);
}
