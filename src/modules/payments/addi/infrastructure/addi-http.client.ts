import https from "https";
import http from "http";
import { getAddiToken } from "./addi-token.service";
import type { AddiCancelLowLevelResult } from "../contracts/addi.dto";

// ---------------------------------------------------------------------------
// Addi HTTP Client
//
// Encapsula las dos llamadas que hacemos a Addi:
//   1. POST /v1/online-applications      → crear aplicación de crédito
//   2. POST /v1/online-applications/cancellations → cancelar crédito aprobado
//
// IMPORTANTE: createApplication usa https/http nativos de Node con
// `redirect: "manual"` IMPLÍCITO (porque no seguimos redirects). En
// Node.js / undici, `fetch()` con `redirect: "manual"` devuelve
// opaque-redirect (status 0, headers vacíos), impidiendo leer el header
// Location del 301 que Addi devuelve. Por eso usamos sockets directos.
// ---------------------------------------------------------------------------

export const ADDI_TIMEOUT_MS = 15_000;
export const ADDI_CREATE_ENDPOINT = "/v1/online-applications";
export const ADDI_CANCEL_ENDPOINT = "/v1/online-applications/cancellations";

export interface AddiPostRawResult {
  status: number;
  location: string | null;
  body: string;
}

// Hace un POST sin seguir redirects y devuelve status + Location + body raw.
// Función pura — el caller le pasa la URL completa, el token y el body.
export function addiPost(
  url: string,
  token: string,
  bodyStr: string,
  timeoutMs: number
): Promise<AddiPostRawResult> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === "https:";
    const lib = isHttps ? https : http;

    const options: https.RequestOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? "443" : "80"),
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Content-Length": String(Buffer.byteLength(bodyStr)),
      },
    };

    let socketConnected = false;
    const startTime = Date.now();

    const req = lib.request(options, (res) => {
      let data = "";
      res.on("data", (chunk: Buffer) => {
        data += chunk.toString();
      });
      res.on("end", () => {
        const rawLoc = res.headers["location"];
        const location = Array.isArray(rawLoc) ? rawLoc[0] : (rawLoc ?? null);
        resolve({ status: res.statusCode ?? 0, location, body: data });
      });
      res.on("error", reject);
    });

    req.on("socket", (socket) => {
      socket.on("connect", () => {
        socketConnected = true;
        console.log(`[Addi] Socket TCP conectado en ${Date.now() - startTime}ms`);
      });
      socket.on("secureConnect", () => {
        console.log(`[Addi] TLS handshake completo en ${Date.now() - startTime}ms`);
      });
    });

    req.setTimeout(timeoutMs, () => {
      const msg = socketConnected ? "ADDI_TIMEOUT:connected" : "ADDI_TIMEOUT:no-connect";
      req.destroy(new Error(msg));
    });

    req.on("error", (err) => {
      console.error(`[Addi] Error de socket (${Date.now() - startTime}ms):`, err.message);
      reject(err);
    });
    req.write(bodyStr);
    req.end();
  });
}

export class AddiHttpClient {
  private readonly apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl ?? process.env.ADDI_API_URL ?? "";
  }

  // Lanza si ADDI_API_URL no está configurada — los use cases lo capturan
  // y lo convierten en error de configuración.
  private requireApiUrl(): string {
    if (!this.apiUrl) {
      throw new Error("ADDI_API_URL no configurado");
    }
    return this.apiUrl;
  }

  // POST /v1/online-applications — crear aplicación de crédito.
  async createApplication(
    payload: Record<string, unknown>,
    timeoutMs: number = ADDI_TIMEOUT_MS
  ): Promise<AddiPostRawResult> {
    const apiUrl = this.requireApiUrl();
    const token = await getAddiToken();
    return addiPost(`${apiUrl}${ADDI_CREATE_ENDPOINT}`, token, JSON.stringify(payload), timeoutMs);
  }

  // POST /v1/online-applications/cancellations — cancelación total.
  async cancelApplication(
    externalOrderId: string,
    amount: number
  ): Promise<AddiCancelLowLevelResult> {
    const apiUrl = process.env.ADDI_API_URL;
    if (!apiUrl) {
      return { success: false, error: "ADDI_API_URL no configurado" };
    }

    let token: string;
    try {
      token = await getAddiToken();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error obteniendo token Addi";
      console.error("[Addi Cancel] Error de autenticación:", err);
      return { success: false, error: msg };
    }

    const cancelPayload = {
      orderId: externalOrderId,
      amount: String(Math.round(amount)),
    };

    console.log("[Addi Cancel] Cancelando crédito:", cancelPayload);

    const res = await fetch(`${apiUrl}${ADDI_CANCEL_ENDPOINT}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cancelPayload),
    });

    if (res.ok || res.status === 204) {
      console.info("[Addi Cancel] Crédito cancelado correctamente:", externalOrderId);
      return { success: true };
    }

    let errorDetail = "";
    try {
      const data = await res.json();
      errorDetail = data?.message ?? JSON.stringify(data);
    } catch {
      errorDetail = await res.text();
    }

    console.error(`[Addi Cancel] Error ${res.status}:`, errorDetail);
    return { success: false, error: `Addi ${res.status}: ${errorDetail}` };
  }
}
