import { NextResponse } from "next/server";
import { generateUploadSignatureUseCase } from "@/modules/adminCatalog/upload/application/generate-upload-signature.use-case";
import { UploadSignatureConfigError } from "@/modules/adminCatalog/upload/application/upload-signature.errors";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

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
  return runAdminRoute(async () => {
    try {
      const result = await generateUploadSignatureUseCase();
      return NextResponse.json(result, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    } catch (error) {
      if (error instanceof UploadSignatureConfigError) {
        return toErrorResponse(error);
      }
      return toErrorResponse(error);
    }
  });
}
