/// <reference lib="webworker" />

import {
  HERO_IMAGE,
  type HeroImageVariant,
} from "./upload-limits";

const QUALITY_STEPS = [0.85, 0.78, 0.7, 0.62, 0.55] as const;

export type HeroProcessWorkerRequest = {
  id: string;
  variant: HeroImageVariant;
};

export type HeroProcessWorkerSuccess = {
  id: string;
  ok: true;
  blob: Blob;
  width: number;
  height: number;
  inputWidth: number;
  inputHeight: number;
  outputBytes: number;
  qualityUsed: number;
};

export type HeroProcessWorkerError = {
  id: string;
  ok: false;
  error: string;
};

export type HeroProcessWorkerResponse = HeroProcessWorkerSuccess | HeroProcessWorkerError;

async function encodeToTarget(
  bitmap: ImageBitmap,
  targetBytes: number,
): Promise<{ blob: Blob; qualityUsed: number } | null> {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0);

  for (const quality of QUALITY_STEPS) {
    const blob = await canvas.convertToBlob({
      type: HERO_IMAGE.outputMime,
      quality,
    });
    if (blob.size <= targetBytes) {
      return { blob, qualityUsed: quality };
    }
  }
  return null;
}

self.onmessage = async (event: MessageEvent<{ file: File } & HeroProcessWorkerRequest>) => {
  const { id, file, variant } = event.data;
  const { maxWidth, targetBytes } = HERO_IMAGE.variants[variant];

  try {
    const probe = await createImageBitmap(file);
    const inputWidth = probe.width;
    const inputHeight = probe.height;
    probe.close();

    if (inputWidth * inputHeight > HERO_IMAGE.maxInputPixels) {
      const payload: HeroProcessWorkerError = {
        id,
        ok: false,
        error: `Imagen demasiado grande (${inputWidth}×${inputHeight}). Máximo ${HERO_IMAGE.maxInputPixels.toLocaleString()} píxeles.`,
      };
      self.postMessage(payload);
      return;
    }

    const resizeWidth = Math.min(inputWidth, maxWidth);
    const bitmap = await createImageBitmap(file, {
      resizeWidth,
      resizeQuality: "high",
    });

    const encoded = await encodeToTarget(bitmap, targetBytes);
    bitmap.close();

    if (!encoded) {
      const payload: HeroProcessWorkerError = {
        id,
        ok: false,
        error: `No se pudo comprimir bajo ${Math.round(targetBytes / 1024)} KB para ${variant}. Prueba otra exportación o reduce el detalle.`,
      };
      self.postMessage(payload);
      return;
    }

    const payload: HeroProcessWorkerSuccess = {
      id,
      ok: true,
      blob: encoded.blob,
      width: resizeWidth,
      height: Math.round((inputHeight * resizeWidth) / inputWidth),
      inputWidth,
      inputHeight,
      outputBytes: encoded.blob.size,
      qualityUsed: encoded.qualityUsed,
    };
    self.postMessage(payload);
  } catch (err) {
    const payload: HeroProcessWorkerError = {
      id,
      ok: false,
      error: err instanceof Error ? err.message : "Error al procesar la imagen",
    };
    self.postMessage(payload);
  }
};
