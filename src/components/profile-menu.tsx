"use client";

import { LogOut, UserCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { resetAnalytics } from "@/lib/analytics";


type ProfileIdentity = {
  name?: string;
  username?: string;
  email?: string;
};

type ProfileMenuProps = {
  user?: ProfileIdentity | null;
  hideIfSignedOut?: boolean;
};

export function ProfileMenu({ user, hideIfSignedOut = false }: ProfileMenuProps = {}) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [fetchedIdentity, setFetchedIdentity] = useState<ProfileIdentity | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const identity = user !== undefined ? user : fetchedIdentity;
  const checked = user !== undefined ? true : hasFetched;

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (user !== undefined) return;

    let mounted = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { user?: ProfileIdentity } | null) => {
        if (mounted) {
          setFetchedIdentity(payload?.user ?? null);
          setHasFetched(true);
        }
      })
      .catch(() => {
        if (mounted) setHasFetched(true);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  if (hideIfSignedOut && checked && !identity) {
    return null;
  }

  const accountName = identity?.name?.trim() || identity?.email?.split("@")[0]?.trim() || identity?.username?.trim() || "Account";

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const response = await fetch("/api/auth/sign-out", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      resetAnalytics();
      if (data?.cognitoLogoutUrl) {
        window.location.assign(data.cognitoLogoutUrl);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      resetAnalytics();
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Open profile menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 items-center gap-2 rounded-full border border-[var(--color-outline-variant)] bg-white px-2.5 text-[var(--color-seal-indigo)] transition-colors hover:border-[var(--color-seal-indigo)] hover:bg-[var(--color-surface-container)] focus:outline-none focus:ring-2 focus:ring-[var(--color-seal-indigo)] focus:ring-offset-2 shadow-sm"
      >
        <UserCircle size={18} strokeWidth={1.8} />
        <span className="hidden sm:inline font-data-label text-xs font-bold uppercase text-[var(--color-ink-graphite)] max-w-[120px] truncate">
          {accountName}
        </span>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-56 border border-[var(--color-ink-graphite)] bg-[var(--color-paper-cream)] p-2 shadow-[4px_4px_0_var(--color-ink-graphite)]">
          <div className="border-b border-[var(--color-outline-variant)] px-3 py-2">
            <span className="eyebrow">ACCOUNT</span>
            <p className="mono mt-1 truncate text-[var(--color-on-surface-variant)] text-xs" title={accountName}>{accountName}</p>
            {identity?.email && <p className="mono mt-0.5 truncate text-[var(--color-on-surface-variant)] text-[10px] opacity-75" title={identity.email}>{identity.email}</p>}
          </div>
          <Link role="menuitem" href="/dashboard" onClick={() => setOpen(false)} className="mt-2 block px-3 py-2 font-data-label text-xs uppercase text-[var(--color-ink-graphite)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-seal-indigo)]">
            Dashboard
          </Link>
          <Link role="menuitem" href="/profile" onClick={() => setOpen(false)} className="mt-1 block px-3 py-2 font-data-label text-xs uppercase text-[var(--color-ink-graphite)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-seal-indigo)]">
            Profile Settings
          </Link>
          <button role="menuitem" type="button" disabled={signingOut} onClick={handleSignOut} className="mt-1 flex w-full items-center gap-2 px-3 py-2 text-left font-data-label text-xs uppercase text-[var(--color-fail-clay)] hover:bg-[var(--color-surface-container)] disabled:cursor-wait disabled:opacity-60">
            <LogOut size={14} />
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
