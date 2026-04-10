import { auth } from "@/auth";
import { createHash } from "crypto";
import { NextResponse } from "next/server";

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

  // 2. Leer credenciales (soporta ambos prefijos para compatibilidad)
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error(
      "[UPLOAD_SIGNATURE] Faltan variables de entorno: " +
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY o NEXT_PUBLIC_CLOUDINARY_API_SECRET"
    );
    return new NextResponse(
      "Configuración de almacenamiento incompleta en el servidor",
      { status: 500 }
    );
  }

  // 3. Generar firma — válida por ~1 hora (Cloudinary rechaza timestamps con >1h de diferencia)
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "casa-verde/products";

  // Parámetros a firmar en orden alfabético, concatenados con el secret al final
  // Ref: https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(toSign).digest("hex");

  return NextResponse.json(
    { timestamp, signature, apiKey, cloudName, folder },
    {
      headers: {
        // No cachear — cada firma debe ser fresca
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
