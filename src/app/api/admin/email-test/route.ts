import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { EmailTestUnauthorizedError, EmailTestValidationError, EmailConfigUnavailableError } from "@/modules/adminCatalog/emailTest/application/email-test.errors";
import { getEmailDiagnosticUseCase } from "@/modules/adminCatalog/emailTest/application/get-email-diagnostic.use-case";
import { sendTestEmailUseCase } from "@/modules/adminCatalog/emailTest/application/send-test-email.use-case";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Error interno";
}

export async function GET() {
  const result = getEmailDiagnosticUseCase(process.env.RESEND_API_KEY);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      throw new EmailTestValidationError("Body JSON inválido");
    }

    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session?.user as any)?.role;

    const result = await sendTestEmailUseCase(body, {
      userRole,
      providedCliSecret: req.headers.get("x-cli-secret"),
      envCliSecret: process.env.CLI_SECRET,
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error: unknown) {
    if (error instanceof EmailTestValidationError) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
    }
    if (error instanceof EmailTestUnauthorizedError) {
      return NextResponse.json({ error: getErrorMessage(error) }, { status: 403 });
    }
    if (error instanceof EmailConfigUnavailableError) {
      return NextResponse.json({ error: getErrorMessage(error), warnings: error.warnings }, { status: 503 });
    }

    return NextResponse.json(
      { success: false, error: getErrorMessage(error), timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
