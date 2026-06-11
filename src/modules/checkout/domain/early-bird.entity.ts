import { EARLY_BIRD_DISCOUNT_PCT } from "@/lib/earlybird.constants";

// Predicados puros del dominio Early Bird. NO dependen de Prisma ni de IO.
//
// Se mantienen byte-a-byte las reglas que hoy aplica `createOrder`:
//   - El descuento se calcula sobre el subtotal real (server-side) usando
//     EARLY_BIRD_DISCOUNT_PCT y se redondea con Math.round.
//   - Un usuario es elegible si tiene el flag `earlyBirdDiscount === true`.

export function isUserEligibleForEarlyBird(user: { earlyBirdDiscount: boolean | null | undefined }): boolean {
  return user.earlyBirdDiscount === true;
}

export function calculateEarlyBirdDiscount(subtotal: number, isEligible: boolean): number {
  if (!isEligible) return 0;
  return Math.round((subtotal * EARLY_BIRD_DISCOUNT_PCT) / 100);
}
