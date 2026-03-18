export const TOAST_DURATION = 4000;

export const ERROR_MESSAGES = {
  load: "Error al cargar perfil",
  saveName: "Error al actualizar nombre",
  passwordMismatch: "Las contraseñas no coinciden",
  changePassword: "Error al cambiar contraseña",
  connection: "Error de conexión",
} as const;

export const SUCCESS_MESSAGES = {
  nameSaved: "Nombre actualizado",
  passwordChanged: "Contraseña actualizada correctamente",
} as const;

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
