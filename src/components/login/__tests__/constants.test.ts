import { loginSchema, ERROR_MESSAGES } from "../constants/constants";

describe("loginSchema", () => {
  it("acepta email y contraseña válidos", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "123456" });
    expect(result.success).toBe(true);
  });

  it("rechaza email con formato inválido", () => {
    const result = loginSchema.safeParse({ email: "no-es-email", password: "123456" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Ingresa un correo válido");
    }
  });

  it("rechaza contraseña con menos de 6 caracteres", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("La contraseña debe tener al menos 6 caracteres");
    }
  });

  it("rechaza email vacío", () => {
    const result = loginSchema.safeParse({ email: "", password: "123456" });
    expect(result.success).toBe(false);
  });

  it("rechaza contraseña vacía", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("ERROR_MESSAGES", () => {
  it("tiene mensaje para credenciales inválidas", () => {
    expect(ERROR_MESSAGES.invalidCredentials).toBe("Correo o contraseña incorrectos");
  });

  it("tiene mensaje para error inesperado", () => {
    expect(ERROR_MESSAGES.unexpected).toBe("Ocurrió un error inesperado");
  });
});
