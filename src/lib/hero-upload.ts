/**

 * Hero image upload: process → validate output → upload with heroVariant.

 */



import {
  HERO_VIDEO,
  HERO_VIDEO_MIME_ALLOWLIST,
  formatBytesLabel,
  type HeroImageVariant,
} from "@/lib/upload-limits";

import {

  processHeroImage,

  validateHeroInputFile,

  validateHeroOutputFile,

  type HeroProcessResult,

} from "@/lib/hero-image-process";

import { uploadProcessedFileToBunny, uploadHeroVideoToBunny } from "@/lib/bunny";

import { createPhaseEvent, type UploadProgressEvent } from "@/lib/upload-progress";

import {

  markUploadPhase,

  markUploadStart,

  measureUpload,

} from "@/lib/upload-perf";



export type { HeroProcessResult };



export type HeroUploadOptions = {

  onProgress?: (event: UploadProgressEvent) => void;

};



export async function uploadHeroImageVariant(

  file: File,

  variant: HeroImageVariant,

  options?: HeroUploadOptions,

): Promise<{ url: string; report: HeroProcessResult }> {

  const perfId = crypto.randomUUID();

  markUploadStart(perfId, { type: "hero-image", variant, bytes: String(file.size) });



  options?.onProgress?.(createPhaseEvent("validating", { progress: 5 }));

  markUploadPhase(perfId, "validate-in");



  const inputError = validateHeroInputFile(file);

  if (inputError) throw new Error(inputError);



  options?.onProgress?.(

    createPhaseEvent("compressing", {

      progress: 15,

      detail: variant,

    }),

  );

  markUploadPhase(perfId, "process-in");



  const report = await processHeroImage(file, variant, { perfId });



  markUploadPhase(perfId, "process-out");

  const outputError = validateHeroOutputFile(report.file, variant);

  if (outputError) throw new Error(outputError);



  options?.onProgress?.(createPhaseEvent("uploading", { progress: 70 }));

  markUploadPhase(perfId, "upload-in");



  try {

    const url = await uploadProcessedFileToBunny(report.file, "image", "heroes", {

      heroVariant: variant,

      heroProcessed: true,

      onProgress: options?.onProgress,

      perfId,

    });



    markUploadPhase(perfId, "upload-out");

    measureUpload(perfId);

    options?.onProgress?.(createPhaseEvent("uploading", { progress: 100 }));



    return { url, report };

  } catch (err) {

    measureUpload(perfId);

    throw err;

  }

}



export function validateHeroVideoInput(file: File): string | null {

  const mime = (file.type || "").toLowerCase().split(";")[0].trim();

  if (!HERO_VIDEO_MIME_ALLOWLIST.has(mime)) {

    return "Heroes: solo MP4 (H.264). Exporta el video como MP4.";

  }

  if (file.size > HERO_VIDEO.maxInputBytes) {

    return `El video supera ${formatBytesLabel(HERO_VIDEO.maxInputBytes)} de entrada permitidos`;

  }

  return null;

}



export async function uploadHeroVideo(

  file: File,

  options?: HeroUploadOptions,

): Promise<string> {

  options?.onProgress?.(createPhaseEvent("validating", { progress: 2 }));



  const err = validateHeroVideoInput(file);

  if (err) throw new Error(err);



  return uploadHeroVideoToBunny(file, {

    onProgress: options?.onProgress,

  });

}


