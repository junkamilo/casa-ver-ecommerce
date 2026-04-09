/** Duración en ms de las notificaciones toast */
export const TOAST_DURATION = 4000;

/**
 * Mensajes de error para las operaciones del perfil.
 * Centralizados aquí para evitar strings dispersos.
 */
export const ERROR_MESSAGES = {
  load:            "Error al cargar perfil",
  saveName:        "Error al actualizar nombre",
  passwordMismatch: "Las contraseñas no coinciden",
  changePassword:  "Error al cambiar contraseña",
  connection:      "Error de conexión",
} as const;

export const SUCCESS_MESSAGES = {
  nameSaved:       "Nombre actualizado",
  passwordChanged: "Contraseña actualizada correctamente",
} as const;
