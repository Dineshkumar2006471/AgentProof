"use client";

import {
  BadgeDollarSign,
  Bot,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoLockup } from "@/components/logo-lockup";

type WorkspaceIdentity = {
  name?: string;
  username?: string;
  email?: string;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard#agents", label: "Agents", icon: Bot },
  { href: "/pricing", label: "Plans & usage", icon: BadgeDollarSign }
];

export function WorkspaceNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [identity, setIdentity] = useState<WorkspaceIdentity | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload: { user?: WorkspaceIdentity } | null) => {
        if (mounted && payload?.user) setIdentity(payload.user);
      })
      .catch(() => undefined);
    return () => { mounted = false; };
  }, []);

  const accountName = identity?.name?.trim() || identity?.username?.trim() || identity?.email?.split("@")[0] || "Account";
  const accountEmail = identity?.email || (identity?.username?.includes("@") ? identity.username : "Signed-in account");
  const initials = accountName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "A";

  function isActive(href: string) {
    if (href.includes("#")) return false;
    const path = href.split("#")[0];
    return pathname === path || (path !== "/dashboard" && pathname.startsWith(path + "/"));
  }

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <>
      <button type="button" className="workspace-mobile-toggle" aria-label={open ? "Close workspace navigation" : "Open workspace navigation"} aria-expanded={open} onClick={() => setOpen((current) => !current)}>
        {open ? <X size={19} /> : <Menu size={19} />}
      </button>
      {open && <button type="button" aria-label="Close workspace navigation" className="workspace-nav-overlay" onClick={() => setOpen(false)} />}
      <aside className={`workspace-sidebar ${open ? "is-open" : ""}`}>
        <Link href="/" aria-label="AgentProof home" className="workspace-sidebar__brand" onClick={() => setOpen(false)}>
          <LogoLockup compact />
        </Link>

        <div className="workspace-sidebar__section-label">Workspace</div>
        <nav className="workspace-sidebar__nav" aria-label="Workspace navigation">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className={`workspace-nav-item ${isActive(href) ? "is-active" : ""}`}>
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          ))}
          <Link href="/agents/new" onClick={() => setOpen(false)} className={`workspace-nav-item ${pathname === "/agents/new" ? "is-active" : ""}`}>
            <Bot size={17} strokeWidth={1.8} />
            <span>New agent</span>
          </Link>
        </nav>

        <div className="workspace-sidebar__section-label workspace-sidebar__section-label--secondary">Account</div>
        <nav className="workspace-sidebar__nav" aria-label="Account navigation">
          <Link href="/profile" onClick={() => setOpen(false)} className={`workspace-nav-item ${pathname === "/profile" ? "is-active" : ""}`}>
            <Settings2 size={17} strokeWidth={1.8} />
            <span>Profile settings</span>
          </Link>
        </nav>

        <div className="workspace-sidebar__footer">
          <div className="workspace-account-summary">
            <span className="workspace-avatar" aria-hidden="true">{initials}</span>
            <span><strong>{accountName}</strong><small>{accountEmail}</small></span>
          </div>
          <button type="button" disabled={signingOut} onClick={signOut} className="workspace-signout">
            <LogOut size={16} />
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>
    </>
  );
}
