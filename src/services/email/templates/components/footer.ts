export function emailFooter(transactional = false): string {
  return `
  <tr>
    <td style="padding:24px;border-top:1px solid #E5E7EB;text-align:center;">
      <p style="margin:0${transactional ? " 0 8px 0" : ""};font-size:12px;color:#6B7280;">© 2024 Casa Verde. Todos los derechos reservados.</p>
      ${transactional ? '<p style="margin:0;font-size:12px;color:#6B7280;">Este es un correo transaccional. Por favor no responder a este mensaje.</p>' : ""}
    </td>
  </tr>`;
}
