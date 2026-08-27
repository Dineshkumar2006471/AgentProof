import type { VerificationStatus } from "@/lib/domain";

type StatusPillProps = {
  status: VerificationStatus;
};

export function StatusPill({ status }: StatusPillProps) {
  let colorClass = "neutral";
  if (status === "VERIFIED") colorClass = "pass";
  if (status === "BLOCKED" || status === "FAILED") colorClass = "fail";
  if (status === "CONDITIONAL") colorClass = "warn";

  return (
    <span className={`status-pill status-pill--${colorClass}`}>
      {status}
    </span>
  );
}
