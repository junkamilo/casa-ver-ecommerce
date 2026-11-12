/**
 * Diagnóstico del correo transaccional por SMTP (Postfix del VPS en producción, Mailpit/MailHog en local).
 *
 *   npm run email:test                              - Solo verifica la conexión y la autenticación SMTP
 *   npm run email:test -- --send                    - Además envía un correo de prueba
 *   npm run email:test -- --send --email=xxx@yyy.com
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { sendEmail, verifySmtpConnection } from "../src/services/email/smtp";

// ts-node no carga .env: se lee aquí sin sobrescribir lo que ya venga del entorno.
function loadDotEnv() {
  const file = path.resolve(process.cwd(), ".env");
  if (!existsSync(file)) return;
  for (const raw of readFileSync(file, "utf-8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const idx = line.indexOf("=");
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

const ARGS = process.argv.slice(2);
const args = {
  send: ARGS.includes("--send"),
  email: ARGS.find((a) => a.startsWith("--email="))?.split("=")[1] || process.env.ADMIN_ORDER_EMAIL || "",
};

async function main() {
  loadDotEnv();
  console.log("📧 Diagnóstico de correo SMTP - Casa Verde\n");
  console.log(`Servidor: ${process.env.SMTP_HOST || "(sin SMTP_HOST)"}:${process.env.SMTP_PORT || 587}`);
  console.log(`Autenticación: ${process.env.SMTP_USER ? "usuario configurado" : "sin usuario (relay local)"}\n`);

  const conexion = await verifySmtpConnection();
  if (!conexion.success) {
    console.error("❌ Conexión SMTP fallida:", conexion.error);
    process.exit(1);
  }
  console.log("✅ Conexión y autenticación SMTP correctas.\n");

  if (!args.send) {
    console.log("💡 Para enviar un correo de prueba: npm run email:test -- --send --email=tu_correo@gmail.com");
    return;
  }
  if (!args.email) {
    console.error("❌ Indica el destinatario con --email=... (o ADMIN_ORDER_EMAIL en .env)");
    process.exit(1);
  }

  console.log(`📤 Enviando correo de prueba a ${args.email}...`);
  const envio = await sendEmail({
    to: args.email,
    subject: "Prueba SMTP - Casa Verde",
    html: "<p>Si recibes este correo, el servidor SMTP de Casa Verde funciona.</p>",
  });
  if (!envio.success) {
    console.error("❌ Error al enviar:", envio.error);
    process.exit(1);
  }
  console.log(`✅ Enviado. messageId: ${envio.messageId}`);
  console.log("   Revisa en Gmail: «Mostrar original» → SPF, DKIM y DMARC deben decir PASS.");
}

main().catch((error) => {
  console.error("❌ Error inesperado:", error);
  process.exit(1);
});
