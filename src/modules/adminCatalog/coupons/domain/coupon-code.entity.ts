import { randomBytes } from "crypto";

const CODE_LENGTH = 12;
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const MAX_COLLISION_RETRIES = 5;

export function generateCouponCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARSET[bytes[i]! % CHARSET.length];
  }
  return code;
}

export function isValidCouponCodeFormat(code: string): boolean {
  return /^[A-Z0-9]{12}$/.test(code);
}

export function isValidCustomCouponCodeFormat(code: string): boolean {
  return /^[A-Z0-9-]{4,20}$/.test(code);
}

export function normalizeCouponCode(code: string): string {
  return code.toUpperCase().trim();
}

export { CODE_LENGTH, CHARSET, MAX_COLLISION_RETRIES };
