#!/usr/bin/env ts-node

/**
 * 📧 Script de Diagnóstico de Emails
 *
 * Uso:
 *   npm run email:test                    - Solo validar configuración
 *   npm run email:test -- --send          - Enviar email de prueba
 *   npm run email:test -- --email=xxx@yyy.com --name="Test User"
 *
 * Nota: Requiere que el servidor esté corriendo en localhost:3000
 */

const BASE_URL = "http://localhost:3000";
const CLI_SECRET = process.env.CLI_SECRET || "";
const ARGS = process.argv.slice(2);

const args = {
  send: ARGS.includes("--send"),
  email: ARGS.find((a) => a.startsWith("--email="))?.split("=")[1] || "test@example.com",
  name: ARGS.find((a) => a.startsWith("--name="))?.split("=")[1] || "Test User",
};

async function main() {
  console.log("📧 Diagnóstico de Emails - Casa Verde\n");

  // 1. Verificar configuración
  console.log("🔍 Validando configuración...\n");
  try {
    const response = await fetch(`${BASE_URL}/api/admin/email-test`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("❌ Error al validar configuración:", response.status);
      process.exit(1);
    }

    const config = (await response.json()) as {
      status?: string;
      apiKeyConfigured?: boolean;
      warnings?: string[];
    };

    console.log("Status:", config.status);
    console.log("API Key Configured:", config.apiKeyConfigured ? "✅ Yes" : "❌ No");

    if (config.warnings && config.warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      config.warnings.forEach((w) => console.log(`  - ${w}`));
    } else {
      console.log("✅ No warnings found\n");
    }

    // 2. Enviar email de prueba si se solicita
    if (args.send) {
      console.log(`📤 Enviando email de prueba a ${args.email}...\n`);

      const emailResponse = await fetch(`${BASE_URL}/api/admin/email-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-cli-secret": CLI_SECRET },
        body: JSON.stringify({
          customerEmail: args.email,
          customerName: args.name,
        }),
      });

      const result = (await emailResponse.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
        messageId?: string;
      };

      if (emailResponse.ok) {
        console.log("✅ Email enviado correctamente!");
        console.log(`   Message ID: ${result.messageId}`);
        console.log(`   Destinatario: ${args.email}`);
      } else {
        console.error("❌ Error al enviar email:");
        console.error(`   ${result.error}`);
        process.exit(1);
      }
    } else {
      console.log("💡 Tip: Usa 'npm run email:test -- --send' para enviar un email de prueba");
    }
  } catch (error) {
    console.error("❌ Error de conexión:", error);
    console.error("\n💡 ¿El servidor está corriendo en localhost:3000?");
    console.error("   Ejecuta: npm run dev");
    process.exit(1);
  }
}

main().catch(console.error);
