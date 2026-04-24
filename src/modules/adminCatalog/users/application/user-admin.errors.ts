export class UserAdminValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserAdminValidationError";
  }
}

export class UserAdminConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserAdminConflictError";
  }
}

export class UserAdminNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserAdminNotFoundError";
  }
}
