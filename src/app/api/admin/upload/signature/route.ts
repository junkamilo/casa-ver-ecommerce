import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { generateUploadSignatureUseCase } from "@/modules/adminCatalog/upload/application/generate-upload-signature.use-case";
import { UploadSignatureConfigError } from "@/modules/adminCatalog/upload/application/upload-signature.errors";

/**
 * GET /api/admin/upload/signature
 *
 * Genera un token de subida firmado para Cloudinary.
 * Solo accesible por ADMIN — la sesión se verifica en el servidor antes de firmar.
 *
 * El cliente recibe: { timestamp, signature, apiKey, cloudName, folder }
 * y los usa para hacer un upload firmado directamente a Cloudinary.
 * Nunca se expone CLOUDINARY_API_SECRET al navegador.
 *
 * Requiere en .env:
 *   CLOUDINARY_CLOUD_NAME=tu-cloud-name
 *   CLOUDINARY_API_KEY=tu-api-key
 *   CLOUDINARY_API_SECRET=tu-api-secret
 */
export async function GET() {
  // 1. Verificar sesión admin
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return new NextResponse("Acceso denegado", { status: 403 });
  }

  try {
    const result = await generateUploadSignatureUseCase();
    return NextResponse.json(result, {
      headers: {
        // No cachear — cada firma debe ser fresca
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    if (error instanceof UploadSignatureConfigError) {
      console.error("[UPLOAD_SIGNATURE]", error.message);
      return new NextResponse("Configuración de almacenamiento incompleta en el servidor", {
        status: 500,
      });
    }
    console.error("[UPLOAD_SIGNATURE] Error interno:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
