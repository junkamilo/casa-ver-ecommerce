export const TOAST_DURATION = 3000;

export const ERROR_MESSAGES = {
  duplicate: "La categoría ya existe",
  create: "Error al crear",
  edit: "Error al actualizar",
  toggle: "No se pudo actualizar la categoría",
  load: "Error al cargar categorías",
  unknown: "Error desconocido",
} as const;

export const SUCCESS_MESSAGES = {
  created: "Categoría creada correctamente",
  updated: "Categoría actualizada correctamente",
  deactivated: "Categoría desactivada",
  activated: "Categoría activada",
} as const;
