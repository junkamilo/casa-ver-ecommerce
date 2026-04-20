export const TOAST_DURATION = 4000;

export const ERROR_MESSAGES = {
  load:      "No se pudieron cargar los colores",
  create:    "No se pudo crear el color",
  edit:      "No se pudo actualizar el color",
  delete:    "No se pudo eliminar el color",
  toggle:    "No se pudo cambiar el estado del color",
  duplicate: "Ya existe un color con ese nombre",
  unknown:   "Ocurrió un error inesperado",
};

export const SUCCESS_MESSAGES = {
  created:     "Color creado correctamente",
  updated:     "Color actualizado correctamente",
  deleted:     "Color eliminado correctamente",
  activated:   "Color activado — ya aparece en el formulario de productos",
  deactivated: "Color desactivado — ya no aparece en el formulario de productos",
};

export const SUGGESTED_COLORS = [
  "#E53935", "#1A237E", "#F5F5F5", "#1C1C1C", "#87CEEB",
  "#FFF176", "#795548", "#D4B896", "#C2B280", "#F8BBD9",
  "#4B5320", "#722F37", "#A8D5A2", "#C0652B", "#046307",
  "#FB8C00", "#9E9E9E", "#154734", "#C19A6B",
];
