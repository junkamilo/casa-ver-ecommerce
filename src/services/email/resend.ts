import { Resend } from "resend";
import { FROM_EMAIL, FROM_NAME, REPLY_TO } from "./constants";
import type { EmailResult } from "./types";

export const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: "Email service not configured" };
  }

  try {
    const response = await resend.emails.send({
      from:    `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      replyTo: REPLY_TO,
    });

    if (response.error) {
      return { success: false, error: response.error.message || "Error desconocido" };
    }

    return { success: true, messageId: response.data?.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return { success: false, error: errorMessage };
  }
}
