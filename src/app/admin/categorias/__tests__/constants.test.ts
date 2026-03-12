import { ERROR_MESSAGES, SUCCESS_MESSAGES, TOAST_DURATION } from "../constants/constants";

describe("constants", () => {
  it("ERROR_MESSAGES tiene las claves esperadas", () => {
    expect(ERROR_MESSAGES.duplicate).toBe("La categoría ya existe");
    expect(ERROR_MESSAGES.create).toBe("Error al crear");
    expect(ERROR_MESSAGES.edit).toBe("Error al actualizar");
    expect(ERROR_MESSAGES.toggle).toBe("No se pudo actualizar la categoría");
    expect(ERROR_MESSAGES.load).toBe("Error al cargar categorías");
    expect(ERROR_MESSAGES.unknown).toBe("Error desconocido");
  });

  it("SUCCESS_MESSAGES tiene las claves esperadas", () => {
    expect(SUCCESS_MESSAGES.created).toBe("Categoría creada correctamente");
    expect(SUCCESS_MESSAGES.updated).toBe("Categoría actualizada correctamente");
    expect(SUCCESS_MESSAGES.deactivated).toBe("Categoría desactivada");
    expect(SUCCESS_MESSAGES.activated).toBe("Categoría activada");
  });

  it("TOAST_DURATION es un número positivo", () => {
    expect(typeof TOAST_DURATION).toBe("number");
    expect(TOAST_DURATION).toBeGreaterThan(0);
  });
});
