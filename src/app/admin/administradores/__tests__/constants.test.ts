import { generatePassword, formatDate, PASSWORD_CHARS, TOAST_DURATION } from "../constants/constants";

describe("generatePassword", () => {
  it("genera una contraseña de 12 caracteres", () => {
    expect(generatePassword()).toHaveLength(12);
  });

  it("solo contiene caracteres del conjunto definido", () => {
    const pwd = generatePassword();
    for (const char of pwd) {
      expect(PASSWORD_CHARS).toContain(char);
    }
  });

  it("genera contraseñas distintas en llamadas consecutivas", () => {
    const passwords = new Set(Array.from({ length: 10 }, () => generatePassword()));
    expect(passwords.size).toBeGreaterThan(1);
  });
});

describe("formatDate", () => {
  it("formatea una fecha ISO en formato legible", () => {
    const result = formatDate("2024-01-15T10:00:00Z");
    expect(result).toMatch(/ene|jan/i);
    expect(result).toMatch(/2024/);
  });

  it("incluye el día en el resultado", () => {
    const result = formatDate("2024-03-07T00:00:00Z");
    expect(result).toMatch(/[67]/); // puede ser 6 o 7 según timezone
  });
});

describe("TOAST_DURATION", () => {
  it("es un número positivo", () => {
    expect(typeof TOAST_DURATION).toBe("number");
    expect(TOAST_DURATION).toBeGreaterThan(0);
  });
});
