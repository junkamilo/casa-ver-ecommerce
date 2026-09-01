/**
 * Parallel chunk upload pool with bounded concurrency and retry.
 */

export const UPLOAD_CHUNK_CONCURRENCY = 3;
const CHUNK_RETRY_DELAY_MS = 500;
const CHUNK_MAX_RETRIES = 1;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function uploadChunksParallel(input: {
  file: File;
  chunkSize: number;
  concurrency?: number;
  uploadChunk: (index: number, blob: Blob) => Promise<void>;
  onProgress?: (completed: number, total: number) => void;
}): Promise<void> {
  const {
    file,
    chunkSize,
    concurrency = UPLOAD_CHUNK_CONCURRENCY,
    uploadChunk,
    onProgress,
  } = input;

  const totalChunks = Math.ceil(file.size / chunkSize);
  let nextIndex = 0;
  let completed = 0;
  let firstError: Error | null = null;

  async function worker(): Promise<void> {
    while (!firstError) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= totalChunks) return;

      const start = index * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const blob = file.slice(start, end);

      let attempt = 0;
      while (attempt <= CHUNK_MAX_RETRIES) {
        try {
          await uploadChunk(index, blob);
          break;
        } catch (err) {
          attempt += 1;
          if (attempt > CHUNK_MAX_RETRIES) {
            firstError = err instanceof Error ? err : new Error("Error al subir parte");
            return;
          }
          await sleep(CHUNK_RETRY_DELAY_MS);
        }
      }

      completed += 1;
      onProgress?.(completed, totalChunks);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, totalChunks) },
    () => worker(),
  );
  await Promise.all(workers);

  if (firstError) throw firstError;
}
