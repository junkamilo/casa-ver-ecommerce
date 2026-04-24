import { createHash } from "crypto";

export function buildUploadSignature(input: { folder: string; timestamp: number; apiSecret: string }): string {
  const toSign = `folder=${input.folder}&timestamp=${input.timestamp}${input.apiSecret}`;
  return createHash("sha1").update(toSign).digest("hex");
}
