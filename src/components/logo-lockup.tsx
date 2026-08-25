import Image from "next/image";

type LogoLockupProps = {
  compact?: boolean;
  inverted?: boolean;
};

export function LogoLockup({ compact = false, inverted = false }: LogoLockupProps) {
  return (
    <div aria-label="AgentProof" style={{ alignItems: "center", display: "flex" }}>
      <Image
        alt="AgentProof"
        height={compact ? 28 : 36}
        priority
        src="/logo-agentproof.png"
        style={{
          filter: inverted ? "invert(1)" : undefined,
          mixBlendMode: inverted ? undefined : "multiply",
        }}
        width={compact ? 129 : 165}
      />
    </div>
  );
}
