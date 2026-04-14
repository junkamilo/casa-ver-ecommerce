export const TOAST_DURATION = 3500;

export const ERROR_MESSAGES = {
  duplicate: "Este tipo de prenda ya existe",
  create: "Error al crear el tipo de prenda",
  edit: "Error al actualizar el tipo de prenda",
  delete: "Error al eliminar el tipo de prenda",
  toggle: "No se pudo actualizar el estado",
  load: "Error al cargar los tipos de prenda",
  unknown: "Error desconocido",
} as const;

export const SUCCESS_MESSAGES = {
  created: "Tipo de prenda creado",
  updated: "Tipo de prenda actualizado",
  deleted: "Tipo de prenda eliminado",
  deactivated: "Tipo de prenda desactivado",
  activated: "Tipo de prenda activado",
} as const;
