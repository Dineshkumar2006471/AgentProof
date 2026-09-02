import type { VerificationStatusRecord } from "@/lib/domain";

export function isEligibleForBadge(report: Pick<VerificationStatusRecord, "status" | "validUntil"> | null | undefined, now = Date.now()) {
  return report?.status === "VERIFIED" && Number.isFinite(Date.parse(report.validUntil)) && Date.parse(report.validUntil) > now;
}
