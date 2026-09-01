import {
  HERO_IMAGE,
  HERO_IMAGE_MIME_ALLOWLIST,
  formatBytesLabel,
  getHeroVariantTargetBytes,
  type HeroImageVariant,
} from "./upload-limits";
import type { HeroProcessWorkerResponse } from "./hero-image-process.worker";
import { markUploadPhase } from "./upload-perf";

export type HeroProcessResult = {
  file: File;
  inputBytes: number;
  inputWidth: number;
  inputHeight: number;
  outputWidth: number;
  outputHeight: number;
  outputBytes: number;
  variant: HeroImageVariant;
  qualityUsed: number;
};

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./hero-image-process.worker.ts", import.meta.url));
  }
  return worker;
}

function processInWorker(file: File, variant: HeroImageVariant): Promise<HeroProcessResult> {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const w = getWorker();

    const onMessage = (event: MessageEvent<HeroProcessWorkerResponse>) => {
      if (event.data.id !== id) return;
      w.removeEventListener("message", onMessage);
      w.removeEventListener("error", onError);

      const data = event.data;
      if (!data.ok) {
        reject(new Error(data.error));
        return;
      }

      const baseName = file.name.replace(/\.[^.]+$/, "") || "hero";
      const outFile = new File([data.blob], `${baseName}-${variant}.webp`, {
        type: HERO_IMAGE.outputMime,
      });

      resolve({
        file: outFile,
        inputBytes: file.size,
        inputWidth: data.inputWidth,
        inputHeight: data.inputHeight,
        outputWidth: data.width,
        outputHeight: data.height,
        outputBytes: data.outputBytes,
        variant,
        qualityUsed: data.qualityUsed,
      });
    };

    const onError = () => {
      w.removeEventListener("message", onMessage);
      w.removeEventListener("error", onError);
      reject(new Error("El worker de compresión falló"));
    };

    w.addEventListener("message", onMessage);
    w.addEventListener("error", onError);
    w.postMessage({ id, file, variant });
  });
}

/** Fallback main-thread when Worker unavailable (SSR guard / tests). */
async function processOnMainThread(
  file: File,
  variant: HeroImageVariant,
): Promise<HeroProcessResult> {
  const { maxWidth, targetBytes } = HERO_IMAGE.variants[variant];
  const probe = await createImageBitmap(file);
  const inputWidth = probe.width;
  const inputHeight = probe.height;
  probe.close();

  if (inputWidth * inputHeight > HERO_IMAGE.maxInputPixels) {
    throw new Error(
      `Imagen demasiado grande (${inputWidth}×${inputHeight}). Máximo ${HERO_IMAGE.maxInputPixels.toLocaleString()} píxeles.`,
    );
  }

  const resizeWidth = Math.min(inputWidth, maxWidth);
  const bitmap = await createImageBitmap(file, {
    resizeWidth,
    resizeQuality: "high",
  });

  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
  bitmap.close();

  const qualities = [0.85, 0.78, 0.7, 0.62, 0.55];
  let blob: Blob | null = null;
  let qualityUsed = qualities[0]!;

  for (const q of qualities) {
    const candidate = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), HERO_IMAGE.outputMime, q);
    });
    if (candidate && candidate.size <= targetBytes) {
      blob = candidate;
      qualityUsed = q;
      break;
    }
  }

  if (!blob) {
    throw new Error(
      `No se pudo comprimir bajo ${formatBytesLabel(targetBytes)} para ${variant}. Prueba otra exportación.`,
    );
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "hero";
  const outFile = new File([blob], `${baseName}-${variant}.webp`, {
    type: HERO_IMAGE.outputMime,
  });

  return {
    file: outFile,
    inputBytes: file.size,
    inputWidth,
    inputHeight,
    outputWidth: canvas.width,
    outputHeight: canvas.height,
    outputBytes: blob.size,
    variant,
    qualityUsed,
  };
}

export async function processHeroImage(
  file: File,
  variant: HeroImageVariant,
  options?: { perfId?: string },
): Promise<HeroProcessResult> {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    throw new Error("processHeroImage solo está disponible en el navegador");
  }

  if (options?.perfId) markUploadPhase(options.perfId, "worker-decode");

  try {
    const result = await processInWorker(file, variant);
    if (options?.perfId) markUploadPhase(options.perfId, "worker-encode");
    return result;
  } catch {
    const result = await processOnMainThread(file, variant);
    if (options?.perfId) markUploadPhase(options.perfId, "worker-encode");
    return result;
  }
}

export function validateHeroInputFile(file: File): string | null {
  const mime = (file.type || "").toLowerCase().split(";")[0].trim();
  if (!HERO_IMAGE_MIME_ALLOWLIST.has(mime)) {
    return "Heroes: solo JPEG, PNG, WebP o GIF";
  }
  if (file.size > HERO_IMAGE.maxInputBytes) {
    return `El archivo supera ${formatBytesLabel(HERO_IMAGE.maxInputBytes)} de entrada permitidos`;
  }
  return null;
}

export function validateHeroOutputFile(
  file: File,
  variant: HeroImageVariant,
): string | null {
  if (file.type !== HERO_IMAGE.outputMime) {
    return "La salida del hero debe ser WebP";
  }
  const maxOut = Math.ceil(getHeroVariantTargetBytes(variant) * 1.05);
  if (file.size > maxOut) {
    return `La imagen procesada supera el objetivo de ${formatBytesLabel(getHeroVariantTargetBytes(variant))} para ${variant}`;
  }
  return null;
}
