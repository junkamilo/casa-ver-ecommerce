import { NextRequest, NextResponse } from "next/server";
import { EmailTestUnauthorizedError, EmailTestValidationError, EmailConfigUnavailableError } from "@/modules/adminCatalog/emailTest/application/email-test.errors";
import { getEmailDiagnosticUseCase } from "@/modules/adminCatalog/emailTest/application/get-email-diagnostic.use-case";
import { sendTestEmailUseCase } from "@/modules/adminCatalog/emailTest/application/send-test-email.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Error interno";
}

export async function GET() {
  return runAdminRoute(async () => {
    const result = getEmailDiagnosticUseCase(process.env.RESEND_API_KEY);
    return NextResponse.json(result);
  });
}

export async function POST(req: NextRequest) {
  return runAdminRoute(async (admin) => {
    try {
      let body;
      try {
        body = await req.json();
      } catch {
        throw new EmailTestValidationError("Body JSON inválido");
      }
      const result = await sendTestEmailUseCase(body, {
        userRole: admin.role,
        providedCliSecret: req.headers.get("x-cli-secret"),
        envCliSecret: process.env.CLI_SECRET,
      });
      return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
      if (error instanceof EmailConfigUnavailableError) {
        return NextResponse.json(
          { message: getErrorMessage(error), code: "EMAIL_CONFIG_UNAVAILABLE", details: error.warnings },
          { status: 503 }
        );
      }
      if (error instanceof EmailTestUnauthorizedError || error instanceof EmailTestValidationError) {
        return toErrorResponse(error);
      }
      return toErrorResponse(error);
    }
  });
}
