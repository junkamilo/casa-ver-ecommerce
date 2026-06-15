export class PromoPopupValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromoPopupValidationError";
  }
}

export class PromoPopupNotFoundError extends Error {
  constructor(message = "Publicidad no encontrada") {
    super(message);
    this.name = "PromoPopupNotFoundError";
  }
}
