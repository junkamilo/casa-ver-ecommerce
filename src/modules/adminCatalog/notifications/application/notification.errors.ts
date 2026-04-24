export class NotificationUnauthorizedError extends Error {
  constructor(message = "No autorizado") {
    super(message);
    this.name = "NotificationUnauthorizedError";
  }
}
