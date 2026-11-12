import nodemailer from "nodemailer";
import { FROM_EMAIL, FROM_NAME, REPLY_TO } from "./constants";
import type { EmailResult } from "./types";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);

  if (!host) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
      tls: {
        // Postfix local (127.0.0.1) usa un certificado que no valida por nombre: no se exige en ese caso.
        rejectUnauthorized: process.env.NODE_ENV === "production" && host !== "127.0.0.1",
      },
    });
  }
  return transporter;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<EmailResult> {
  const mailer = getTransporter();
  if (!mailer) {
    return { success: false, error: "Servidor SMTP no configurado (falta SMTP_HOST)" };
  }

  const fromAddress = process.env.SMTP_FROM_EMAIL || FROM_EMAIL;
  const fromName = process.env.SMTP_FROM_NAME || FROM_NAME;

  try {
    const info = await mailer.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      html,
      replyTo: REPLY_TO,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido al enviar correo vía SMTP";
    console.error("[SMTP Error]", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/** Comprueba que el servidor SMTP responde y acepta la autenticación, sin enviar nada. */
export async function verifySmtpConnection(): Promise<EmailResult> {
  const mailer = getTransporter();
  if (!mailer) {
    return { success: false, error: "Servidor SMTP no configurado (falta SMTP_HOST)" };
  }
  try {
    await mailer.verify();
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "No se pudo conectar al servidor SMTP";
    return { success: false, error: errorMessage };
  }
}
