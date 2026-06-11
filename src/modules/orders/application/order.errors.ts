export class OrderNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderNotFoundError";
  }
}
