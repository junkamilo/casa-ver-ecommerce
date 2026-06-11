export const BOLD_PENDING_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutos

export type BoldActionDecision = "MARK_PAID" | "MARK_FAILED" | "NO_ACTION";

export function determineOrderActionFromBoldStatus(boldStatus?: string): BoldActionDecision {
  if (!boldStatus) return "NO_ACTION";
  
  const statusUpper = boldStatus.toUpperCase();

  if (statusUpper === "PAID" || statusUpper === "APPROVED") {
    return "MARK_PAID";
  }
  
  if (statusUpper === "REJECTED" || statusUpper === "CANCELLED" || statusUpper === "EXPIRED") {
    return "MARK_FAILED";
  }
  
  return "NO_ACTION";
}