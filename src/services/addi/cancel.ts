// Re-export para preservar la API pública de @/services/addi/cancel.
// La fuente única ahora vive en modules/payments/addi.
//
// Mantiene la firma exacta { success: boolean, error?: string } que ya
// usan app/actions/orders.ts y adminCatalog/orders/orders.use-case.ts.
export { cancelAddiApplication } from "@/modules/payments/addi/application/cancel-addi-application.use-case";
export type { AddiCancelLowLevelResult as AddiCancelResult } from "@/modules/payments/addi/contracts/addi.dto";
