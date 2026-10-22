export class PosConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PosConfigError";
  }
}

export function isPosCatalogConfigured(): boolean {
  return Boolean(process.env.POS_API_BASE_URL && process.env.POS_API_KEY);
}

export function getPosApiConfig(): { baseUrl: string; apiKey: string } {
  const baseUrl = process.env.POS_API_BASE_URL?.replace(/\/+$/, "");
  const apiKey = process.env.POS_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new PosConfigError("POS_API_BASE_URL y POS_API_KEY son obligatorias");
  }
  return { baseUrl, apiKey };
}
