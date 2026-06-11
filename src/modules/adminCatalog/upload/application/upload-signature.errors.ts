export class UploadSignatureConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadSignatureConfigError";
  }
}
