import { ImageResponse } from "next/og";

export const alt = "AgentProof | AI Agent Verification and Testing";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const runtime = "nodejs";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://agent-proof.dev";
const logoUrl = new URL("/icon.png", siteUrl).toString();

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#ffffff",
          color: "#121827",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "48px 64px 52px",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#192c52",
            height: 12,
            left: 0,
            position: "absolute",
            top: 0,
            width: "100%",
          }}
        />
        <div style={{ alignItems: "center", display: "flex", gap: 18 }}>
          <img alt="" src={logoUrl} style={{ height: 58, objectFit: "contain", width: 58 }} />
          <span style={{ color: "#192c52", fontSize: 30, fontWeight: 700 }}>
            AGENTPROOF
          </span>
          <span style={{ background: "#eaf6f4", border: "1px solid #b6ded7", color: "#0d8c80", fontSize: 20, fontWeight: 700, marginLeft: "auto", padding: "10px 16px" }}>
            AI AGENT VERIFICATION
          </span>
        </div>

        <div style={{ alignItems: "center", display: "flex", flex: 1, gap: 58 }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
            <span style={{ color: "#192c52", fontSize: 24, fontWeight: 700 }}>
              AGENTPROOF
            </span>
            <span style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.03, marginTop: 18 }}>
              PROVE YOUR AI AGENT
            </span>
            <span style={{ color: "#4c5b73", fontSize: 30, lineHeight: 1.35, marginTop: 24 }}>
              Turn promises into executable tests and verifiable reliability evidence.
            </span>
          </div>
          <div
            style={{
              alignItems: "center",
              background: "#f4f7fb",
              border: "1px solid #d7e0ee",
              display: "flex",
              height: 250,
              justifyContent: "center",
              marginLeft: "auto",
              width: 250,
            }}
          >
            <img alt="" src={logoUrl} style={{ height: 184, objectFit: "contain", width: 184 }} />
          </div>
        </div>

        <div style={{ alignItems: "center", borderTop: "1px solid #d7e0ee", display: "flex", paddingTop: 24 }}>
          <span style={{ color: "#192c52", fontSize: 22, fontWeight: 700 }}>agent-proof.dev</span>
          <span style={{ color: "#f08a24", fontSize: 22, fontWeight: 700, marginLeft: "auto" }}>VERIFY WITH EVIDENCE</span>
        </div>
      </div>
    ),
    size,
  );
}
