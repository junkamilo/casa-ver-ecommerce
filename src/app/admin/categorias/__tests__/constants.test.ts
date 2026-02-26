import { ERROR_MESSAGES, SUCCESS_MESSAGES, TOAST_DURATION, DELETE_CONFIRM_MSG } from "../constants/constants";

describe("constants", () => {
  it("ERROR_MESSAGES tiene las claves esperadas", () => {
    expect(ERROR_MESSAGES.duplicate).toBe("La categoría ya existe");
    expect(ERROR_MESSAGES.create).toBe("Error al crear");
    expect(ERROR_MESSAGES.delete).toBe("No se pudo eliminar");
    expect(ERROR_MESSAGES.load).toBe("Error al cargar categorías");
    expect(ERROR_MESSAGES.unknown).toBe("Error desconocido");
  });

  it("SUCCESS_MESSAGES tiene las claves esperadas", () => {
    expect(SUCCESS_MESSAGES.created).toBe("Categoría creada correctamente");
    expect(SUCCESS_MESSAGES.deleted).toBe("Categoría eliminada");
  });

  it("TOAST_DURATION es un número positivo", () => {
    expect(typeof TOAST_DURATION).toBe("number");
    expect(TOAST_DURATION).toBeGreaterThan(0);
  });

  it("DELETE_CONFIRM_MSG es un string", () => {
    expect(typeof DELETE_CONFIRM_MSG).toBe("string");
    expect(DELETE_CONFIRM_MSG.length).toBeGreaterThan(0);
  });
});
