import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { validateEmailConfig, sendOrderConfirmationEmail } from "@/services/email/client";

/**
 * 🧪 ENDPOINT DE DIAGNÓSTICO DE EMAILS
 *
 * GET /api/admin/email-test
 *   - Valida la configuración de Resend
 *   - Verifica que el RESEND_API_KEY esté configurado
 *   - Muestra información sobre el estado del servicio
 *
 * POST /api/admin/email-test
 *   - Envía un email de prueba
 *   - Requiere autenticación de admin
 *   - Cuerpo esperado: { customerEmail: string; customerName: string }
 */

export async function GET(req: NextRequest) {
  const config = validateEmailConfig();

  return NextResponse.json({
    status: config.isConfigured ? "✅ Configurado" : "❌ No configurado",
    apiKeyConfigured: !!process.env.RESEND_API_KEY,
    apiKeyLength: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
    apiKeyPrefix: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.slice(0, 10) + "..." : "no",
    fromEmail: "noreply@casaverdeoficial.com",
    warnings: config.warnings,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  // Verificar autenticación
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id || token.role !== "ADMIN") {
    return NextResponse.json(
      { error: "No autorizado. Se requiere rol ADMIN." },
      { status: 403 }
    );
  }

  // Parsear cuerpo
  let body: { customerEmail?: string; customerName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body JSON inválido" },
      { status: 400 }
    );
  }

  const { customerEmail, customerName } = body;

  if (!customerEmail || !customerName) {
    return NextResponse.json(
      { error: "Se requieren customerEmail y customerName" },
      { status: 400 }
    );
  }

  // Validar configuración antes de intentar
  const config = validateEmailConfig();
  if (!config.isConfigured) {
    return NextResponse.json(
      {
        error: "Servicio de email no configurado",
        warnings: config.warnings,
      },
      { status: 503 }
    );
  }

  // Enviar email de prueba
  const result = await sendOrderConfirmationEmail({
    customerEmail,
    customerName,
    orderNumber: "TEST-001",
    items: [
      {
        name: "Producto de Prueba",
        quantity: 1,
        price: 99000,
        color: "Verde Militar",
        size: "M",
      },
    ],
    subtotal: 99000,
    shippingCost: 15000,
    discount: 0,
    total: 114000,
  });

  if (result.success) {
    return NextResponse.json(
      {
        success: true,
        message: `✅ Email enviado exitosamente a ${customerEmail}`,
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      {
        success: false,
        error: result.error || "Error desconocido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
