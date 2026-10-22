/** @jest-environment node */
const verifyWebAdmin = jest.fn();

jest.mock("../infrastructure/pos-catalog.client", () => {
  class PosApiError extends Error {
    constructor(
      message: string,
      readonly status: number,
    ) {
      super(message);
    }
  }
  return { PosApiError, verifyWebAdmin: (...args: unknown[]) => verifyWebAdmin(...args) };
});

import { PosApiError } from "../infrastructure/pos-catalog.client";
import { verifyPosAdminPassword } from "../application/verify-pos-admin.use-case";

describe("verifyPosAdminPassword", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env, POS_API_BASE_URL: "http://pos/api/public/catalog", POS_API_KEY: "k" };
    verifyWebAdmin.mockReset();
  });

  afterAll(() => {
    process.env = env;
  });

  it("válida solo si el POS lo confirma", async () => {
    verifyWebAdmin.mockResolvedValueOnce({ valid: true, admin: null });
    await expect(verifyPosAdminPassword("a@b.co", "x", "1.2.3.4")).resolves.toBe("valid");
    expect(verifyWebAdmin).toHaveBeenCalledWith("a@b.co", "x", "1.2.3.4");

    verifyWebAdmin.mockResolvedValueOnce({ valid: false, admin: null });
    await expect(verifyPosAdminPassword("a@b.co", "x", null)).resolves.toBe("invalid");
  });

  it("bloqueo por intentos y POS caído no dejan entrar", async () => {
    verifyWebAdmin.mockRejectedValueOnce(new PosApiError("Demasiados intentos", 429));
    await expect(verifyPosAdminPassword("a@b.co", "x", null)).resolves.toBe("too_many_attempts");

    jest.spyOn(console, "error").mockImplementation(() => {});
    verifyWebAdmin.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    await expect(verifyPosAdminPassword("a@b.co", "x", null)).resolves.toBe("unavailable");
  });

  it("sin integración configurada no hay acceso", async () => {
    delete process.env.POS_API_KEY;
    await expect(verifyPosAdminPassword("a@b.co", "x", null)).resolves.toBe("unavailable");
    expect(verifyWebAdmin).not.toHaveBeenCalled();
  });
});
