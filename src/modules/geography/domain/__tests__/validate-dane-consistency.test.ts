import { isDaneConsistent } from "@/modules/geography/domain/validate-dane-consistency";

describe("isDaneConsistent", () => {
  it("acepta municipio 08001 en departamento 08", () => {
    expect(isDaneConsistent("08001", "08")).toBe(true);
  });

  it("rechaza municipio 68001 en departamento 08", () => {
    expect(isDaneConsistent("68001", "08")).toBe(false);
  });

  it("acepta municipio 68001 en departamento 68", () => {
    expect(isDaneConsistent("68001", "68")).toBe(true);
  });

  it("no valida si falta DANE del municipio (null)", () => {
    expect(isDaneConsistent(null, "08")).toBe(true);
  });

  it("no valida si falta DANE del departamento (null)", () => {
    expect(isDaneConsistent("08001", null)).toBe(true);
  });

  it("no valida si ambos son null", () => {
    expect(isDaneConsistent(null, null)).toBe(true);
  });

  it("no valida si falta DANE del municipio (undefined)", () => {
    expect(isDaneConsistent(undefined, "08")).toBe(true);
  });

  it("rechaza municipio 11001 en departamento 05", () => {
    expect(isDaneConsistent("11001", "05")).toBe(false);
  });

  it("acepta municipio 11001 en departamento 11 (Bogotá)", () => {
    expect(isDaneConsistent("11001", "11")).toBe(true);
  });
});
