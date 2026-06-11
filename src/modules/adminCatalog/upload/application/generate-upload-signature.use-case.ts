import type { UploadSignatureResponseDTO } from "../contracts/upload-signature.dto";
import { buildUploadSignature } from "../domain/upload-signature.entity";
import { CloudinaryConfigRepository } from "../infrastructure/cloudinary-config.repository";
import { UploadSignatureConfigError } from "./upload-signature.errors";

const cloudinaryConfigRepository = new CloudinaryConfigRepository();

export async function generateUploadSignatureUseCase(): Promise<UploadSignatureResponseDTO> {
  const config = cloudinaryConfigRepository.getConfig();
  if (!config) {
    throw new UploadSignatureConfigError(
      "Faltan variables de entorno: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY o NEXT_PUBLIC_CLOUDINARY_API_SECRET"
    );
  }

  const folder = "casa-verde/products";
  const timestamp = Math.round(Date.now() / 1000);
  const signature = buildUploadSignature({
    folder,
    timestamp,
    apiSecret: config.apiSecret,
  });

  return {
    timestamp,
    signature,
    apiKey: config.apiKey,
    cloudName: config.cloudName,
    folder,
  };
}
