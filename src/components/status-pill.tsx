import type { VerificationStatus } from "@/lib/domain";

type StatusPillProps = {
  status: VerificationStatus;
};

export function StatusPill({ status }: StatusPillProps) {
  return (
    <span className={`status-pill status-${status.toLowerCase()}`}>
      {status}
    </span>
  );
}
