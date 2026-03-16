import { Resend } from "resend";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos para los datos de la orden
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderItemEmailData {
  name: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
  imageUrl?: string | null;
}

export interface SendOrderConfirmationEmailInput {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  items: OrderItemEmailData[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inicializar cliente Resend (solo en servidor)
// ─────────────────────────────────────────────────────────────────────────────

const resend = new Resend(process.env.RESEND_API_KEY);

// Email desde el que se enviarán los correos (debe estar verificado en Resend)
const FROM_EMAIL = "noreply@casaverdeoficial.com";
const FROM_NAME = "Casa Verde";

// ─────────────────────────────────────────────────────────────────────────────
// Función para generar HTML del email de confirmación
// ─────────────────────────────────────────────────────────────────────────────

function generateOrderConfirmationHTML(input: SendOrderConfirmationEmailInput): string {
  const { customerName, orderNumber, items, subtotal, shippingCost, discount, total } = input;

  const itemsHTML = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #E5E7EB;">
      <td style="padding: 16px 0 16px 0; text-align: left; font-size: 14px; color: #1F2937;">
        <div style="font-weight: 600;">${item.name}</div>
        ${item.color ? `<div style="color: #6B7280; font-size: 12px;">Color: ${item.color}</div>` : ""}
        ${item.size ? `<div style="color: #6B7280; font-size: 12px;">Talla: ${item.size}</div>` : ""}
      </td>
      <td style="padding: 16px 0 16px 0; text-align: center; font-size: 14px; color: #1F2937;">
        ${item.quantity}
      </td>
      <td style="padding: 16px 0 16px 0; text-align: right; font-size: 14px; color: #1F2937;">
        $${item.price.toFixed(2)}
      </td>
      <td style="padding: 16px 0 16px 0; text-align: right; font-size: 14px; font-weight: 600; color: #154734;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Orden - Casa Verde</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; margin: 0; padding: 0; background-color: #F9FAFB; }
        table { border-collapse: collapse; }
        a { color: #154734; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F9FAFB; font-family: system-ui, -apple-system, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB;">
        <tr>
          <td style="padding: 24px 10px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
              <!-- HEADER -->
              <tr>
                <td style="padding: 32px 24px; border-bottom: 1px solid #E5E7EB;">
                  <div style="text-align: center;">
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #154734;">Casa Verde</h1>
                    <p style="margin: 8px 0 0 0; font-size: 12px; color: #6B7280;">Moda Sostenible</p>
                  </div>
                </td>
              </tr>

              <!-- CONTENIDO PRINCIPAL -->
              <tr>
                <td style="padding: 32px 24px;">
                  <!-- Saludo -->
                  <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #1F2937;">¡Hola, ${customerName}!</h2>
                  <p style="margin: 16px 0; font-size: 14px; line-height: 1.6; color: #1F2937;">
                    Excelentes noticias: hemos recibido tu pago y tu pedido ha sido confirmado. Recibirás las instrucciones de envío en las próximas 24 horas.
                  </p>

                  <!-- Número de Orden -->
                  <div style="margin: 24px 0; padding: 16px; background-color: #F9FAFB; border-radius: 6px; border: 1px solid #E5E7EB;">
                    <p style="margin: 0; font-size: 12px; font-weight: 500; color: #6B7280;">NÚMERO DE ORDEN</p>
                    <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 700; color: #154734;">${orderNumber}</p>
                  </div>

                  <!-- Resumen del Pedido -->
                  <h3 style="margin: 24px 0 16px 0; font-size: 16px; font-weight: 600; color: #1F2937;">Resumen del Pedido</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <thead>
                      <tr style="border-bottom: 2px solid #154734;">
                        <th style="padding: 12px 0; text-align: left; font-size: 14px; font-weight: 600; color: #154734;">Producto</th>
                        <th style="padding: 12px 0; text-align: center; font-size: 14px; font-weight: 600; color: #154734;">Cantidad</th>
                        <th style="padding: 12px 0; text-align: right; font-size: 14px; font-weight: 600; color: #154734;">Precio Unit.</th>
                        <th style="padding: 12px 0; text-align: right; font-size: 14px; font-weight: 600; color: #154734;">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHTML}
                    </tbody>
                  </table>

                  <!-- Desglose de Costos -->
                  <div style="padding: 16px; background-color: #F9FAFB; border-radius: 6px; margin-bottom: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr style="margin-bottom: 8px;">
                        <td style="padding: 8px 0; font-size: 14px; color: #1F2937;">Subtotal:</td>
                        <td style="padding: 8px 0; text-align: right; font-size: 14px; font-weight: 600; color: #1F2937;">$${subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #1F2937;">Costo de Envío:</td>
                        <td style="padding: 8px 0; text-align: right; font-size: 14px; font-weight: 600; color: #1F2937;">$${shippingCost.toFixed(2)}</td>
                      </tr>
                      ${
                        discount > 0
                          ? `
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #1F2937;">Descuento:</td>
                        <td style="padding: 8px 0; text-align: right; font-size: 14px; font-weight: 600; color: #C19A6B;">-$${discount.toFixed(2)}</td>
                      </tr>
                      `
                          : ""
                      }
                      <tr style="border-top: 1px solid #E5E7EB; padding-top: 8px; margin-top: 8px;">
                        <td style="padding: 12px 0; font-size: 16px; font-weight: 700; color: #154734;">Total:</td>
                        <td style="padding: 12px 0; text-align: right; font-size: 16px; font-weight: 700; color: #154734;">$${total.toFixed(2)}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- CTA Button -->
                  <div style="text-align: center; margin-bottom: 24px;">
                    <a href="https://casaverdeoficial.com/perfil/pedidos" style="display: inline-block; padding: 12px 32px; background-color: #154734; color: white; font-size: 16px; font-weight: 600; border-radius: 6px; text-decoration: none;">
                      Ver estado de mi pedido
                    </a>
                  </div>

                  <!-- Información y Soporte -->
                  <div style="border-top: 1px solid #E5E7EB; padding-top: 24px; margin-top: 24px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1F2937;">¿Preguntas?</h4>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280;">Si tienes alguna duda sobre tu pedido, no dudes en contactarnos:</p>
                    <p style="margin: 0; font-size: 14px; color: #6B7280;">
                      📧 <a href="mailto:contacto@casaverdeoficial.com">contacto@casaverdeoficial.com</a><br>
                      📱 <a href="tel:+5715555555">+57 (1) 5555 5555</a>
                    </p>
                  </div>
                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="padding: 24px; border-top: 1px solid #E5E7EB; text-align: center;">
                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #6B7280;">© 2024 Casa Verde. Todos los derechos reservados.</p>
                  <p style="margin: 0; font-size: 12px; color: #6B7280;">Este es un correo transaccional. Por favor no responder a este mensaje.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Función principal: Enviar confirmación de orden
// ─────────────────────────────────────────────────────────────────────────────

export async function sendOrderConfirmationEmail(
  input: SendOrderConfirmationEmailInput
): Promise<EmailResult> {
  const {
    customerEmail,
    customerName,
    orderNumber,
    items,
    subtotal,
    shippingCost,
    discount,
    total,
  } = input;

  // Validación básica
  if (!customerEmail || !customerName || !orderNumber) {
    console.error("[Email] Datos incompletos para enviar correo de confirmación");
    return {
      success: false,
      error: "Datos de orden incompletos",
    };
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("[Email] RESEND_API_KEY no configurado en variables de entorno");
    return {
      success: false,
      error: "Email service not configured",
    };
  }

  try {
    console.log(`[Email] Preparando correo de confirmación para ${customerEmail}`);

    // Generar HTML del email
    const emailHtml = generateOrderConfirmationHTML({
      customerEmail,
      customerName,
      orderNumber,
      items,
      subtotal,
      shippingCost,
      discount,
      total,
    });

    // Enviar el correo a través de Resend
    const response = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: `Confirmación de tu Pedido #${orderNumber} - Casa Verde`,
      html: emailHtml,
      // Opcional: agregar reply-to
      replyTo: "contacto@casaverdeoficial.com",
    });

    // Validar respuesta
    if (response.error) {
      console.error(
        `[Email] Error enviando confirmación a ${customerEmail}:`,
        response.error
      );
      return {
        success: false,
        error: response.error.message || "Error desconocido",
      };
    }

    console.log(
      `[Email] ✓ Confirmación enviada a ${customerEmail} (messageId: ${response.data?.id})`
    );

    return {
      success: true,
      messageId: response.data?.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error(
      `[Email] Excepción al enviar confirmación a ${customerEmail}:`,
      errorMessage
    );

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Función auxiliar: Validar configuración de email
// (Útil para debugging en desarrollo)
// ─────────────────────────────────────────────────────────────────────────────

export function validateEmailConfig(): {
  isConfigured: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (!process.env.RESEND_API_KEY) {
    warnings.push("RESEND_API_KEY no está configurado");
  }

  if (!FROM_EMAIL || !FROM_NAME) {
    warnings.push("FROM_EMAIL o FROM_NAME no están configurados");
  }

  return {
    isConfigured: warnings.length === 0,
    warnings,
  };
}
