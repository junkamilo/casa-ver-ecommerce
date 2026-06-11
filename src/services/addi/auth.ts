// Re-export para preservar la API pública de @/services/addi/auth.
// La fuente única ahora vive en modules/payments/addi.
export { getAddiToken } from "@/modules/payments/addi/infrastructure/addi-token.service";
