/** @jest-environment node */

import { verifyCaptcha } from "@/modules/checkout/infrastructure/verify-recaptcha";

const originalFetch = global.fetch;
const originalSecret = process.env.RECAPTCHA_SECRET_KEY;

function mockFetchJson(body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => body,
  }) as unknown as typeof fetch;
}

describe("verifyCaptcha", () => {
  afterEach(() => {
    global.fetch = originalFetch;
    if (originalSecret === undefined) {
      delete process.env.RECAPTCHA_SECRET_KEY;
    } else {
      process.env.RECAPTCHA_SECRET_KEY = originalSecret;
    }
    jest.restoreAllMocks();
  });

  it("rechaza token vacío", async () => {
    process.env.RECAPTCHA_SECRET_KEY = "secret";
    mockFetchJson({ success: true });
    await expect(verifyCaptcha("")).resolves.toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rechaza si no hay RECAPTCHA_SECRET_KEY", async () => {
    delete process.env.RECAPTCHA_SECRET_KEY;
    mockFetchJson({ success: true });
    await expect(verifyCaptcha("tok")).resolves.toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("acepta cuando Google responde success: true", async () => {
    process.env.RECAPTCHA_SECRET_KEY = "secret";
    mockFetchJson({ success: true });
    await expect(verifyCaptcha("valid-token")).resolves.toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("rechaza cuando Google responde success: false", async () => {
    process.env.RECAPTCHA_SECRET_KEY = "secret";
    mockFetchJson({ success: false });
    await expect(verifyCaptcha("bad-token")).resolves.toBe(false);
  });
});
