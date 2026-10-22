/** @jest-environment node */
import {
  POS_SIGNATURE_TOLERANCE_SECONDS,
  signPosPayload,
  verifyPosSignature,
} from "../domain/verify-signature";

const SECRET = "test-secret";
const NOW = 1_790_000_000;
const BODY = JSON.stringify({ eventId: "evt-1", event: "product.upserted" });

function signed(overrides: Partial<Parameters<typeof verifyPosSignature>[0]> = {}) {
  const timestamp = String(NOW);
  return verifyPosSignature({
    rawBody: BODY,
    timestamp,
    signature: `sha256=${signPosPayload(SECRET, timestamp, BODY)}`,
    secret: SECRET,
    nowSeconds: NOW,
    ...overrides,
  });
}

describe("verifyPosSignature", () => {
  it("acepta una firma válida con prefijo sha256=", () => {
    expect(signed()).toEqual({ valid: true });
  });

  it("acepta la firma sin prefijo y en mayúsculas", () => {
    const signature = signPosPayload(SECRET, NOW, BODY).toUpperCase();
    expect(signed({ signature })).toEqual({ valid: true });
  });

  it("rechaza un cuerpo alterado", () => {
    expect(signed({ rawBody: BODY.replace("evt-1", "evt-2") })).toEqual({
      valid: false,
      reason: "bad_signature",
    });
  });

  it("rechaza una firma hecha con otro secreto", () => {
    const signature = `sha256=${signPosPayload("otro", NOW, BODY)}`;
    expect(signed({ signature })).toEqual({ valid: false, reason: "bad_signature" });
  });

  it("rechaza una firma de longitud distinta sin lanzar", () => {
    expect(signed({ signature: "sha256=abc" })).toEqual({ valid: false, reason: "bad_signature" });
  });

  it("rechaza timestamps fuera de la ventana de 5 minutos", () => {
    const tooOld = NOW - POS_SIGNATURE_TOLERANCE_SECONDS - 1;
    const timestamp = String(tooOld);
    const signature = `sha256=${signPosPayload(SECRET, timestamp, BODY)}`;
    expect(signed({ timestamp, signature })).toEqual({ valid: false, reason: "stale_timestamp" });
  });

  it("acepta timestamps en el borde de la ventana", () => {
    const timestamp = String(NOW - POS_SIGNATURE_TOLERANCE_SECONDS);
    const signature = `sha256=${signPosPayload(SECRET, timestamp, BODY)}`;
    expect(signed({ timestamp, signature })).toEqual({ valid: true });
  });

  it("rechaza timestamps no numéricos", () => {
    expect(signed({ timestamp: "ayer" })).toEqual({ valid: false, reason: "stale_timestamp" });
  });

  it("reporta encabezados y secreto faltantes", () => {
    expect(signed({ signature: null })).toEqual({ valid: false, reason: "missing_headers" });
    expect(signed({ timestamp: null })).toEqual({ valid: false, reason: "missing_headers" });
    expect(signed({ secret: undefined })).toEqual({ valid: false, reason: "missing_secret" });
  });
});
