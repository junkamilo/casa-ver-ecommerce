export type UploadPhase =
  | "validating"
  | "compressing"
  | "reading_metadata"
  | "uploading_chunks"
  | "assembling"
  | "uploading";

export type UploadProgressEvent = {
  phase: UploadPhase;
  message: string;
  progress?: number | null;
  detail?: string;
};

export const UPLOAD_PHASE_MESSAGES: Record<UploadPhase, string> = {
  validating: "Validando archivo…",
  compressing: "Comprimiendo imagen…",
  reading_metadata: "Leyendo duración…",
  uploading_chunks: "Subiendo video…",
  assembling: "Finalizando subida…",
  uploading: "Subiendo imagen…",
};

export function chunkProgressPercent(completed: number, total: number): number {
  if (total <= 0) return 5;
  return Math.round(5 + (completed / total) * 80);
}

export function assemblingProgressPercent(): number {
  return 90;
}

export function createChunkProgressEvent(
  completed: number,
  total: number,
): UploadProgressEvent {
  return {
    phase: "uploading_chunks",
    message: `Subiendo video (parte ${completed}/${total})…`,
    progress: chunkProgressPercent(completed, total),
    detail: `Parte ${completed}/${total}`,
  };
}

export function createPhaseEvent(
  phase: UploadPhase,
  overrides?: Partial<Pick<UploadProgressEvent, "message" | "progress" | "detail">>,
): UploadProgressEvent {
  return {
    phase,
    message: overrides?.message ?? UPLOAD_PHASE_MESSAGES[phase],
    progress: overrides?.progress,
    detail: overrides?.detail,
  };
}
