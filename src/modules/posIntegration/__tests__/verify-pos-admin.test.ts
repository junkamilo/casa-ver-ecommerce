/** @jest-environment node */
const verifyWebAdmin = jest.fn();
const listWebAdmins = jest.fn();

jest.mock("../infrastructure/pos-catalog.client", () => {
  class PosApiError extends Error {
    constructor(
      message: string,
      readonly status: number,
    ) {
      super(message);
    }
  }
  return {
    PosApiError,
    verifyWebAdmin: (...args: unknown[]) => verifyWebAdmin(...args),
    listWebAdmins: (...args: unknown[]) => listWebAdmins(...args),
  };
});

import { PosApiError } from "../infrastructure/pos-catalog.client";
import {
  clearPosAdminCache,
  isActivePosAdmin,
  isPosAdminEmail,
  verifyPosAdminLogin,
} from "../application/verify-pos-admin.use-case";

const admin = { userId: "d3b07384-0001", email: "Gerencia@CasaVerde.com", fullName: "Alejandra Gómez", updatedAt: null };

describe("admins de la web desde el POS", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env, POS_API_BASE_URL: "http://pos/api/public/catalog", POS_API_KEY: "k" };
    verifyWebAdmin.mockReset();
    listWebAdmins.mockReset();
    clearPosAdminCache();
  });

  afterAll(() => {
    process.env = env;
  });

  it("el login es válido solo si el POS lo confirma, y trae el admin del POS", async () => {
    verifyWebAdmin.mockResolvedValueOnce({ valid: true, admin });
    await expect(verifyPosAdminLogin("gerencia@casaverde.com", "x", "1.2.3.4")).resolves.toEqual({
      outcome: "valid",
      admin,
    });
    expect(verifyWebAdmin).toHaveBeenCalledWith("gerencia@casaverde.com", "x", "1.2.3.4");

    verifyWebAdmin.mockResolvedValueOnce({ valid: false, admin: null });
    await expect(verifyPosAdminLogin("gerencia@casaverde.com", "x", null)).resolves.toEqual({
      outcome: "invalid",
      admin: null,
    });
  });

  it("bloqueo por intentos y POS caído no dejan entrar", async () => {
    verifyWebAdmin.mockRejectedValueOnce(new PosApiError("Demasiados intentos", 429));
    await expect(verifyPosAdminLogin("a@b.co", "x", null)).resolves.toMatchObject({ outcome: "too_many_attempts" });

    jest.spyOn(console, "error").mockImplementation(() => {});
    verifyWebAdmin.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    await expect(verifyPosAdminLogin("a@b.co", "x", null)).resolves.toMatchObject({ outcome: "unavailable" });
  });

  it("sin integración configurada no hay acceso ni lista", async () => {
    delete process.env.POS_API_KEY;
    await expect(verifyPosAdminLogin("a@b.co", "x", null)).resolves.toMatchObject({ outcome: "unavailable" });
    await expect(isPosAdminEmail("a@b.co")).resolves.toBeNull();
    expect(verifyWebAdmin).not.toHaveBeenCalled();
  });

  it("la lista de admins del POS dice quién es admin (sin mayúsculas) y se guarda un minuto", async () => {
    listWebAdmins.mockResolvedValue([admin]);
    await expect(isPosAdminEmail(" gerencia@casaverde.com ")).resolves.toBe(true);
    await expect(isPosAdminEmail("cliente@correo.co")).resolves.toBe(false);
    await expect(isActivePosAdmin("d3b07384-0001")).resolves.toBe(true);
    await expect(isActivePosAdmin("clx-id-de-neon")).resolves.toBe(false);
    expect(listWebAdmins).toHaveBeenCalledTimes(1);

    // El aviso admin.upserted limpia la caché: el POS le quitó el acceso.
    clearPosAdminCache();
    listWebAdmins.mockResolvedValue([]);
    await expect(isActivePosAdmin("d3b07384-0001")).resolves.toBe(false);
  });

  it("si el POS no responde no se sabe quién es admin", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    listWebAdmins.mockRejectedValue(new Error("timeout"));
    await expect(isPosAdminEmail("gerencia@casaverde.com")).resolves.toBeNull();
    await expect(isActivePosAdmin("d3b07384-0001")).resolves.toBeNull();
  });
});
