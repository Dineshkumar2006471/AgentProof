import Link from "next/link";
import { Plus } from "lucide-react";
import { LogoLockup } from "@/components/logo-lockup";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="page-shell">
      <header className="app-topbar">
        <div
          className="floating-nav-main"
          style={{
            justifyContent: "space-between",
            borderBottom: "none",
          }}
        >
          <Link href="/dashboard">
            <LogoLockup compact />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link
              href="/dashboard"
              style={{
                color: "var(--ink-graphite)",
                textTransform: "uppercase",
                position: "relative",
              }}
            >
              Dashboard
            </Link>
            <Link href="/agents/new" className="button">
              <Plus size={15} strokeWidth={2.5} />
              New Agent
            </Link>
          </div>
        </div>
      </header>
      <div className="app-main">{children}</div>
    </main>
  );
}
