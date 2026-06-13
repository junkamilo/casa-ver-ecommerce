import { sendEmail } from "./resend";
import { welcomeTemplate } from "./templates/welcome";
import { verificationTemplate } from "./templates/verification";
import { passwordResetTemplate } from "./templates/password-reset";
import { orderConfirmationTemplate } from "./templates/order-confirmation";
import { newOrderAdminTemplate } from "./templates/new-order-admin";
import { abandonedCartTemplate } from "./templates/abandoned-cart";
import { abandonedCheckoutTemplate } from "./templates/abandoned-checkout";
import { reviewRequestTemplate } from "./templates/review-request";

export type { EmailResult } from "./types";
export type {
  OrderItemEmailData,
  SendOrderConfirmationEmailInput,
  SendVerificationEmailInput,
  SendPasswordResetEmailInput,
  SendWelcomeEmailInput,
  CartItemEmailData,
  SendAbandonedCartEmailInput,
  SendAbandonedCheckoutEmailInput,
  SendReviewRequestEmailInput,
  SendNewOrderAdminEmailInput,
} from "./types";

import type {
  EmailResult,
  SendOrderConfirmationEmailInput,
  SendVerificationEmailInput,
  SendPasswordResetEmailInput,
  SendWelcomeEmailInput,
  SendAbandonedCartEmailInput,
  SendAbandonedCheckoutEmailInput,
  SendReviewRequestEmailInput,
  SendNewOrderAdminEmailInput,
} from "./types";

// ── Bienvenida ────────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  input: SendWelcomeEmailInput
): Promise<EmailResult> {
  return sendEmail({
    to:      input.customerEmail,
    subject: "Bienvenida a Casa Verde 💚",
    html:    welcomeTemplate(),
  });
}

// ── Verificación de email ─────────────────────────────────────────────────────

export async function sendVerificationEmail(
  input: SendVerificationEmailInput
): Promise<EmailResult> {
  const codeFormatted = `${input.code.slice(0, 3)} ${input.code.slice(3)}`;
  return sendEmail({
    to:      input.customerEmail,
    subject: `${codeFormatted} es tu código de Casa Verde`,
    html:    verificationTemplate(input.customerName, codeFormatted),
  });
}

// ── Recuperación de contraseña ────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  input: SendPasswordResetEmailInput
): Promise<EmailResult> {
  return sendEmail({
    to:      input.customerEmail,
    subject: "Recupera tu contraseña 💚",
    html:    passwordResetTemplate(input.customerName, input.resetUrl),
  });
}

// ── Confirmación de pedido ────────────────────────────────────────────────────

export async function sendOrderConfirmationEmail(
  input: SendOrderConfirmationEmailInput
): Promise<EmailResult> {
  if (!input.customerEmail || !input.customerName || !input.orderNumber) {
    console.error("[Email] Datos incompletos para enviar correo de confirmación");
    return { success: false, error: "Datos de orden incompletos" };
  }

  console.log(`[Email] Preparando confirmación para orden ${input.orderNumber}`);

  const result = await sendEmail({
    to:      input.customerEmail,
    subject: `Recibimos tu pedido 💚 #${input.orderNumber}`,
    html:    orderConfirmationTemplate(input),
  });

  if (result.success) {
    console.log(`[Email] ✓ Confirmación enviada para orden ${input.orderNumber} (messageId: ${result.messageId})`);
  } else {
    console.error(`[Email] Error enviando confirmación orden ${input.orderNumber}:`, result.error);
  }

  return result;
}

// ── Aviso de nueva venta (admin) ─────────────────────────────────────────────

function resolveAdminOrderEmail(): string {
  return (
    process.env.ADMIN_ORDER_EMAIL?.trim() ||
    process.env.AUDIT_ADMIN_EMAIL?.trim() ||
    "talentocasaverde@gmail.com"
  );
}

export async function sendNewOrderAdminEmail(
  input: SendNewOrderAdminEmailInput
): Promise<EmailResult> {
  if (!input.orderNumber) {
    return { success: false, error: "Número de orden requerido" };
  }

  const adminEmail = resolveAdminOrderEmail();
  console.log(`[Email] Aviso admin nueva venta #${input.orderNumber} → ${adminEmail}`);

  const result = await sendEmail({
    to: adminEmail,
    subject: `Nueva venta 💚 #${input.orderNumber}`,
    html: newOrderAdminTemplate(input),
  });

  if (result.success) {
    console.log(`[Email] ✓ Aviso admin enviado para orden ${input.orderNumber}`);
  } else {
    console.error(`[Email] Error aviso admin orden ${input.orderNumber}:`, result.error);
  }

  return result;
}

// ── Carrito abandonado ────────────────────────────────────────────────────────

export async function sendAbandonedCartEmail(
  input: SendAbandonedCartEmailInput
): Promise<EmailResult> {
  return sendEmail({
    to:      input.customerEmail,
    subject: "Bonita, olvidaste algo 💚",
    html:    abandonedCartTemplate({ items: input.items, cartUrl: input.cartUrl }),
  });
}

// ── Checkout abandonado ───────────────────────────────────────────────────────

export async function sendAbandonedCheckoutEmail(
  input: SendAbandonedCheckoutEmailInput
): Promise<EmailResult> {
  return sendEmail({
    to:      input.customerEmail,
    subject: `${input.customerName}, tu pedido ${input.orderNumber} está esperando 💚`,
    html:    abandonedCheckoutTemplate(input),
  });
}

// ── Solicitud de reseña ───────────────────────────────────────────────────────

export async function sendReviewRequestEmail(
  input: SendReviewRequestEmailInput
): Promise<EmailResult> {
  return sendEmail({
    to:      input.customerEmail,
    subject: `${input.customerName.split(" ")[0]}, ¿qué te pareció tu prenda? 💚`,
    html:    reviewRequestTemplate(input),
  });
}

// ── Validar configuración ─────────────────────────────────────────────────────

export function validateEmailConfig(): { isConfigured: boolean; warnings: string[] } {
  const warnings: string[] = [];
  if (!process.env.RESEND_API_KEY) warnings.push("RESEND_API_KEY no está configurado");
  return { isConfigured: warnings.length === 0, warnings };
}

// Retrocompatibilidad: AbandonedCartItem era el nombre anterior de CartItemEmailData
export type { CartItemEmailData as AbandonedCartItem } from "./types";
