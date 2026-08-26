/**
 * Verifica que el DANE del municipio (5 dígitos) sea consistente con el del
 * departamento (2 dígitos). "08001" pertenece al departamento "08".
 * Si alguno de los dos es null/undefined, no hay nada que verificar (retorna true).
 */
export function isDaneConsistent(
  municipalityDane: string | null | undefined,
  departmentDane: string | null | undefined,
): boolean {
  if (!municipalityDane || !departmentDane) return true;
  return municipalityDane.slice(0, 2) === departmentDane;
}
