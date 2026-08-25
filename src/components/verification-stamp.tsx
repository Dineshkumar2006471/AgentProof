type VerificationStampProps = {
  status?: "VERIFIED" | "CONDITIONAL" | "FAILED" | "BLOCKED";
  size?: number;
  animated?: boolean;
};

export function VerificationStamp({
  status = "VERIFIED",
  size = 150,
  animated = true,
}: VerificationStampProps) {
  const strokeColor =
    status === "VERIFIED"
      ? "var(--pass-moss)"
      : status === "CONDITIONAL"
      ? "var(--evidence-amber)"
      : "var(--fail-clay)";

  return (
    <div
      aria-label={`AgentProof ${status}`}
      className={animated ? "stamp-svg" : ""}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: "rotate(-7deg)" }}
      >
        {/* Outer dashed ring */}
        <circle
          className={animated ? "stamp-outer-ring" : ""}
          cx="50"
          cy="50"
          r="48"
          stroke={strokeColor}
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        {/* Inner ring */}
        <circle
          className={animated ? "stamp-inner-ring" : ""}
          cx="50"
          cy="50"
          r="38"
          stroke={strokeColor}
          strokeWidth="1.5"
        />
        {/* Check mark */}
        <path
          className={animated ? "stamp-check" : ""}
          d="M30 50L45 65L70 35"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="square"
        />
        {/* Top label */}
        <text
          className={animated ? "stamp-text" : ""}
          x="50"
          y="20"
          textAnchor="middle"
          fill={strokeColor}
          fontFamily="var(--font-mono)"
          fontSize="6"
          fontWeight="700"
          letterSpacing="0.1em"
        >
          AGENTPROOF
        </text>
        {/* Status label */}
        <text
          className={animated ? "stamp-text" : ""}
          x="50"
          y="88"
          textAnchor="middle"
          fill={strokeColor}
          fontFamily="var(--font-mono)"
          fontSize="7"
          fontWeight="700"
          letterSpacing="0.08em"
        >
          {status}
        </text>
      </svg>
    </div>
  );
}
