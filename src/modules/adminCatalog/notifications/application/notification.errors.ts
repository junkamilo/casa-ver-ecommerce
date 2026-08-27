export class NotificationUnauthorizedError extends Error {
  constructor(message = "No autorizado") {
    super(message);
    this.name = "NotificationUnauthorizedError";
  }
}

export class NotificationNotFoundError extends Error {
  constructor(message = "Notificación no encontrada") {
    super(message);
    this.name = "NotificationNotFoundError";
  }
}
