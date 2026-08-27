import Link from "next/link";
import { ProfileMenu } from "@/components/profile-menu";
import { WorkspaceNav } from "@/components/workspace-nav";

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  section?: string;
};

export function AppShell({ children, title = "Workspace", section = "AGENTPROOF" }: AppShellProps) {
  return (
    <div className="workspace-shell">
      <WorkspaceNav />
      <div className="workspace-main">
        <header className="workspace-topbar">
          <div className="workspace-topbar__context">
            <Link href="/" className="workspace-topbar__mobile-brand" aria-label="AgentProof home">AP</Link>
            <div><span className="eyebrow">{section}</span><h1>{title}</h1></div>
          </div>
          <div className="workspace-topbar__actions">
            <span className="workspace-live-status"><i aria-hidden="true" /> Live workspace</span>
            <ProfileMenu />
          </div>
        </header>
        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}
