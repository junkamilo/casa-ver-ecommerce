import { registerSchema, ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/constants";

describe("registerSchema", () => {
  it("acepta datos válidos", () => {
    const result = registerSchema.safeParse({
      name: "Juan García",
      email: "juan@example.com",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza nombre con menos de 2 letras", () => {
    const result = registerSchema.safeParse({
      name: "J",
      email: "juan@example.com",
      password: "123456",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("El nombre debe tener al menos 2 letras");
    }
  });

  it("rechaza email con formato inválido", () => {
    const result = registerSchema.safeParse({
      name: "Juan",
      email: "no-es-email",
      password: "123456",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Ingresa un correo válido");
    }
  });

  it("rechaza contraseña con menos de 6 caracteres", () => {
    const result = registerSchema.safeParse({
      name: "Juan",
      email: "juan@example.com",
      password: "123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("La contraseña debe tener al menos 6 caracteres");
    }
  });

  it("rechaza campos vacíos", () => {
    const result = registerSchema.safeParse({ name: "", email: "", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("ERROR_MESSAGES", () => {
  it("tiene mensaje para error de login después de registro", () => {
    expect(ERROR_MESSAGES.loginAfterRegister).toBe(
      "Cuenta creada, pero hubo un error al iniciar sesión."
    );
  });

  it("tiene mensaje genérico de error", () => {
    expect(ERROR_MESSAGES.unexpected).toBe("Error al registrarse");
  });
});

describe("SUCCESS_MESSAGES", () => {
  it("tiene mensaje de cuenta creada", () => {
    expect(SUCCESS_MESSAGES.accountCreated).toBe(
      "¡Cuenta creada con éxito! Iniciando sesión..."
    );
  });
});
