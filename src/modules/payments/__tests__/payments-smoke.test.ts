/** @jest-environment node */

// Smoke tests del dominio de pagos — cubren lógica pura (predicados,
// schemas, verifiers HMAC, validación de claves). NO ejecutan llamadas
// reales a Bold/Addi ni queries Prisma. Para un test end-to-end real con
// las APIs sandbox usar los pasos del checklist de QA en el plan.

import { createHmac } from "crypto";

import {
  isApproved as isBoldApproved,
  isRejected as isBoldRejected,
  isRefunded as isBoldRefunded,
  mapBoldStatusToUiStatus,
  shouldMarkAsFailed,
} from "@/modules/payments/bold/domain/bold-status.entity";
import { verifyBoldSignature } from "@/modules/payments/bold/infrastructure/bold-signature.verifier";

import {
  mapCallbackStatusToOrderStatus,
  isWebhookApproved as isAddiWebhookApproved,
  isWebhookRejected as isAddiWebhookRejected,
} from "@/modules/payments/addi/domain/addi-status.entity";
import {
  createAddiApplicationInputSchema,
  isValidApplicationId,
  isValidCallbackStatus,
  isValidOrderId,
} from "@/modules/payments/addi/contracts/addi.schema";
import { verifyAddiCallbackKey } from "@/modules/payments/addi/infrastructure/addi-callback-key.verifier";
import { verifyAddiSignature } from "@/modules/payments/addi/infrastructure/addi-signature.verifier";

// process.env es read-only en TS para campos como NODE_ENV; este cast
// preserva el comportamiento de runtime (en Node sí es writable).
function setNodeEnv(value: "production" | "development" | "test") {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

describe("Bold — bold-status predicados puros", () => {
  it("isApproved cubre los aliases de eventos y status", () => {
    expect(isBoldApproved("SALE_APPROVED")).toBe(true);
    expect(isBoldApproved("PAYMENT_APPROVED")).toBe(true);
    expect(isBoldApproved("TRANSACTION_APPROVED")).toBe(true);
    expect(isBoldApproved("payment.approved")).toBe(true);
    expect(isBoldApproved(undefined, "APPROVED")).toBe(true);
    expect(isBoldApproved(undefined, "approved")).toBe(true);
    expect(isBoldApproved(undefined, "PAID")).toBe(true);
    expect(isBoldApproved("OTHER", "OTHER")).toBe(false);
  });

  it("isRejected cubre los aliases", () => {
    expect(isBoldRejected("SALE_REJECTED")).toBe(true);
    expect(isBoldRejected("PAYMENT_REJECTED")).toBe(true);
    expect(isBoldRejected("payment.rejected")).toBe(true);
    expect(isBoldRejected(undefined, "REJECTED")).toBe(true);
    expect(isBoldRejected(undefined, "rejected")).toBe(true);
    expect(isBoldRejected("SALE_APPROVED")).toBe(false);
  });

  it("isRefunded reconoce VOID_APPROVED y status REFUNDED", () => {
    expect(isBoldRefunded("VOID_APPROVED")).toBe(true);
    expect(isBoldRefunded(undefined, "REFUNDED")).toBe(true);
    expect(isBoldRefunded(undefined, "refunded")).toBe(true);
    expect(isBoldRefunded("SALE_APPROVED")).toBe(false);
  });

  it("mapBoldStatusToUiStatus convierte PAID → APPROVED y deja el resto", () => {
    expect(mapBoldStatusToUiStatus("PAID")).toBe("APPROVED");
    expect(mapBoldStatusToUiStatus("REJECTED")).toBe("REJECTED");
    expect(mapBoldStatusToUiStatus("RUNNING")).toBe("RUNNING");
  });

  it("shouldMarkAsFailed cubre REJECTED/CANCELLED/EXPIRED", () => {
    expect(shouldMarkAsFailed("REJECTED")).toBe(true);
    expect(shouldMarkAsFailed("CANCELLED")).toBe(true);
    expect(shouldMarkAsFailed("EXPIRED")).toBe(true);
    expect(shouldMarkAsFailed("PAID")).toBe(false);
    expect(shouldMarkAsFailed("RUNNING")).toBe(false);
  });
});

describe("Bold — verifyBoldSignature HMAC-SHA256", () => {
  const ORIGINAL_ENV = { ...process.env };
  const SECRET = "test_secret_xyz";
  const RAW_BODY = '{"type":"SALE_APPROVED","data":{"reference_id":"abc"}}';

  function expectedSignature(rawBody: string, secret: string): string {
    const bodyBase64 = Buffer.from(rawBody).toString("base64");
    return createHmac("sha256", secret).update(bodyBase64).digest("hex");
  }

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("valida firma correcta con secreto configurado", () => {
    process.env.BOLD_WEBHOOK_SECRET = SECRET;
    const signature = expectedSignature(RAW_BODY, SECRET);
    const result = verifyBoldSignature(RAW_BODY, signature);
    expect(result).toEqual({ skip: false, valid: true });
  });

  it("acepta el prefijo sha256= en la firma", () => {
    process.env.BOLD_WEBHOOK_SECRET = SECRET;
    const signature = `sha256=${expectedSignature(RAW_BODY, SECRET)}`;
    const result = verifyBoldSignature(RAW_BODY, signature);
    expect(result).toEqual({ skip: false, valid: true });
  });

  it("rechaza firma alterada", () => {
    process.env.BOLD_WEBHOOK_SECRET = SECRET;
    const wrong = expectedSignature("{}", SECRET);
    const result = verifyBoldSignature(RAW_BODY, wrong);
    expect(result).toEqual({ skip: false, valid: false });
  });

  it("salta verificación si no hay header de firma (Bold Link de Pagos)", () => {
    process.env.BOLD_WEBHOOK_SECRET = SECRET;
    setNodeEnv("development");
    const result = verifyBoldSignature(RAW_BODY, "");
    expect(result).toEqual({ skip: true });
  });

  it("salta si el secreto parece una URL (config inválida) en dev", () => {
    process.env.BOLD_WEBHOOK_SECRET = "https://wrong.example.com";
    setNodeEnv("development");
    const result = verifyBoldSignature(RAW_BODY, "deadbeef");
    expect(result).toEqual({ skip: true });
  });
});

describe("Addi — addi-status predicados puros", () => {
  it("mapCallbackStatusToOrderStatus mapea correctamente", () => {
    expect(mapCallbackStatusToOrderStatus("REJECTED")).toBe("FAILED");
    expect(mapCallbackStatusToOrderStatus("DECLINED")).toBe("FAILED");
    expect(mapCallbackStatusToOrderStatus("INTERNAL_ERROR")).toBe("FAILED");
    expect(mapCallbackStatusToOrderStatus("ABANDONED")).toBe("CANCELLED");
    expect(mapCallbackStatusToOrderStatus("APPROVED")).toBeNull();
    expect(mapCallbackStatusToOrderStatus("PENDING")).toBeNull();
    expect(mapCallbackStatusToOrderStatus("UNKNOWN")).toBeNull();
  });

  it("isWebhookApproved reconoce variantes", () => {
    expect(isAddiWebhookApproved(undefined, "APPROVED")).toBe(true);
    expect(isAddiWebhookApproved(undefined, "approved")).toBe(true);
    expect(isAddiWebhookApproved("application.approved")).toBe(true);
    expect(isAddiWebhookApproved(undefined, "PENDING")).toBe(false);
  });

  it("isWebhookRejected reconoce variantes (REJECTED y DECLINED)", () => {
    expect(isAddiWebhookRejected(undefined, "REJECTED")).toBe(true);
    expect(isAddiWebhookRejected(undefined, "DECLINED")).toBe(true);
    expect(isAddiWebhookRejected(undefined, "declined")).toBe(true);
    expect(isAddiWebhookRejected("application.rejected")).toBe(true);
    expect(isAddiWebhookRejected("application.declined")).toBe(true);
    expect(isAddiWebhookRejected(undefined, "APPROVED")).toBe(false);
  });
});

describe("Addi — schemas y validadores", () => {
  it("isValidOrderId acepta UUIDs y rechaza el resto", () => {
    expect(isValidOrderId("0e2e7c11-1234-4abc-9def-0123456789ab")).toBe(true);
    expect(isValidOrderId("not-a-uuid")).toBe(false);
    expect(isValidOrderId(123)).toBe(false);
    expect(isValidOrderId(undefined)).toBe(false);
  });

  it("isValidCallbackStatus solo acepta los estados conocidos", () => {
    for (const s of [
      "APPROVED",
      "approved",
      "PENDING",
      "REJECTED",
      "ABANDONED",
      "DECLINED",
      "INTERNAL_ERROR",
    ]) {
      expect(isValidCallbackStatus(s)).toBe(true);
    }
    expect(isValidCallbackStatus("FOO")).toBe(false);
    expect(isValidCallbackStatus(undefined)).toBe(false);
  });

  it("isValidApplicationId valida longitudes (4–128 chars)", () => {
    expect(isValidApplicationId("abcd")).toBe(true);
    expect(isValidApplicationId("a".repeat(128))).toBe(true);
    expect(isValidApplicationId("a")).toBe(false);
    expect(isValidApplicationId("a".repeat(129))).toBe(false);
    expect(isValidApplicationId("")).toBe(false);
  });

  it("createAddiApplicationInputSchema valida cédula 6–12 dígitos", () => {
    const valid = createAddiApplicationInputSchema.safeParse({
      orderId: "abc123",
      cedula: "123456789",
    });
    expect(valid.success).toBe(true);

    const tooShort = createAddiApplicationInputSchema.safeParse({
      orderId: "abc123",
      cedula: "12345",
    });
    expect(tooShort.success).toBe(false);

    const tooLong = createAddiApplicationInputSchema.safeParse({
      orderId: "abc123",
      cedula: "1234567890123",
    });
    expect(tooLong.success).toBe(false);

    const nonNumeric = createAddiApplicationInputSchema.safeParse({
      orderId: "abc123",
      cedula: "12345abc",
    });
    expect(nonNumeric.success).toBe(false);
  });

  it("createAddiApplicationInputSchema rechaza orderId vacío", () => {
    const empty = createAddiApplicationInputSchema.safeParse({
      orderId: "   ",
      cedula: "1234567890",
    });
    expect(empty.success).toBe(false);
  });
});

describe("Addi — verifyAddiCallbackKey (timing-safe)", () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("acepta clave correcta con secreto configurado", () => {
    process.env.ADDI_CALLBACK_SECRET = "the_real_secret";
    expect(verifyAddiCallbackKey("the_real_secret")).toBe(true);
  });

  it("rechaza clave incorrecta", () => {
    process.env.ADDI_CALLBACK_SECRET = "the_real_secret";
    expect(verifyAddiCallbackKey("wrong")).toBe(false);
  });

  it("rechaza clave de longitud distinta sin lanzar", () => {
    process.env.ADDI_CALLBACK_SECRET = "the_real_secret";
    expect(verifyAddiCallbackKey("short")).toBe(false);
  });

  it("rechaza clave ausente", () => {
    process.env.ADDI_CALLBACK_SECRET = "the_real_secret";
    expect(verifyAddiCallbackKey(null)).toBe(false);
    expect(verifyAddiCallbackKey("")).toBe(false);
  });

  it("en dev sin secreto: omite la validación", () => {
    delete process.env.ADDI_CALLBACK_SECRET;
    setNodeEnv("development");
    expect(verifyAddiCallbackKey("anything")).toBe(true);
  });

  it("en prod sin secreto: rechaza siempre", () => {
    delete process.env.ADDI_CALLBACK_SECRET;
    setNodeEnv("production");
    expect(verifyAddiCallbackKey("anything")).toBe(false);
  });
});

describe("Addi — verifyAddiSignature HMAC-SHA256", () => {
  const ORIGINAL_ENV = { ...process.env };
  const SECRET = "addi_webhook_secret_42";
  const RAW_BODY = '{"event":"application.approved","orderId":"abc"}';

  function expectedSignature(rawBody: string, secret: string): string {
    return createHmac("sha256", secret).update(rawBody).digest("base64");
  }

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("acepta firma válida con secreto configurado", () => {
    process.env.ADDI_WEBHOOK_SECRET = SECRET;
    expect(verifyAddiSignature(RAW_BODY, expectedSignature(RAW_BODY, SECRET))).toBe(true);
  });

  it("rechaza firma alterada", () => {
    process.env.ADDI_WEBHOOK_SECRET = SECRET;
    expect(verifyAddiSignature(RAW_BODY, expectedSignature("{}", SECRET))).toBe(false);
  });

  it("rechaza firma de longitud distinta sin lanzar", () => {
    process.env.ADDI_WEBHOOK_SECRET = SECRET;
    expect(verifyAddiSignature(RAW_BODY, "short")).toBe(false);
  });

  it("dev sin secreto: omite la validación", () => {
    delete process.env.ADDI_WEBHOOK_SECRET;
    setNodeEnv("development");
    expect(verifyAddiSignature(RAW_BODY, "anything")).toBe(true);
  });

  it("prod sin secreto: rechaza siempre", () => {
    delete process.env.ADDI_WEBHOOK_SECRET;
    setNodeEnv("production");
    expect(verifyAddiSignature(RAW_BODY, "anything")).toBe(false);
  });

  it("prod con secreto pero sin header: rechaza", () => {
    process.env.ADDI_WEBHOOK_SECRET = SECRET;
    setNodeEnv("production");
    expect(verifyAddiSignature(RAW_BODY, "")).toBe(false);
  });
});
