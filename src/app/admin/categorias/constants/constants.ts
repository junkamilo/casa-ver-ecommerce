export const TOAST_DURATION = 3000;

export const ERROR_MESSAGES = {
  duplicate: "La categoría ya existe",
  create: "Error al crear",
  delete: "No se pudo eliminar",
  load: "Error al cargar categorías",
  unknown: "Error desconocido",
} as const;

export const SUCCESS_MESSAGES = {
  created: "Categoría creada correctamente",
  deleted: "Categoría eliminada",
} as const;

export const DELETE_CONFIRM_MSG =
  "¿Estás seguro? Esto podría afectar productos asociados.";
